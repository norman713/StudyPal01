import { DeletedTask } from "@/api/taskApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Checkbox, Text } from "react-native-paper";
import TaskItem from "./components/TaskItem";

const ACCENT = "#90717E";

export default function TrashTasks({
  deletedTasks,
  selectedTasks,
  selectAll,
  onTaskToggle,
  onSelectAllToggle,
  onRecover,
}: {
  deletedTasks: DeletedTask[];
  selectedTasks: Set<string>;
  selectAll: boolean;
  onTaskToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onRecover: () => void;
}) {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text variant="titleMedium">Tasks</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={onRecover}
            disabled={selectedTasks.size === 0}
            style={{ opacity: selectedTasks.size > 0 ? 1 : 0.4 }}
          >
            <MaterialCommunityIcons name="restore" size={24} color="#49454F" />
          </TouchableOpacity>

          <Checkbox
            status={selectAll ? "checked" : "unchecked"}
            onPress={onSelectAllToggle}
            color={ACCENT}
          />
        </View>
      </View>

      {/* List */}
      <ScrollView>
        {deletedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTasks.has(task.id)}
            onToggle={() => onTaskToggle(task.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
