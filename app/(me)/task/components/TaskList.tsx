import { PersonalTask } from "@/api/taskApi";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import TaskItem from "./Task/TaskItem";

interface TaskListSectionProps {
  tasks: PersonalTask[];
  onToggleTask: (id: string) => void;
}

export default function TaskListSection({
  tasks,
  onToggleTask,
}: TaskListSectionProps) {
  return (
    <View className="bg-white p-4">
      <Pressable
        style={styles.header}
        onPress={() => router.push("/(me)/task/components/SearchTask")}
      >
        <Text style={styles.title}>Tasks</Text>

        <FontAwesome5 name="arrow-right" size={24} color="#79747E" />
      </Pressable>
      {tasks.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#79747E", marginTop: 20 }}>
          No tasks for this day.
        </Text>
      ) : (
        tasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            onPress={() => {
              router.push({
                pathname: "/(me)/task/taskDetail",
                params: { taskId: t.id },
              });
            }}
            onToggle={() => onToggleTask(t.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
