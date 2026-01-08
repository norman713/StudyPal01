import taskApi, { PersonalTask, TaskPriority } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import SuccessModal from "@/components/modal/success";
import { convertSystemToUserTime } from "@/utils/timezone";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

type SuccessType = "UPDATE" | null;
export default function TaskDetail() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<PersonalTask | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);

  const [taskName, setTaskName] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [fromTime, setFromTime] = useState(dayjs().format("HH:mm"));
  const [fromDate, setFromDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [toTime, setToTime] = useState(dayjs().add(1, "hour").format("HH:mm"));
  const [toDate, setToDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [successType, setSuccessType] = useState<SuccessType>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case "HIGH":
        return "#FF5F57";
      case "MEDIUM":
        return "#FEBC2F";
      case "LOW":
        return "#27C840";
      default:
        return "#FEBC2F";
    }
  };

  // helpers show api error
  const showApiError = (error: any, fallback?: string) => {
    console.warn("API Error:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      fallback ||
      "Something went wrong";

    setErrorMessage(message);
    setShowErrorModal(true);
  };

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

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const data = await taskApi.getTaskDetail(taskId);
      console.log("Fetched Task Detail:", data);
      setTask(data);
      setTaskName(data.content);
      setTaskNote(data.note || "");

      const startDate = convertSystemToUserTime(data.startDate);
      const dueDate = convertSystemToUserTime(data.dueDate);

      setFromTime(startDate.format("HH:mm"));
      setFromDate(startDate.format("DD-MM-YYYY"));
      setToTime(dueDate.format("HH:mm"));
      setToDate(dueDate.format("DD-MM-YYYY"));
      setPriority(data.priority);
    } catch (error: any) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const handleCheckPress = () => {
    if (!task?.completedAt) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmComplete = async () => {
    if (!taskId) return;
    try {
      await taskApi.completeTask(taskId);
      setShowConfirmModal(false);
      fetchTaskDetail();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskId) return;

    // First, close the confirm modal
    setShowDeleteModal(false);

    // Check if task is CLONED
    if (task?.taskType === "CLONED") {
      // Ask for scope
      setTimeout(() => {
        setShowScopeModal(true);
      }, 300); // Small delay for modal transition
      return;
    }

    // Default delete
    await performDelete("CURRENT_ONLY");
  };

  const handleScopeDelete = async (scope: "CURRENT_ONLY" | "ALL_ITEMS") => {
    setShowScopeModal(false);
    await performDelete(scope);
  };

  const performDelete = async (scope: "CURRENT_ONLY" | "ALL_ITEMS") => {
    try {
      setLoading(true);
      await taskApi.deleteTask(taskId, scope);
      router.back();
    } catch (err: any) {
      console.warn("Failed to delete task", err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete task");
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  //handle save

  const handleSave = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const start = dayjs(`${fromDate} ${fromTime}`, "DD-MM-YYYY HH:mm").format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const due = dayjs(`${toDate} ${toTime}`, "DD-MM-YYYY HH:mm").format(
        "YYYY-MM-DD HH:mm:ss"
      );

      const payload = {
        content: taskName,
        note: taskNote,
        priority: priority,
        startDate: start,
        dueDate: due,
      };

      console.log("Update Task Payload:", JSON.stringify(payload, null, 2));

      await taskApi.updateTask(taskId, payload);
      setSuccessType("UPDATE");
      setShowSuccessModal(true);
    } catch (err: any) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container} className="justify-center items-center">
        <ActivityIndicator size="large" color="#90717E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={styles.header}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />

        <Appbar.Content title="Task detail" titleStyle={styles.headerTitle} />

        <FontAwesome5
          name="trash"
          size={24}
          color="white"
          onPress={handleDeletePress}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Task ID and Check */}
        <View className="bg-white p-4 gap-2">
          <View style={styles.taskHeader}>
            <Text style={styles.taskId}>{task?.taskCode || "..."}</Text>
            <Pressable
              onPress={handleCheckPress}
              style={[
                styles.checkButton,
                task?.completedAt && styles.checkButtonDone,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color={task?.completedAt ? "#F8F6F7" : "#F8F6F7"}
              />
            </Pressable>
          </View>

          <QuestionModal
            visible={showConfirmModal}
            title="Confirm"
            message="You want to confirm finish this task?"
            confirmText="Yes"
            cancelText="Cancel"
            onConfirm={handleConfirmComplete}
            onCancel={() => setShowConfirmModal(false)}
          />

          <QuestionModal
            visible={showDeleteModal}
            title="Confirm Delete"
            message="Are you sure you want to delete this task?"
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />

          <QuestionModal
            visible={showScopeModal}
            title="Recurring Task"
            message="Do you want to delete all recurring tasks?"
            confirmText="Yes, all"
            cancelText="No, only this"
            onConfirm={() => handleScopeDelete("ALL_ITEMS")}
            onCancel={() => handleScopeDelete("CURRENT_ONLY")}
          />

          {/* Task Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task name</Text>
            <TextInput
              style={styles.input}
              value={taskName}
              onChangeText={setTaskName}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityContainer}>
            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("HIGH")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "HIGH" && styles.radioSelected,
                  { borderColor: getPriorityColor("HIGH") },
                ]}
              >
                {priority === "HIGH" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("HIGH") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>High</Text>
            </Pressable>

            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("MEDIUM")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "MEDIUM" && styles.radioSelected,
                  { borderColor: getPriorityColor("MEDIUM") },
                ]}
              >
                {priority === "MEDIUM" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("MEDIUM") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>Medium</Text>
            </Pressable>

            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("LOW")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "LOW" && styles.radioSelected,
                  { borderColor: getPriorityColor("LOW") },
                ]}
              >
                {priority === "LOW" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("LOW") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>Low</Text>
            </Pressable>
          </View>
        </View>

        {/* Recurrence */}
        <Pressable
          style={styles.menuItem}
          onPress={() =>
            router.push({ pathname: "/(me)/recurrence", params: { taskId } })
          }
        >
          <Text style={styles.menuText}>Recurrence</Text>
          <Ionicons name="chevron-forward" size={18} color="#79747E" />
        </Pressable>
        {/* Reminders */}
        <Pressable
          style={styles.menuItem}
          onPress={() =>
            router.push({ pathname: "/(me)/reminders", params: { taskId } })
          }
        >
          <Text style={styles.menuText}>Reminders</Text>
          <Ionicons name="chevron-forward" size={18} color="#79747E" />
        </Pressable>

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </ScrollView>
      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        message={"Task updated successfully!"}
        confirmText="OK"
        onConfirm={() => {
          setShowSuccessModal(false);
        }}
      />

      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
      />
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
  deleteButton: {
    padding: 8,
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
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#A1AEB7",
    justifyContent: "center",
    alignItems: "center",
  },
  checkButtonDone: {
    backgroundColor: "#92AAA5",
    borderColor: "#92AAA5",
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
  section: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
    paddingHorizontal: 9,
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
    fontWeight: 700,
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
