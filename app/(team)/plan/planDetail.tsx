import planApi, { Plan, Task } from "@/api/planApi";
import { getUserIdFromToken, readTokens } from "@/api/tokenStore";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Text } from "react-native-paper";

import EditPlanCard from "@/components/modal/editPlanCard";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import ProgressCircle from "./components/ProgressCircle";
import TaskItem from "./components/TaskItem";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";
type TaskFilter = "ALL" | "MY";

// ==================== MAIN SCREEN ====================
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

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { accessToken } = await readTokens();
      const id = getUserIdFromToken(accessToken);
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";
  // States
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("ALL");
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch data
  const fetchPlanDetail = useCallback(async () => {
    if (!teamId || !planId) return;

    try {
      setLoading(true);
      // New API returns Plan object with embedded tasks
      const planData = await planApi.getPlanById(planId);

      setPlan(planData);
      setTasks(planData.tasks || []);
    } catch (error) {
      console.error("Failed to fetch plan detail", error);
      setErrorMessage("Failed to load plan detail");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [teamId, planId]);

  const handleDeletePlan = async () => {
    if (!teamId || !planId) return;
    try {
      await planApi.deletePlan(teamId, planId);
      router.back();
    } catch (e) {
      setErrorMessage("Failed to delete plan");
      setShowErrorModal(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlanDetail();
    }, [fetchPlanDetail])
  );

  // Handlers
  const handleToggleTask = async (task: Task) => {
    if (!teamId || !planId) return;
    try {
      await planApi.toggleTaskComplete(teamId, planId, task.id);
      fetchPlanDetail();
      fetchPlanDetail();
    } catch (error: any) {
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
      const msg =
        error?.response?.data?.message || "Failed to toggle task status";
      setErrorMessage(msg);
      setShowErrorModal(true);
    }
  };

  const formatTime = (dateStr: string) => dayjs(dateStr).format("HH:mm");
  const formatDateFull = (dateStr: string) =>
    dayjs(dateStr).format("DD MMM, YYYY");

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  // Error state
  if (!plan) {
    return (
      <View style={styles.centerContainer}>
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

      <Appbar.Header mode="small" style={styles.header}>
        {/* Back */}
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />

        {/* Title */}
        <Appbar.Content title="Plan detail" titleStyle={styles.headerTitle} />

        {/* Recover / History – always visible */}
        <Pressable
          onPress={() => {
            // Navigate to planHistory page
            router.push({
              pathname: "/(team)/plan/planHistory", // Add the correct path for the history page
              params: { teamId, planId }, // Pass relevant parameters if needed
            });
          }}
          style={{ marginRight: 16 }}
        >
          <FontAwesome5 name="history" size={24} color="#fff" />
        </Pressable>

        {/* If user has manage rights */}
        {canManage && (
          <>
            {/* Edit */}
            <Pressable
              onPress={() => setEditModalVisible(true)}
              style={{ marginRight: 16 }}
            >
              <FontAwesome5 name="pen" size={20} color="#fff" />
            </Pressable>
            {/* Delete */}
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              style={{ marginRight: 16 }}
            >
              <FontAwesome5 name="trash" size={20} color="#fff" />
            </Pressable>
          </>
        )}
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {/* Plan Info Card */}
        <View style={styles.card}>
          <View style={styles.planHeader}>
            <ProgressCircle
              progress={(plan.completedTaskCount / plan.totalTasksCount) * 100}
              size={70}
            />
            <View style={styles.planMeta}>
              <Text style={styles.planCode}>{plan.planCode}</Text>
              <Text style={styles.planName}>{plan.title}</Text>
              <Text style={styles.planDesc} numberOfLines={2}>
                {plan.description}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem
              label="Start date"
              value={formatTime(plan.startDate)}
              subValue={formatDateFull(plan.startDate)}
            />
            <StatItem
              label="Due date"
              value={formatTime(plan.dueDate)}
              subValue={formatDateFull(plan.dueDate)}
            />
            <StatItem
              label="Completed tasks"
              value={`${plan.completedTaskCount}/${plan.totalTasksCount}`}
            />
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.card}>
          <TasksHeader
            canManage={canManage}
            taskFilter={taskFilter}
            onFilterChange={setTaskFilter}
            onAddTask={() =>
              router.push({
                pathname: "/(team)/plan/addTask",
                params: { teamId, planId, role },
              })
            }
          />

          {/* Task List */}
          <View style={styles.taskList}>
            {tasks.filter((t) => {
              if (taskFilter === "ALL") return true;
              if (!currentUserId) return true;
              return (
                t.assigneeId === currentUserId ||
                t.assignee?.id === currentUserId
              );
            }).length === 0 ? (
              <EmptyTasks />
            ) : (
              tasks
                .filter((t) => {
                  if (taskFilter === "ALL") return true;
                  if (!currentUserId) return true;
                  return (
                    t.assigneeId === currentUserId ||
                    t.assignee?.id === currentUserId
                  );
                })
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task)}
                    teamId={teamId}
                    planId={planId}
                    role={role}
                  />
                ))
            )}
          </View>
        </View>
      </ScrollView>
      {/* Edit Plan Modal */}
      <EditPlanCard
        visible={isEditModalVisible}
        onDismiss={() => setEditModalVisible(false)} // Close modal
        initialName={plan?.title || ""}
        initialDescription={plan?.description || ""}
        onSave={async (data) => {
          if (!teamId || !planId) return;
          try {
            await planApi.updatePlan(teamId, planId, {
              title: data.planName,
              description: data.planDescription,
              startDate: plan?.startDate,
              dueDate: plan?.dueDate,
            });
            setEditModalVisible(false);
            fetchPlanDetail();
          } catch (e) {
            setErrorMessage("Failed to update plan");
            setShowErrorModal(true);
          }
        }}
      />
      <QuestionModal
        visible={showDeleteModal}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        onConfirm={handleDeletePlan}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
      />
    </View>
  );
}

