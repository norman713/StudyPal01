import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import TaskItem from "./components/TaskItem";

export default function TrashTasks({
  deletedTasks,
  onRecover,
}: {
  deletedTasks: any[];
  onRecover: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
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

        <TouchableOpacity onPress={onRecover}>
          <MaterialCommunityIcons name="restore" size={24} color="#49454F" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView>
        {deletedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ScrollView>
    </View>
  );
}
