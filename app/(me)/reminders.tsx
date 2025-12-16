import taskApi, { Reminder } from "@/api/taskApi";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

export default function Reminders() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  // Use the API type directly if possible, or map it.
  // API has { id, remindAt }. This matches what we need roughly.
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const [editingReminderId, setEditingReminderId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (taskId) {
      fetchReminders();
    }
  }, [taskId]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getReminders(taskId);
      setReminders(data);
    } catch (error) {
      console.log("Error fetching reminders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      setLoading(true);
      await taskApi.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete reminder");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = () => {
    setEditingReminderId(null);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setShowDatePicker(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminderId(reminder.id);
    const date = dayjs(reminder.remindAt).toDate();
    setSelectedDate(date);
    setSelectedTime(date);
    setShowDatePicker(true);
  };

  // Helper for UI display
  const formatReminderDisplay = (dateStr: string) => {
    return dayjs(dateStr).format("HH:mm DD MMM, YYYY");
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
      if (event.type === "set" && date) {
        setSelectedTime(date);
        saveReminder(date); // Pass time directly for Android flow
      }
    } else {
      if (date) {
        setSelectedTime(date);
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
    saveReminder();
  };

  const saveReminder = async (androidTime?: Date) => {
    if (!taskId) return;

    // Combine date and time
    // For iOS we use state selectedDate and selectedTime. For Android we might have passed it.
    const datePart = dayjs(selectedDate);
    const timeToUse = androidTime || selectedTime;
    const timePart = dayjs(timeToUse);

    const finalDate = datePart
      .hour(timePart.hour())
      .minute(timePart.minute())
      .second(0);

    // Format YYYY-MM-DD HH:mm:ss for backend
    const remindAt = finalDate.format("YYYY-MM-DD HH:mm:ss");

    try {
      setLoading(true);
      if (editingReminderId) {
        await taskApi.updateReminder(editingReminderId, remindAt);
        Alert.alert("Success", "Reminder updated");
      } else {
        await taskApi.createReminder(taskId, remindAt);
        Alert.alert("Success", "Reminder created");
      }
      fetchReminders(); // Refresh list to get ID
      setEditingReminderId(null); // Reset
    } catch (error) {
      Alert.alert(
        "Error",
        editingReminderId
          ? "Failed to update reminder"
          : "Failed to create reminder"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
    setEditingReminderId(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />

        <Appbar.Content
          title="Reminders"
          titleStyle={{
            fontSize: 16,
            color: "#FFFFFF",
            fontFamily: "Poppins_400Regular",
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <Pressable onPress={handleAddReminder} style={styles.addButton}>
              <Ionicons name="add" size={18} color="#90717E" />
            </Pressable>
          </View>

          {/* Reminders List */}
          {reminders.length > 0 && (
            <View style={styles.remindersList}>
              {reminders.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  style={styles.reminderItem}
                  onPress={() => handleEditReminder(reminder)}
                >
                  <View style={styles.reminderInfo}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color="#92AAA5"
                      style={styles.clockIcon}
                    />
                    <Text style={styles.reminderText}>
                      {formatReminderDisplay(reminder.remindAt)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteReminder(reminder.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="close" size={18} color="#90717E" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {Platform.OS === "ios" && showDatePicker && (
        <Modal transparent animationType="fade" visible={showDatePicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select date</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                onChange={handleDateChange}
              />
              <View style={styles.modalButtons}>
                <Pressable onPress={handleCancel} style={styles.modalButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleDateConfirm}
                  style={[styles.modalButton, styles.okButton]}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker Modal */}
      {Platform.OS === "ios" && showTimePicker && (
        <Modal transparent animationType="fade" visible={showTimePicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select time</Text>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
              <View style={styles.modalButtons}>
                <Pressable onPress={handleCancel} style={styles.modalButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleTimeConfirm}
                  style={[styles.modalButton, styles.okButton]}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EFF0",
  },
  header: {
    backgroundColor: "#90717E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#F8F6F7",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  section: {
    backgroundColor: "#F8F6F7",
    padding: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
  },
  addButton: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  remindersList: {
    gap: 5,
  },
  reminderItem: {
    backgroundColor: "#F2EFF0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 5,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  clockIcon: {
    marginRight: 5,
  },
  reminderText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#0F0C0D",
  },
  deleteButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  okButton: {
    backgroundColor: "#E8DEF8",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#6750A4",
  },
  okButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#6750A4",
  },
});
