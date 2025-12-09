import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type TPriority = "high" | "medium" | "low";

type TTask = {
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
};

export default function TaskItem({ task }: TaskItemProps) {
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
    <View style={styles.container}>
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
      <View
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F2EFF0",
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
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
  },
  time: {
    fontSize: 12,
    marginTop: 2,
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
