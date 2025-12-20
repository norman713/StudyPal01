import ErrorModal from "@/components/modal/error";
import SuccessModal from "@/components/modal/success";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs"; // NEW
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import taskApi, { TaskPriority } from "../../../api/taskApi";

type TPriority = "high" | "medium" | "low";

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  // Default values: Current date and time
  const [taskName, setTaskName] = useState(""); // Empty initially
  const [taskNote, setTaskNote] = useState("");

  // states
  const now = dayjs();
  const [fromTime, setFromTime] = useState(now.format("HH:mm"));
  const [fromDate, setFromDate] = useState(now.format("DD-MM-YYYY"));

  const nextHour = now.add(1, "hour");
  const [toTime, setToTime] = useState(nextHour.format("HH:mm"));
  const [toDate, setToDate] = useState(nextHour.format("DD-MM-YYYY"));

  const [priority, setPriority] = useState<TPriority>("medium"); // Default medium
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Format time input to HH:mm format
  const formatTime = (text: string) => {
    const raw = text.replace(/\D/g, "").slice(0, 4);

    const hourRaw = raw.slice(0, 2);
    const minuteRaw = raw.slice(2, 4);

    // validate hour khi đủ 2 số
    if (hourRaw.length === 2) {
      const hour = Number(hourRaw);
      if (hour < 0 || hour > 23) return "";
    }

    // validate minute khi đủ 2 số
    if (minuteRaw.length === 2) {
      const minute = Number(minuteRaw);
      if (minute < 0 || minute > 59) return `${hourRaw}:`;
    }

    let result = hourRaw;

    if (raw.length > 2) {
      result += ":" + minuteRaw;
    }

    return result;
  };

  // Format date input to DD-MM-YYYY format
  const formatDate = (text: string) => {
    const raw = text.replace(/\D/g, "").slice(0, 8);

    const dayRaw = raw.slice(0, 2);
    const monthRaw = raw.slice(2, 4);
    const yearRaw = raw.slice(4, 8);

    // validate day khi đủ 2 số
    if (dayRaw.length === 2) {
      const day = Number(dayRaw);
      if (day < 1 || day > 31) return "";
    }

    // validate month khi đủ 2 số
    if (monthRaw.length === 2) {
      const month = Number(monthRaw);
      if (month < 1 || month > 12) return `${dayRaw}-`;
    }

    let result = dayRaw;

    if (raw.length > 2) {
      result += "-" + monthRaw;
    }

    if (raw.length > 4) {
      result += "-" + yearRaw;
    }

    // validate full date khi đủ 8 số
    if (raw.length === 8) {
      const day = Number(dayRaw);
      const month = Number(monthRaw);
      const year = Number(yearRaw);

      const maxDay = dayjs(`${year}-${month}-01`).daysInMonth();
      if (day > maxDay) return "";
    }

    return result;
  };

  const getPriorityColor = (p: TPriority) => {
    switch (p) {
      case "high":
        return "#FF5F57";
      case "medium":
        return "#FEBC2F";
      case "low":
        return "#27C840";
    }
  };

  const parseDateTime = (dateStr: string, timeStr: string) => {
    // dateStr: DD-MM-YYYY, timeStr: HH:mm
    return dayjs(`${dateStr} ${timeStr}`, "DD-MM-YYYY HH:mm");
  };

  const handleSave = async () => {
    // 1. Validate required fields
    if (!taskName.trim()) {
      setErrorMessage("Please enter a task name.");
      setShowErrorModal(true);
      return;
    }

    // 2. Validate Date/Time format (Simple regex or dayjs isValid)
    const startDateTime = parseDateTime(fromDate, fromTime);
    const endDateTime = parseDateTime(toDate, toTime);

    if (!startDateTime.isValid()) {
      setErrorMessage("Invalid Start Date or Time.");
      setShowErrorModal(true);
      return;
    }
    if (!endDateTime.isValid()) {
      setErrorMessage("Invalid End Date or Time.");
      setShowErrorModal(true);
      return;
    }

    // 3. Validate Logic: End > Start
    if (endDateTime.isBefore(startDateTime)) {
      setErrorMessage("End time must be after start time.");
      setShowErrorModal(true);
      return;
    }

    // 4. API Call
    try {
      setIsLoading(true);
      const payload = {
        content: taskName,
        startDate: startDateTime.format("YYYY-MM-DD HH:mm:ss"),
        dueDate: endDateTime.format("YYYY-MM-DD HH:mm:ss"),
        priority: priority.toUpperCase() as TaskPriority, // "high" -> "HIGH"
        note: taskNote,
      };

      console.log("Saving task payload:", payload);
      await taskApi.createTask(payload);

      setIsModalVisible(true); // Show modal on success
    } catch (error: any) {
      console.error("Failed to create task:", error);
      setIsModalVisible(false); // Close any previous modal if error occurs
      const msg =
        error?.response?.data?.message ||
        "Failed to create task. Please try again.";
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
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
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={fromTime}
                  onChangeText={(text) => setFromTime(formatTime(text))} // Format time as HH:mm
                  placeholder="HH:mm"
                  keyboardType="numeric"
                />
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>

            {/* From Date */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>From date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={fromDate}
                  onChangeText={(text) => setFromDate(formatDate(text))} // Format date as DD-MM-YYYY
                  placeholder="DD-MM-YYYY"
                  keyboardType="numeric"
                />
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            {/* To Time */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To time</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={toTime}
                  onChangeText={(text) => setToTime(formatTime(text))} // Format time as HH:mm
                  placeholder="HH:mm"
                  keyboardType="numeric"
                />
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>

            {/* To Date */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={toDate}
                  onChangeText={(text) => setToDate(formatDate(text))} // Format date as DD-MM-YYYY
                  placeholder="DD-MM-YYYY"
                  keyboardType="numeric"
                />
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Priority */}
        <View className="bg-white p-4 mb-4 mt-4">
          <Text className="text-[16px] font-PoppinsSemiBold">Priority</Text>
          <View className="flex-row justify-between mt-4">
            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("high")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "high" && styles.radioSelected,
                  { borderColor: getPriorityColor("high") },
                ]}
              >
                {priority === "high" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("high") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>High</Text>
            </Pressable>

            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("medium")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "medium" && styles.radioSelected,
                  { borderColor: getPriorityColor("medium") },
                ]}
              >
                {priority === "medium" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("medium") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>Medium</Text>
            </Pressable>

            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("low")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "low" && styles.radioSelected,
                  { borderColor: getPriorityColor("low") },
                ]}
              >
                {priority === "low" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("low") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>Low</Text>
            </Pressable>
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
