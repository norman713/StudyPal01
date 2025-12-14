import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Reminder = {
  id: string;
  date: string;
  time: string;
};

export default function Reminders() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", date: "12 Dec, 2025", time: "12:00" },
    { id: "2", date: "12 Dec, 2025", time: "12:00" },
    { id: "3", date: "12 Dec, 2025", time: "12:00" },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = () => {
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
        // Show time picker after date is selected
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
        // Save the reminder
        saveReminder();
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

  const saveReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const handleCancel = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8F6F7" />
        </Pressable>
        <Text style={styles.headerTitle}>Reminders</Text>
        <View style={{ width: 40 }} />
      </View>

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
                <View key={reminder.id} style={styles.reminderItem}>
                  <View style={styles.reminderInfo}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color="#92AAA5"
                      style={styles.clockIcon}
                    />
                    <Text style={styles.reminderText}>
                      {reminder.time} {reminder.date}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteReminder(reminder.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="close" size={18} color="#90717E" />
                  </Pressable>
                </View>
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
    </SafeAreaView>
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
