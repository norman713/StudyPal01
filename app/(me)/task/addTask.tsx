import ErrorModal from "@/components/modal/error";
import SuccessModal from "@/components/modal/success";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import taskApi, { TaskPriority } from "../../../api/taskApi";

type TPriority = "high" | "medium" | "low";

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  // Default values: Current date and time
  const now = dayjs();
  const [taskName, setTaskName] = useState(""); // Empty initially
  const [taskNote, setTaskNote] = useState("");

  const [fromTime, setFromTime] = useState(now.format("HH:mm"));
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(dayjs().add(7, "day").toDate());

  const nextHour = now.add(1, "hour");
  const [toTime, setToTime] = useState(nextHour.format("HH:mm"));

  const [priority, setPriority] = useState<TPriority>("medium"); // Default medium
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle DateTimePicker visibility
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Format time input to HH:mm format

  const formatDateDisplay = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const handleSave = async () => {
    if (!taskName.trim()) {
      setErrorMessage("Please enter a task name.");
      setShowErrorModal(true);
      return;
    }
    try {
      setIsLoading(true);

      // Payload cho API request, định dạng startDate và dueDate theo chuẩn "YYYY-MM-DD HH:mm:ss"
      const payload = {
        content: taskName,
        startDate: `${dayjs(fromDate).format("YYYY-MM-DD")} ${fromTime}:00`,
        dueDate: `${dayjs(toDate).format("YYYY-MM-DD")} ${toTime}:00`,
        priority: priority.toUpperCase() as TaskPriority,
        note: taskNote,
      };

      console.log("[DEBUG] Saving task payload:", payload);
      console.log("[DEBUG] From Time:", fromTime);
      console.log("[DEBUG] To Time:", toTime);
      // Gửi request đến API để tạo task
      const response = await taskApi.createTask(payload);

      console.log("[DEBUG] API Response:", response);
      setIsModalVisible(true); // Hiển thị modal thành công
    } catch (error: any) {
      let apiMessage = "Failed to create task. Please try again.";

      // Xử lý lỗi từ API
      if (error?.response?.data) {
        if (typeof error.response.data.message === "string") {
          apiMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
          apiMessage = error.response.data.message.join("\n");
        } else {
          console.error("[DEBUG] Full error.data:", error.response.data);
        }
      } else if (error?.message) {
        apiMessage = error.message;
      }

      console.error("[DEBUG] Failed to create task:", apiMessage);

      setErrorMessage(apiMessage);
      setShowErrorModal(true); // Hiển thị modal lỗi
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* Header */}
      <Appbar.Header mode="small" style={styles.header}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />
        <Appbar.Content title="Add new task" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Add task detail  */}
        <View className="bg-white p-4 gap-2">
          {/* Task Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task name</Text>
            <TextInput
              style={styles.input}
              value={taskName}
              onChangeText={setTaskName}
              placeholder="Enter task name"
            />
          </View>
          {/* Task Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task note (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={taskNote}
              onChangeText={setTaskNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {/* From Time and Date */}
          <View style={styles.row}>
            {/* From Time */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>From time</Text>
              <Pressable onPress={() => setShowFromTimePicker(true)}>
                <Text style={styles.input}>{fromTime}</Text>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </Pressable>

              {showFromTimePicker && (
                <DateTimePicker
                  value={dayjs(
                    `${fromDate} ${fromTime}`,
                    "DD-MM-YYYY HH:mm"
                  ).toDate()}
                  mode="time"
                  display="spinner"
                  is24Hour={true}
                  onChange={(event, selectedTime) => {
                    setShowFromTimePicker(false);
                    if (selectedTime) {
                      // Thêm giây mặc định là 00
                      const fullTime = `${selectedTime.getHours().toString().padStart(2, "0")}:${selectedTime
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}:00`;
                      setFromTime(fullTime);
                    }
                  }}
                />
              )}
            </View>

            {/* From Date */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                mode="outlined"
                label="From date"
                value={formatDateDisplay(fromDate)}
                editable={false}
                outlineStyle={{ borderRadius: 999 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#49454F"
                      />
                    )}
                    onPress={() => setShowFromDatePicker(true)}
                  />
                }
              />
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFromDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setFromDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* To Time and Date */}
          <View style={styles.row}>
            {/* To Time */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To time</Text>
              <Pressable onPress={() => setShowToTimePicker(true)}>
                <Text style={styles.input}>{toTime}</Text>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </Pressable>

              {showToTimePicker && (
                <DateTimePicker
                  value={dayjs(
                    `${toDate} ${toTime}`,
                    "DD-MM-YYYY HH:mm"
                  ).toDate()}
                  mode="time"
                  display="spinner"
                  is24Hour={true}
                  onChange={(event, selectedTime) => {
                    setShowToTimePicker(false);
                    if (selectedTime) {
                      const fullTime = `${selectedTime.getHours().toString().padStart(2, "0")}:${selectedTime
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}:00`;
                      setToTime(fullTime);
                    }
                  }}
                />
              )}
            </View>

            {/* To Date */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                mode="outlined"
                label="To date"
                value={formatDateDisplay(toDate)}
                editable={false}
                outlineStyle={{ borderRadius: 999 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#49454F"
                      />
                    )}
                    onPress={() => setShowToDatePicker(true)}
                  />
                }
              />
              {showToDatePicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowToDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setToDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text className="text-white text-lg font-PoppinsRegular">Save</Text>
        </Pressable>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={isModalVisible}
        title="Success"
        message="Task created successfully!"
        confirmText="OK"
        onConfirm={() => router.back()}
      />
      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#90717E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
    backgroundColor: "#F8F6F7",
    marginBottom: 10,
  },
  taskId: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#92AAA5",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#0F0C0D",
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  inputWithIcon: {
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 8,
  },

  priorityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    backgroundColor: "#E6E6E6",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#1E1E1E",
  },
  menuItem: {
    backgroundColor: "#F8F6F7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#90717E",
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});
