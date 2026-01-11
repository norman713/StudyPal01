import planApi, { Task, TaskPriority } from "@/api/planApi";
import taskApi from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import SuccessModal from "@/components/modal/success";
import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
    teamId: teamIdParam,
    planId: planIdParam,
    taskId,
    role: roleParam,
  } = useLocalSearchParams<{
    teamId?: string;
    planId?: string;
    taskId: string;
    role?: Role;
  }>();

  // State for IDs if they are missing from params
  const [teamId, setTeamId] = useState<string>(teamIdParam || "");
  const [planId, setPlanId] = useState<string>(planIdParam || "");

  const { user } = useAuth();

  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [planCode, setPlanCode] = useState<string>("");
  const [taskCode, setTaskCode] = useState<string>("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [taskName, setTaskName] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [fromTime, setFromTime] = useState("08:00");
  const [fromDate, setFromDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [toTime, setToTime] = useState("09:00");
  const [toDate, setToDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const showApiError = (error: any, fallback?: string) => {
    const message =
      error?.response?.data?.message || fallback || "Something went wrong";
    console.warn("API Error:", message);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);

      if (!planId || !teamId) {
        // Case 1: Accessed via Task ID (Deep link)
        const taskData = await planApi.getTaskById(taskId);

        // Update context IDs
        const foundPlanId = taskData.additionalData?.planId || "";
        if (foundPlanId) setPlanId(foundPlanId);
        // We don't have teamId from task response implicitly yet, but assuming we might need it for other ops.
        // For now, let's proceed with what we have.

        setPlanCode(taskData.additionalData?.planCode || taskData.taskCode);
        setTaskCode(taskData.taskCode || taskData.id);

        setTaskName(taskData.content);
        setTaskNote(taskData.note || "");
        const startDate = new Date(taskData.startDate);
        const dueDate = new Date(taskData.dueDate);
        setFromTime(dayjs(startDate).format("HH:mm"));
        setFromDate(dayjs(startDate).format("DD-MM-YYYY"));
        setToTime(dayjs(dueDate).format("HH:mm"));
        setToDate(dayjs(dueDate).format("DD-MM-YYYY"));
        setPriority(taskData.priority || "MEDIUM");
        setAssigneeId(taskData.additionalData?.assigneeId || "");

        // Set task object for status check
        setTask({
          id: taskData.id,
          content: taskData.content,
          status: taskData.completedAt ? "COMPLETED" : "PENDING",
          startDate: taskData.startDate,
          dueDate: taskData.dueDate,
          priority: taskData.priority,
          assigneeId: taskData.additionalData?.assigneeId,
        } as Task);
      } else {
        // Case 2: Accessed via Plan Detail (Standard flow)
        // New API GET /plans/{id} returns tasks in response
        const planData = await planApi.getPlanById(planId);

        setPlanCode(planData.planCode || `PLN-${planId}`);

        // Find task in the plan's task list
        const foundTask = planData.tasks?.find((t) => t.id === taskId);

        if (foundTask) {
          setTask(foundTask);
          // 🔥 LẤY TASK CODE CHỮ
          const taskDetail = await taskApi.getTaskDetail(foundTask.id);
          setTaskCode(taskDetail.taskCode);
          setTaskName(foundTask.content || "");
          setTaskNote(foundTask.description || "");
          const startDate = new Date(foundTask.startDate);
          const dueDate = new Date(foundTask.dueDate);
          setFromTime(dayjs(startDate).format("HH:mm"));
          setFromDate(dayjs(startDate).format("DD-MM-YYYY"));
          setToTime(dayjs(dueDate).format("HH:mm"));
          setToDate(dayjs(dueDate).format("DD-MM-YYYY"));
          setPriority(foundTask.priority || "MEDIUM");
          setAssigneeId(foundTask.assigneeId || foundTask.assignee?.id || "");
        } else {
          throw new Error("Task not found in plan");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch task detail", err);
      setErrorMessage("Failed to load task details");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [teamId, planId, taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const handleSave = async () => {
    if (!taskId) return;
    if (!taskName.trim()) {
      setErrorMessage("Task name is required");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      const startDateTime = dayjs(
        `${fromDate} ${fromTime}`,
        "DD-MM-YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss");
      const endDateTime = dayjs(
        `${toDate} ${toTime}`,
        "DD-MM-YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss");

      await planApi.updatePlanTask(taskId, {
        content: taskName,
        note: taskNote,
        priority: priority,
        startDate: startDateTime,
        dueDate: endDateTime,
        assigneeId: assigneeId,
      });
      setShowSuccessModal(true);
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!canManage) {
      setErrorMessage("You don't have permission to delete this task");
      setShowErrorModal(true);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!teamId || !planId || !taskId) return;
    try {
      await planApi.deleteTask(teamId, planId, taskId);
      router.back();
    } catch (err) {
      showApiError(err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleToggleComplete = () => {
    if (!taskId) return;
    setShowCompleteModal(true);
  };
  const handleConfirmComplete = async () => {
    if (!taskId) return;

    try {
      await taskApi.completeTask(taskId);

      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: "COMPLETED",
            }
          : null
      );
    } catch (err: any) {
      showApiError(err);
    } finally {
      setShowCompleteModal(false);
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
              <Text style={styles.planCode}>{planCode} </Text>
              <Text style={styles.taskId}>/ {taskCode}</Text>
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
              value={taskName}
              onChangeText={setTaskName}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              theme={{
                roundness: 30,
                colors: {
                  background: "#FFF",
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
              outlineStyle={styles.inputOutline}
              contentStyle={[styles.inputContent, styles.textAreaContent]}
              theme={{
                roundness: 30,
                colors: {
                  background: "#fff",
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

        {(canManage || task?.assigneeId === user?.id) && (
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
        )}

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

      <SuccessModal
        visible={showSuccessModal}
        message="Task updated successfully"
        onConfirm={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        confirmText="OK"
      />

      <QuestionModal
        visible={showDeleteModal}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <QuestionModal
        visible={showCompleteModal}
        title="Confirm"
        message="This action cannot be undone. Do you want to mark this task as completed?"
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteModal(false)}
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
    backgroundColor: "#fff",
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
    fontFamily: "PoppinsSemiBold",
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
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
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
    backgroundColor: "#fff",
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