// ==================== SUB COMPONENTS ====================
function StatItem({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subValue && <Text style={styles.statValue}>{subValue}</Text>}
    </View>
  );
}

function TasksHeader({
  canManage,
  taskFilter,
  onFilterChange,
  onAddTask,
}: {
  canManage: boolean;
  taskFilter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  onAddTask: () => void;
}) {
  return (
    <View style={styles.tasksHeader}>
      <View style={styles.tasksHeaderLeft}>
        <Text style={styles.tasksTitle}>Tasks</Text>
        {canManage && (
          <TouchableOpacity style={styles.addBtn} onPress={onAddTask}>
            <Ionicons name="add" size={16} color={ACCENT} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterToggle}>
        {(["ALL", "MY"] as TaskFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              taskFilter === f && styles.filterBtnActive,
            ]}
            onPress={() => onFilterChange(f)}
          >
            <Text
              style={[
                styles.filterText,
                taskFilter === f && styles.filterTextActive,
              ]}
            >
              {f === "MY" ? "ME" : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function EmptyTasks() {
  return (
    <View style={styles.emptyTasks}>
      <Ionicons name="checkbox-outline" size={48} color="#E3DBDF" />
      <Text style={styles.emptyText}>No tasks yet</Text>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: { backgroundColor: ACCENT },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  scrollView: { flex: 1 },

  // Card
  card: {
    backgroundColor: "#F8F6F7",
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },

  // Plan Header
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  planMeta: { flex: 1, marginLeft: 16 },
  planCode: { fontSize: 12, color: "#92AAA5", fontWeight: "700" },
  planName: { fontSize: 18, fontWeight: "700", color: "#0F0C0D", marginTop: 2 },
  planDesc: { fontSize: 14, color: "#0F0C0D", marginTop: 4, lineHeight: 20 },

  // Stats
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 12, color: "#B8C6B6" },
  statValue: { fontSize: 16, color: ACCENT, fontWeight: "500" },

  // Tasks Header
  tasksHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tasksHeaderLeft: { flexDirection: "row", alignItems: "center" },
  tasksTitle: { fontSize: 16, fontWeight: "700", color: "#0F0C0D" },
  addBtn: {
    marginLeft: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E3DBDF",
    alignItems: "center",
    justifyContent: "center",
  },

  // Filter
  filterToggle: {
    flexDirection: "row",
    backgroundColor: "#E3DBDF",
    borderRadius: 13,
    padding: 3,
  },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  filterBtnActive: { backgroundColor: ACCENT },
  filterText: { fontSize: 12, fontWeight: "600", color: "#0F0C0D" },
  filterTextActive: { color: "#fff" },

  // Task List
  taskList: {},
  emptyTasks: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, color: "#79747E", marginTop: 12 },

  // Error
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
  backBtnText: { color: "#fff", fontSize: 16 },
});
