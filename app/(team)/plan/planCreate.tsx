import memberApi, { Member } from "@/api/memberApi";
import planApi, { Task } from "@/api/planApi";
import ErrorModal from "@/components/modal/error";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, TextInput } from "react-native-paper";

import { planCreationStore } from "@/utils/planCreationStore";
import TaskItem from "./components/TaskItem";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Plan Create / Edit Screen
 */
export default function PlanCreateScreen() {
  const {
    teamId,
    planId,
    role: roleParam,
    mode,
  } = useLocalSearchParams<{
    teamId: string;
    planId?: string;
    role: Role;
    mode?: "create" | "edit";
  }>();

  const isEditMode = mode === "edit" && planId;
  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  // States
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  // Mixed tasks: Real tasks (edit mode) or Draft tasks (create mode converted to DisplayTask)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (teamId) {
      memberApi
        .getAll(teamId)
        .then((res) => {
          setMembers(res.members || []);
        })
        .catch((err) => {
          console.log("Failed to load members", err);
          // Optional: handle error state specifically if needed
        });
    }
  }, [teamId]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper to convert draft to display task
  const draftToTask = useCallback(
    (draft: any, index: number): Task => {
      const assignee = members.find((m) => m.userId === draft.assigneeId);
      return {
        id: draft.tempId, // Use tempId as stable ID
        content: draft.content,
        description: draft.note,
        startDate: draft.startDate,
        dueDate: draft.dueDate,
        status: "PENDING",
        priority: draft.priority,
        assignee: assignee
          ? {
              id: assignee.userId,
              name: assignee.name,
              avatarUrl: assignee.avatarUrl,
            }
          : undefined,
        planId: "new",
      };
    },
    [members]
  );

  // Load data for Edit Mode
  const fetchPlanData = useCallback(async () => {
    if (!teamId || !planId) return;

    setLoading(true);
    try {
      const [planData, tasksData] = await Promise.all([
        planApi.getPlanDetail(teamId, planId),
        planApi.getTasks(teamId, planId),
      ]);
      setPlanName(planData.title);
      setPlanDescription(planData.description || "");
      setTasks(tasksData.tasks || []);
    } catch {
      console.log("Failed to load plan data");
      setErrorMessage("Failed to load plan data");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [teamId, planId]);

  // Effect: Handle Create Mode (Draft Store) vs Edit Mode
  useEffect(() => {
    if (isEditMode) {
      fetchPlanData();
    } else {
      // Create Mode: Subscribe to store
      const updateState = () => {
        const drafts = planCreationStore.getTasks();
        setTasks(drafts.map((d, i) => draftToTask(d, i)));
      };

      // Initial load
      updateState();

      // Subscribe
      return planCreationStore.subscribe(updateState);
    }
  }, [fetchPlanData, isEditMode, draftToTask]);

  // Clear store on mount if creating new
  // Clear store on mount and unmount if creating new
  useEffect(() => {
    if (!isEditMode) {
      planCreationStore.clearTasks();

      return () => {
        planCreationStore.clearTasks();
      };
    }
  }, [isEditMode]);

  const handleSave = async () => {
    if (!planName.trim()) {
      setErrorMessage("Plan name is required");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && planId) {
        // Edit Mode
        await planApi.updatePlan(teamId, planId, {
          title: planName.trim(),
          description: planDescription.trim(),
        });
      } else {
        // Create Mode
        const drafts = planCreationStore.getTasks();

        const res = await planApi.createPlan(teamId, {
          teamId,
          title: planName.trim(),
          description: planDescription.trim(),
          tasks: drafts,
        });
        console.log("TEAM CREATE:", res);

        // Clear drafts after success
        planCreationStore.clearTasks();
      }
      router.push({
        pathname: "/(team)/plan",
        params: {
          teamId,
          planId,
          role,
        },
      });
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to save plan";
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = () => {
    router.push({
      pathname: "/(team)/plan/addTask",
      params: { teamId, planId: planId || "new", role },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!isEditMode) {
      // Create Mode: Remove from store
      planCreationStore.removeTask(taskId);
    } else {
      // Edit Mode: Delete from API
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (teamId && planId) {
                await planApi.deleteTask(teamId, planId, taskId);
                setTasks((prev) => prev.filter((t) => t.id !== taskId));
              }
            } catch (err) {
              console.error("Failed to delete task", err);
              Alert.alert("Error", "Failed to delete task");
            }
          },
        },
      ]);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F6F7",
        }}
      >
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F6F7" }}>
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title={isEditMode ? "Create Plan" : "Create Plan"}
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
        <Appbar.Action
          icon="content-save"
          color="#fff"
          onPress={handleSave}
          disabled={saving}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Detail */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#0F0C0D",
                padding: 12,
              }}
            >
              Detail
            </Text>
            <View style={{ gap: 16, padding: 16, paddingTop: 0 }}>
              <TextInput
                mode="outlined"
                label="Plan name"
                value={planName}
                onChangeText={(planName) => setPlanName(planName)}
                theme={{
                  roundness: 10,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
              />
              <TextInput
                mode="outlined"
                label="Plan description"
                value={planDescription}
                onChangeText={setPlanDescription}
                multiline
                numberOfLines={4}
                theme={{
                  roundness: 10,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                contentStyle={{
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>

          {/* Tasks */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#0F0C0D" }}
              >
                Tasks
              </Text>
              {canManage && (
                <TouchableOpacity onPress={handleAddTask}>
                  <Ionicons name="add" size={24} color={ACCENT} />
                </TouchableOpacity>
              )}
            </View>

            {tasks.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="checkbox-outline" size={48} color="#E3DBDF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#79747E",
                    marginTop: 12,
                  }}
                >
                  No tasks yet
                </Text>
                <Text style={{ fontSize: 14, color: "#9E9E9E", marginTop: 4 }}>
                  Tap + to add a task
                </Text>
              </View>
            ) : (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  teamId={teamId}
                  planId={planId || task.planId}
                  role={role}
                  onDelete={
                    canManage ? () => handleDeleteTask(task.id) : undefined
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
      />
    </View>
  );
}
