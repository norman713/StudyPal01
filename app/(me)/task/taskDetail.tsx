import taskApi, { PersonalTask, TaskPriority } from "@/api/taskApi";
import QuestionModal from "@/components/modal/question";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<PersonalTask | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [taskName, setTaskName] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [fromTime, setFromTime] = useState(dayjs().format("HH:mm"));
  const [fromDate, setFromDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [toTime, setToTime] = useState(dayjs().add(1, "hour").format("HH:mm"));
  const [toDate, setToDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

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

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const data = await taskApi.getTaskDetail(taskId);
      setTask(data);
      setTaskName(data.content);
      setTaskNote(data.note || "");

      const startDate = new Date(data.startDate);
      const dueDate = new Date(data.dueDate);

      setFromTime(dayjs(startDate).format("HH:mm"));
      setFromDate(dayjs(startDate).format("DD-MM-YYYY"));
      setToTime(dayjs(dueDate).format("HH:mm"));
      setToDate(dayjs(dueDate).format("DD-MM-YYYY"));
      setPriority(data.priority);
    } catch (error) {
      console.warn("Failed to fetch task detail", error);
      Alert.alert("Error", "Failed to load task details");
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
    } catch (err) {
      console.warn("Failed to complete task", err);
      Alert.alert("Error", "Failed to complete task");
      setShowConfirmModal(false);
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

        {/* icon */}
        <View>
          <Pressable
            onPress={() => {
              /* TODO: handle delete */
            }}
          >
            <MaterialIcons name="delete" size={24} color="#F8F6F7" />
          </Pressable>
        </View>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Task ID and Check */}
        <View className="bg-white p-4 gap-2">
          <View style={styles.taskHeader}>
            <Text style={styles.taskId}>TSK-{task?.taskCode || "..."}</Text>
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
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>From time</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={fromTime}
                  onChangeText={setFromTime}
                />
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>From date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={fromDate}
                  onChangeText={setFromDate}
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

          {/* To Time and Date */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To time</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={toTime}
                  onChangeText={setToTime}
                />
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={toDate}
                  onChangeText={setToDate}
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
          <Text className="text-[16px] font-bold">Priority</Text>
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
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </ScrollView>
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
    backgroundColor: "#FEF7FF",
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
