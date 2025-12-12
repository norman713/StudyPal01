import planApi, { Plan, Task } from "@/api/planApi";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Text } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";
type TaskFilter = "ALL" | "MY";

/**
 * Progress Circle for Plan Header - larger size
 */
function ProgressCircle({
  progress,
  size = 70,
}: {
  progress: number;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (progressValue / 100) * circumference;

  return (
    <View style={[styles.progressContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E3DBDF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#90717E"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressTextLarge}>{progress.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

/**
 * Get status color for task priority bar
 */
function getStatusColor(status: Task["status"]) {
  switch (status) {
    case "COMPLETED":
      return "#27C840"; // Green
    case "IN_PROGRESS":
      return "#FEBC2F"; // Yellow/Orange
    case "OVERDUE":
      return "#FF5F57"; // Red
    default:
      return "#B8C6B6"; // Gray/Pending
  }
}

/**
 * TaskItem Component - giống design với color bar
 */
function TaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format("HH:mm DD MMM, YYYY");
  };

  const statusColor = getStatusColor(task.status);
  const isCompleted = task.status === "COMPLETED";

  return (
    <View style={styles.taskItem}>
      {/* Color bar */}
      <View style={[styles.colorBar, { backgroundColor: statusColor }]} />

      {/* Task info */}
      <View style={styles.taskInfo}>
        <View style={styles.taskNameRow}>
          {task.assignee && (
            <FontAwesome
              name="refresh"
              size={16}
              color="#7D8B91"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.taskName}>{task.name}</Text>
        </View>
        <Text style={styles.taskDate}>
          {formatDate(task.startDate)} - {formatDate(task.dueDate)}
        </Text>
        {/* Assignee */}
        {task.assignee && (
          <View style={styles.assigneeRow}>
            {task.assignee.avatarUrl ? (
              <Image
                source={{ uri: task.assignee.avatarUrl }}
                style={styles.assigneeAvatar}
              />
            ) : (
              <View style={styles.assigneeAvatarPlaceholder}>
                <Text style={styles.assigneeAvatarText}>
                  {task.assignee.name.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.assigneeName}>{task.assignee.name}</Text>
          </View>
        )}
      </View>

      {/* Check button */}
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.checkButton,
          isCompleted ? styles.checkButtonDone : styles.checkButtonIdle,
        ]}
      >
        <Ionicons
          name="checkmark"
          size={18}
          color={isCompleted ? "#fff" : "#7D8B91"}
        />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Plan Detail Screen - giống design
 */
export default function PlanDetailScreen() {
  const {
    teamId,
    planId,
    role: roleParam,
  } = useLocalSearchParams<{
    teamId: string;
    planId: string;
    role: Role;
  }>();

  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  // States
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("ALL");

  // Fetch plan detail
  const fetchPlanDetail = useCallback(async () => {
    if (!teamId || !planId) return;

    try {
      setLoading(true);
      const [planData, tasksData] = await Promise.all([
        planApi.getPlanDetail(teamId, planId),
        planApi.getTasks(teamId, planId, taskFilter),
      ]);
      setPlan(planData);
      setTasks(tasksData.tasks || []);
    } catch (err: any) {
      // API chưa có hoặc server lỗi - dùng mock data để demo
      console.warn("Plan Detail API not available, using mock data");
      // Mock data for demo
      setPlan({
        id: planId,
        code: "PLN-1",
        name: "This is today plan",
        description: "This is plan description if you know you know.",
        startDate: "2025-01-12T12:00:00Z",
        dueDate: "2025-12-12T12:00:00Z",
        progress: 75.0,
        totalTasks: 20,
        completedTasks: 15,
        status: "IN_PROGRESS",
      });
      setTasks([
        {
          id: "1",
          name: "Task 1",
          startDate: "2025-10-27T12:00:00Z",
          dueDate: "2025-10-29T24:00:00Z",
          status: "COMPLETED",
          assignee: {
            id: "1",
            name: "Minh Huy",
            avatarUrl: "https://i.pravatar.cc/40?img=1",
          },
          planId: planId,
        },
        {
          id: "2",
          name: "Task 1",
          startDate: "2025-10-27T12:00:00Z",
          dueDate: "2025-10-29T24:00:00Z",
          status: "PENDING",
          assignee: {
            id: "2",
            name: "Me",
            avatarUrl: "https://i.pravatar.cc/40?img=2",
          },
          planId: planId,
        },
        {
          id: "3",
          name: "Task 1",
          startDate: "2025-10-27T12:00:00Z",
          dueDate: "2025-10-29T24:00:00Z",
          status: "PENDING",
          assignee: {
            id: "3",
            name: "Minh Hoàng",
            avatarUrl: "https://i.pravatar.cc/40?img=3",
          },
          planId: planId,
        },
        {
          id: "4",
          name: "Task 1",
          startDate: "2025-10-27T12:00:00Z",
          dueDate: "2025-10-29T24:00:00Z",
          status: "IN_PROGRESS",
          assignee: {
            id: "4",
            name: "Jack 5 củ",
            avatarUrl: "https://i.pravatar.cc/40?img=4",
          },
          planId: planId,
        },
        {
          id: "5",
          name: "Task 1",
          startDate: "2025-10-27T12:00:00Z",
          dueDate: "2025-10-29T24:00:00Z",
          status: "COMPLETED",
          assignee: {
            id: "5",
            name: "Me",
            avatarUrl: "https://i.pravatar.cc/40?img=5",
          },
          planId: planId,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [teamId, planId, taskFilter]);

  useEffect(() => {
    fetchPlanDetail();
  }, [fetchPlanDetail]);

  // Handlers
  const handleToggleTask = async (task: Task) => {
    if (!teamId || !planId) return;
    try {
      await planApi.toggleTaskComplete(teamId, planId, task.id);
      fetchPlanDetail();
    } catch (err) {
      // API chưa có - toggle trực tiếp trong UI (mock behavior)
      console.warn("Toggle API not available, toggling locally");
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: t.status === "COMPLETED" ? "PENDING" : "COMPLETED",
              }
            : t
        )
      );
    }
  };

  const handleHistory = () => {
    // Navigate to plan history
    console.log("View history");
  };

  const handleEdit = () => {
    // Navigate to edit plan
    router.push({
      pathname: "/(team)/plan/planCreate",
      params: { teamId, planId, role, mode: "edit" },
    });
  };

  const formatTime = (dateStr: string) => dayjs(dateStr).format("HH:mm");
  const formatDateFull = (dateStr: string) =>
    dayjs(dateStr).format("DD MMM, YYYY");

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF5F57" />
        <Text style={styles.errorText}>Plan not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Plan detail"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
        <Appbar.Action icon="history" color="#fff" onPress={handleHistory} />
        {canManage && (
          <Appbar.Action icon="pencil" color="#fff" onPress={handleEdit} />
        )}
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Plan Info Card */}
        <View style={styles.planInfoCard}>
          {/* Plan Header with Progress */}
          <View style={styles.planHeader}>
            <ProgressCircle progress={plan.progress} />
            <View style={styles.planMeta}>
              <Text style={styles.planCode}>{plan.code}</Text>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDescription} numberOfLines={2}>
                {plan.description}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Start date</Text>
              <Text style={styles.statValue}>{formatTime(plan.startDate)}</Text>
              <Text style={styles.statValue}>
                {formatDateFull(plan.startDate)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Due date</Text>
              <Text style={styles.statValue}>{formatTime(plan.dueDate)}</Text>
              <Text style={styles.statValue}>
                {formatDateFull(plan.dueDate)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed tasks</Text>
              <Text style={styles.statValueBig}>
                {plan.completedTasks}/{plan.totalTasks}
              </Text>
            </View>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          {/* Tasks Header */}
          <View style={styles.tasksHeader}>
            <View style={styles.tasksHeaderLeft}>
              <Text style={styles.tasksTitle}>Tasks</Text>
              {canManage && (
                <TouchableOpacity
                  style={styles.addTaskBtn}
                  onPress={() => {
                    router.push({
                      pathname: "/(team)/plan/addTask",
                      params: { teamId, planId, role },
                    });
                  }}
                >
                  <Ionicons name="add" size={16} color={ACCENT} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Toggle */}
            <View style={styles.filterToggle}>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  taskFilter === "ALL" && styles.filterBtnActive,
                ]}
                onPress={() => setTaskFilter("ALL")}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    taskFilter === "ALL" && styles.filterBtnTextActive,
                  ]}
                >
                  ALL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  taskFilter === "MY" && styles.filterBtnActive,
                ]}
                onPress={() => setTaskFilter("MY")}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    taskFilter === "MY" && styles.filterBtnTextActive,
                  ]}
                >
                  ME
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Task List */}
          <View style={styles.taskList}>
            {tasks.length === 0 ? (
              <View style={styles.emptyTasks}>
                <Ionicons name="checkbox-outline" size={48} color="#E3DBDF" />
                <Text style={styles.emptyTasksText}>No tasks yet</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleTask(task)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F0C0D",
    marginTop: 16,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: ACCENT,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  // Plan Info Card
  planInfoCard: {
    backgroundColor: "#F8F6F7",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  planMeta: {
    flex: 1,
    marginLeft: 16,
  },
  planCode: {
    fontSize: 12,
    color: "#92AAA5",
    fontWeight: "600",
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F0C0D",
    marginTop: 2,
  },
  planDescription: {
    fontSize: 14,
    color: "#0F0C0D",
    marginTop: 4,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#B8C6B6",
  },
  statValue: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: "500",
  },
  statValueBig: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: "600",
    marginTop: 8,
  },
  // Progress Circle
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTextLarge: {
    fontSize: 16,
    fontWeight: "700",
    color: ACCENT,
  },
  // Tasks Section
  tasksSection: {
    backgroundColor: "#F8F6F7",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  tasksHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tasksHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F0C0D",
  },
  addTaskBtn: {
    marginLeft: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E3DBDF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggle: {
    flexDirection: "row",
    backgroundColor: "#E3DBDF",
    borderRadius: 13,
    padding: 3,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: ACCENT,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  taskList: {
    gap: 8,
  },
  // Task Item
  taskItem: {
    flexDirection: "row",
    backgroundColor: "#F2EFF0",
    padding: 12,
    alignItems: "center",
    borderRadius: 4,
  },
  colorBar: {
    width: 6,
    height: "100%",
    minHeight: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  taskDate: {
    fontSize: 12,
    color: "#0F0C0D",
    marginTop: 2,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  assigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  assigneeAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  assigneeAvatarText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  assigneeName: {
    fontSize: 12,
    color: "#49454F",
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  checkButtonIdle: {
    borderColor: "#A1AEB7",
    backgroundColor: "transparent",
  },
  checkButtonDone: {
    borderColor: "#92AAA5",
    backgroundColor: "#92AAA5",
  },
  emptyTasks: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTasksText: {
    fontSize: 16,
    color: "#79747E",
    marginTop: 12,
  },
});
