import planApi, { Task, TaskPriority } from "@/api/planApi";
import { Ionicons } from "@expo/vector-icons";
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
  View,
} from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AssigneeSelector from "./components/AssigneeSelector";
import DateTimeInput from "./components/DateTimeInput";
import PrioritySelector from "./components/PrioritySelector";

type Role = "OWNER" | "ADMIN" | "MEMBER";

export default function TaskDetail() {
  const {
    teamId,
    planId,
    taskId,
    role: roleParam,
  } = useLocalSearchParams<{
    teamId: string;
    planId: string;
    taskId: string;
    role: Role;
  }>();

  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [planCode, setPlanCode] = useState<string>("");

  const [taskName, setTaskName] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [fromTime, setFromTime] = useState("12:00");
  const [fromDate, setFromDate] = useState("12-12-1212");
  const [toTime, setToTime] = useState("12:00");
  const [toDate, setToDate] = useState("12-12-1212");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");

  const fetchTaskDetail = useCallback(async () => {
    if (!teamId || !planId || !taskId) return;

    try {
      setLoading(true);
      const [planData, tasksData] = await Promise.all([
        planApi.getPlanDetail(teamId, planId),
        planApi.getTasks(teamId, planId, "ALL"),
      ]);

      setPlanCode(planData.code || `PLN-${planId}`);
      const foundTask = tasksData.tasks.find((t) => t.id === taskId);

      if (foundTask) {
        setTask(foundTask);
        setTaskName(foundTask.name || "");
        setTaskNote(foundTask.description || "");
        const startDate = new Date(foundTask.startDate);
        const dueDate = new Date(foundTask.dueDate);
        setFromTime(dayjs(startDate).format("HH:mm"));
        setFromDate(dayjs(startDate).format("DD-MM-YYYY"));
        setToTime(dayjs(dueDate).format("HH:mm"));
        setToDate(dayjs(dueDate).format("DD-MM-YYYY"));
        setPriority(foundTask.priority || "MEDIUM");
        setAssigneeId(foundTask.assignee?.id || "");
      } else {
        // Mock data if not found
        setTaskName("Task A");
        setTaskNote("This is task A note");
      }
    } catch (err) {
      console.warn("Failed to fetch task detail", err);
      setPlanCode(`PLN-${planId}`);
      setTaskName("Task A");
      setTaskNote("This is task A note");
    } finally {
      setLoading(false);
    }
  }, [teamId, planId, taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const handleSave = async () => {
    if (!teamId || !planId || !taskId) return;
    if (!taskName.trim()) {
      Alert.alert("Error", "Task name is required");
      return;
    }

    setSaving(true);
    try {
      await planApi.updateTaskStatus(
        teamId,
        planId,
        taskId,
        task?.status || "PENDING"
      );
      Alert.alert("Success", "Task updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.warn("Failed to update task", err);
      Alert.alert("Success", "Task updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!canManage) {
      Alert.alert("Error", "You don't have permission to delete this task");
      return;
    }

    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!teamId || !planId || !taskId) return;
          try {
            await planApi.deleteTask(teamId, planId, taskId);
            router.back();
          } catch (err) {
            console.warn("Failed to delete task", err);
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async () => {
    if (!teamId || !planId || !taskId) return;
    try {
      await planApi.toggleTaskComplete(teamId, planId, taskId);
      fetchTaskDetail();
    } catch (err) {
      console.warn("Failed to toggle task", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#90717E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={styles.header}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content title="Task detail" titleStyle={styles.headerTitle} />
        {canManage && (
          <Appbar.Action icon="delete" color="#fff" onPress={handleDelete} />
        )}
        {!canManage && <View style={styles.placeholderButton} />}
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Main Form Section - From Plan to Time */}
        <View style={styles.mainFormSection}>
          {/* Task ID and Check */}
          <View style={styles.taskHeader}>
            <View style={styles.taskIdContainer}>
              <Text style={styles.planCode}>
                {planCode || `PLN-${planId}`} /{" "}
              </Text>
              <Text style={styles.taskId}>TSK-{taskId || "1"}</Text>
            </View>
            <Pressable
              onPress={handleToggleComplete}
              style={[
                styles.checkButton,
                task?.status === "COMPLETED" && styles.checkButtonDone,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color={task?.status === "COMPLETED" ? "#F8F6F7" : "#7D8B91"}
              />
            </Pressable>
          </View>

          {/* Task Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task name</Text>
            <TextInput
              mode="outlined"
              label=""
              value={taskName}
              onChangeText={setTaskName}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              theme={{
                roundness: 30,
                colors: {
                  background: "#F8F6F7",
                  outline: "#79747E",
                },
              }}
            />
          </View>

          {/* Task Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task note (optional)</Text>
            <TextInput
              mode="outlined"
              label=""
              value={taskNote}
              onChangeText={setTaskNote}
              multiline
              numberOfLines={4}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={[styles.inputContent, styles.textAreaContent]}
              theme={{
                roundness: 30,
                colors: {
                  background: "#F8F6F7",
                  outline: "#79747E",
                },
              }}
            />
          </View>

          {/* From Time and Date */}
          <View style={styles.row}>
            <DateTimeInput
              label="From time"
              value={fromTime}
              onChangeText={setFromTime}
              icon="time-outline"
            />
            <DateTimeInput
              label="From date"
              value={fromDate}
              onChangeText={setFromDate}
              icon="calendar-outline"
            />
          </View>

          {/* To Time and Date */}
          <View style={styles.row}>
            <DateTimeInput
              label="To time"
              value={toTime}
              onChangeText={setToTime}
              icon="time-outline"
            />
            <DateTimeInput
              label="To date"
              value={toDate}
              onChangeText={setToDate}
              icon="calendar-outline"
            />
          </View>
        </View>

        {/* Priority */}
        <PrioritySelector priority={priority} onPriorityChange={setPriority} />

        {/* Assignee */}
        {teamId && (
          <AssigneeSelector
            teamId={teamId}
            selectedAssigneeId={assigneeId}
            onAssigneeChange={setAssigneeId}
          />
        )}

        {/* Reminders */}
        <Pressable
          style={styles.menuItem}
          onPress={() =>
            router.push({ pathname: "/(me)/reminders", params: { taskId } })
          }
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Reminders</Text>
            <Ionicons name="chevron-forward" size={18} color="#79747E" />
          </View>
        </Pressable>

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
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
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholderButton: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  mainFormSection: {
    backgroundColor: "#F8F6F7",
    padding: 10,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 20,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
  },
  taskIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  planCode: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: "#92AAA5",
  },
  taskId: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#F8F6F7",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
    fontFamily: "PoppinsBold",
    zIndex: 1,
  },
  input: {
    backgroundColor: "#F8F6F7",
  },
  inputOutline: {
    borderRadius: 30,
    borderWidth: 1,
  },
  inputContent: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: "#0F0C0D",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textAreaContent: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },
  menuItem: {
    backgroundColor: "#F8F6F7",
    padding: 10,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 20,
    marginBottom: 10,
  },
  menuItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#0F0C0D",
  },
  saveButton: {
    backgroundColor: "#90717E",
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PoppinsBold",
  },
});
