import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import TaskItem from "./Task/TaskItem";

type TPriority = "high" | "medium" | "low";

type TTask = {
  id: number;
  name: string;
  start: string;
  end: string;
  priority: TPriority;
  completed: boolean;
};

export default function TaskListSection() {
  const [tasks, setTasks] = useState<TTask[]>([
    {
      id: 1,
      name: "Task 1",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "high",
      completed: false,
    },
    {
      id: 2,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "medium",
      completed: true,
    },
    {
      id: 3,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "low",
      completed: true,
    },
    {
      id: 4,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "low",
      completed: true,
    },
    {
      id: 5,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "low",
      completed: true,
    },
    {
      id: 6,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "low",
      completed: true,
    },
    {
      id: 7,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "low",
      completed: true,
    },
    {
      id: 8,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "high",
      completed: true,
    },
  ]);

  const toggleComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <View className="bg-white p-4">
      <Pressable
        style={styles.header}
        onPress={() => router.push("/(me)/task/components/SearchTask")}
      >
        <Text style={styles.title}>Tasks</Text>

        <FontAwesome5 name="arrow-right" size={24} color="#79747E" />
      </Pressable>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}
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
