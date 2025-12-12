import planApi, { Task } from "@/api/planApi";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, TextInput } from "react-native-paper";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Status color
 */
function getStatusColor(status: Task["status"]) {
  switch (status) {
    case "COMPLETED":
      return "#27C840";
    case "IN_PROGRESS":
      return "#FEBC2F";
    case "OVERDUE":
      return "#FF5F57";
    default:
      return "#B8C6B6";
  }
}

/**
 * TaskItem – NativeWind
 */
function TaskItem({ task }: { task: Task }) {
  const formatDate = (dateStr: string) =>
    dayjs(dateStr).format("HH:mm DD MMM, YYYY");

  const statusColor = getStatusColor(task.status);

  return (
    <View className="flex-row bg-[#F2EFF0] p-3 rounded mb-2 items-center">
      {/* Status bar */}
      <View
        className="w-1.5 mr-3 rounded"
        style={{ backgroundColor: statusColor }}
      />

      {/* Content */}
      <View className="flex-1">
        <Text className="text-[16px] font-semibold text-[#0F0C0D]">
          {task.name}
        </Text>

        <Text className="text-[12px] text-[#0F0C0D] mt-0.5">
          {formatDate(task.startDate)} - {formatDate(task.dueDate)}
        </Text>

        {task.assignee && (
          <View className="flex-row items-center mt-1">
            {task.assignee.avatarUrl ? (
              <Image
                source={{ uri: task.assignee.avatarUrl }}
                className="w-5 h-5 rounded-full mr-1.5"
              />
            ) : (
              <View className="w-5 h-5 rounded-full bg-[#90717E] items-center justify-center mr-1.5">
                <Text className="text-[10px] text-white font-semibold">
                  {task.assignee.name.charAt(0)}
                </Text>
              </View>
            )}
            <Text className="text-[12px] text-[#49454F]">
              {task.assignee.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

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

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPlanData = useCallback(async () => {
    if (!isEditMode || !teamId || !planId) return;

    setLoading(true);
    try {
      const [planData, tasksData] = await Promise.all([
        planApi.getPlanDetail(teamId, planId),
        planApi.getTasks(teamId, planId),
      ]);
      setPlanName(planData.name);
      setPlanDescription(planData.description || "");
      setTasks(tasksData.tasks || []);
    } catch {
      setPlanName("Plan 1");
      setPlanDescription("This is plan 1 description");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isEditMode, teamId, planId]);

  useEffect(() => {
    if (isEditMode) fetchPlanData();
  }, [fetchPlanData, isEditMode]);

  const handleSave = async () => {
    if (!planName.trim()) {
      Alert.alert("Error", "Plan name is required");
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && planId) {
        await planApi.updatePlan(teamId, planId, {
          name: planName.trim(),
          description: planDescription.trim(),
        });
      } else {
        await planApi.createPlan(teamId, {
          name: planName.trim(),
          description: planDescription.trim(),
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        });
      }
      router.back();
    } catch {
      Alert.alert("Demo", "Plan saved (mock)");
      router.back();
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F6F7]">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F6F7]">
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Plan create"
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
        className="flex-1"
      >
        <ScrollView className="p-4">
          {/* Detail */}
          <View className="bg-white rounded-xl mb-4 overflow-visible">
            <Text className="text-xl font-semibold text-[#0F0C0D] p-2">
              Detail
            </Text>
            <View className="gap-4 p-4">
              <TextInput
                mode="outlined"
                label="Plan name"
                value={planName}
                onChangeText={(planName) => setPlanName(planName)}
                theme={{
                  roundness: 30,
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
                  roundness: 30,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                contentStyle={{
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>

          {/* Tasks */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[16px] font-semibold text-[#0F0C0D]">
                Tasks
              </Text>
              {canManage && (
                <TouchableOpacity onPress={handleAddTask}>
                  <Ionicons name="add" size={24} color={ACCENT} />
                </TouchableOpacity>
              )}
            </View>

            {tasks.length === 0 ? (
              <View className="items-center py-10">
                <Ionicons name="checkbox-outline" size={48} color="#E3DBDF" />
                <Text className="text-[16px] font-semibold text-[#79747E] mt-3">
                  No tasks yet
                </Text>
                <Text className="text-[14px] text-[#9E9E9E] mt-1">
                  Tap + to add a task
                </Text>
              </View>
            ) : (
              tasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
