import { Task, TaskPriority } from "@/api/planApi";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface TaskItemProps {
  task: Task;
  onToggle?: () => void; // Optional - if not provided, won't show check button
  teamId?: string;
  planId?: string;
  role?: Role;
}

/**
 * Get color based on priority
 * HIGH = Red, MEDIUM = Yellow, LOW = Green
 */
export function getPriorityColor(priority?: TaskPriority): string {
  switch (priority) {
    case "HIGH":
      return "#FF5F57";
    case "MEDIUM":
      return "#FEBC2F";
    case "LOW":
      return "#27C840";
    default:
      return "#B8C6B6";
  }
}

/**
 * Format date to display string
 */
function formatDate(dateStr: string): string {
  return dayjs(dateStr).format("HH:mm DD MMM, YYYY");
}

export default function TaskItem({
  task,
  onToggle,
  teamId,
  planId,
  role,
}: TaskItemProps) {
  const priorityColor = getPriorityColor(task.priority);
  const isCompleted = task.status === "COMPLETED";

  const handlePress = () => {
    if (teamId && planId) {
      router.push({
        pathname: "/(team)/plan/taskDetail",
        params: {
          teamId,
          planId,
          taskId: task.id,
          role: role || "MEMBER",
        },
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Priority Color Bar */}
      <View style={[styles.colorBar, { backgroundColor: priorityColor }]} />

      {/* Task Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{task.content}</Text>
        <Text style={styles.date}>
          {formatDate(task.startDate)} - {formatDate(task.dueDate)}
        </Text>

        {/* Assignee */}
        {(task.assignee || task.assigneeName) && (
          <View style={styles.assigneeRow}>
            {task.assignee?.avatarUrl || task.assigneeAvatarUrl ? (
              <Image
                source={{
                  uri: task.assignee?.avatarUrl || task.assigneeAvatarUrl,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(task.assignee?.name || task.assigneeName || "?").charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.assigneeName}>
              {task.assignee?.name || task.assigneeName}
            </Text>
          </View>
        )}
      </View>

      {/* Check Button - only show if onToggle provided */}
      {onToggle && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          style={[
            styles.checkBtn,
            isCompleted ? styles.checkBtnDone : styles.checkBtnIdle,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={18}
            color={isCompleted ? "#fff" : "#7D8B91"}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F2EFF0",
    padding: 12,
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 8,
  },
  colorBar: {
    width: 6,
    height: "100%",
    minHeight: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  date: {
    fontSize: 12,
    color: "#0F0C0D",
    marginTop: 2,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  avatarText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  assigneeName: {
    fontSize: 12,
    color: "#49454F",
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  checkBtnIdle: {
    borderColor: "#A1AEB7",
    backgroundColor: "transparent",
  },
  checkBtnDone: {
    borderColor: "#92AAA5",
    backgroundColor: "#92AAA5",
  },
});
