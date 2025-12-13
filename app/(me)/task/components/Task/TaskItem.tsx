import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TPriority = "high" | "medium" | "low";

export type TTask = {
  id: number;
  name: string;
  start: string;
  end: string;
  priority: TPriority;
  completed: boolean;
  repeat?: boolean;
};

type TaskItemProps = {
  task: TTask;
  onPress: () => void;
  onToggle: () => void;
};

export default function TaskItem({ task, onPress, onToggle }: TaskItemProps) {
  const getPriorityColor = (priority: TPriority) => {
    switch (priority) {
      case "high":
        return "#FF5F57";
      case "medium":
        return "#FEBC2F";
      case "low":
        return "#27C840";
      default:
        return "#ccc";
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {/* Priority bar */}
      <View
        style={[
          styles.colorBar,
          { backgroundColor: getPriorityColor(task.priority) },
        ]}
      />

      {/* Task info */}
      <View style={styles.info}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {task.repeat && (
            <FontAwesome
              name="refresh"
              size={20}
              color="#7D8B91"
              style={{ marginRight: 10 }}
            />
          )}
          <Text style={styles.name}>{task.name}</Text>
        </View>

        <Text style={styles.time}>
          {task.start} — {task.end}
        </Text>
      </View>

      {/* Check icon */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.(); // 🚫 chặn route khi bấm check
          onToggle();
        }}
        style={[
          styles.checkButton,
          task.completed ? styles.checkButtonDone : styles.checkButtonIdle,
        ]}
      >
        <Ionicons
          name="checkmark"
          size={18}
          color={task.completed ? "#fff" : "#7D8B91"}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F2EFF0",
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderRadius: 6,
  },

  colorBar: {
    width: 6,
    height: "100%",
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

  time: {
    fontSize: 12,
    marginTop: 2,
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
});
