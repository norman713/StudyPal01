import ErrorModal from "@/components/modal/error";
import SuccessModal from "@/components/modal/success";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

import PrioritySelector from "@/app/(team)/plan/components/PrioritySelector";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import taskApi, { TaskPriority } from "../../../api/taskApi";

export default function TaskDetail() {
  const params = useLocalSearchParams();
  // Default values: Current date and time
  const now = dayjs();
  const [taskName, setTaskName] = useState(""); // Empty initially
  const [taskNote, setTaskNote] = useState("");

  const [fromTime, setFromTime] = useState(now.format("HH:mm"));
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(dayjs().add(7, "day").toDate());

  const nextHour = now.add(1, "hour");
  const [toTime, setToTime] = useState(nextHour.format("HH:mm"));

  const [priority, setPriority] = useState<TaskPriority>("MEDIUM"); // Default medium
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

      const payload = {
        content: taskName,
        startDate: `${dayjs(fromDate).format("YYYY-MM-DD")} ${fromTime}:00`,
        dueDate: `${dayjs(toDate).format("YYYY-MM-DD")} ${toTime}:00`,
        priority: priority.toUpperCase() as TaskPriority,
        note: taskNote,
      };

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
          <TextInput
            mode="outlined"
            label="Task name"
            theme={{
              roundness: 10,
              colors: {
                background: "#FFFFFF",
              },
            }}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Enter task name"
          />

          {/* Task Note */}
          <TextInput
            mode="outlined"
            label="Task note (optional)"
            theme={{
              roundness: 10,
              colors: {
                background: "#FFFFFF",
              },
            }}
            value={taskNote}
            onChangeText={setTaskNote}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
            style={{
              height: 140,
            }}
          />

          {/* From Time and Date */}
          <View style={styles.row}>
            {/* From Time */}
            <View>
              <TextInput
                mode="outlined"
                label="From time"
                value={fromTime}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                style={{ width: 130 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons name="time-outline" size={24} color="#49454F" />
                    )}
                    onPress={() => setShowFromTimePicker(true)}
                  />
                }
              />

              {showFromTimePicker && (
                <DateTimePicker
                  value={dayjs(fromDate)
                    .hour(Number(fromTime.split(":")[0]))
                    .minute(Number(fromTime.split(":")[1]))
                    .toDate()}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowFromTimePicker(false);
                    if (selected) {
                      setFromTime(dayjs(selected).format("HH:mm"));
                    }
                  }}
                />
              )}
            </View>

            {/* From Date */}
            <View style={[styles.halfWidth]}>
              <TextInput
                mode="outlined"
                label="From date"
                value={formatDateDisplay(fromDate)}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
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
            <View>
              <TextInput
                mode="outlined"
                label="To time"
                value={toTime}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                style={{ width: 130 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons name="time-outline" size={24} color="#49454F" />
                    )}
                    onPress={() => setShowToTimePicker(true)}
                  />
                }
              />

              {showToTimePicker && (
                <DateTimePicker
                  value={dayjs(toDate)
                    .hour(Number(toTime.split(":")[0]))
                    .minute(Number(toTime.split(":")[1]))
                    .toDate()}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowToTimePicker(false);
                    if (selected) {
                      setToTime(dayjs(selected).format("HH:mm"));
                    }
                  }}
                />
              )}
            </View>

            {/* To Date */}
            <View style={[styles.halfWidth]}>
              <TextInput
                mode="outlined"
                label="To date"
                value={formatDateDisplay(toDate)}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
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
        {/* Priority */}
        <View className="pt-3">
          <PrioritySelector
            priority={priority}
            onPriorityChange={setPriority}
          />
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

  row: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 10,
  },
  halfWidth: {
    flex: 1,
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
