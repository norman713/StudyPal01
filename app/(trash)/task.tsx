import { DeletedTask } from "@/api/taskApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import TaskItem from "./components/TaskItem";

export default function TrashTasks({
  deletedTasks,
  selectedTaskId,
  onSelectTask,
  onRecover,
}: {
  deletedTasks: DeletedTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onRecover: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text variant="titleMedium">Tasks</Text>

        <TouchableOpacity
          onPress={onRecover}
          disabled={!selectedTaskId}
          style={{ opacity: selectedTaskId ? 1 : 0.4 }}
        >
          <MaterialCommunityIcons name="restore" size={24} color="#49454F" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView>
        {deletedTasks.map((task) => {
          const selected = task.id === selectedTaskId;

          return (
            <TaskItem
              key={task.id}
              task={task}
              selected={selected}
              onPress={() => onSelectTask(task.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
