import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import TaskItem from "./components/TaskItem";

export default function TrashTasks({
  deletedTasks,
  selectedTaskId,
  onSelectTask,
  onRecover,
}: {
  deletedTasks: any[];
  selectedTaskId: string | null;
  onSelectTask: (id: string | null) => void;
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

        {/* Recover button */}
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
          const isSelected = task.id === selectedTaskId;

          return (
            <Pressable
              key={task.id}
              onPress={() => onSelectTask(isSelected ? null : task.id)}
              style={{
                borderRadius: 12,
                marginBottom: 6,
                backgroundColor: isSelected ? "#EDE7EA" : "transparent",
              }}
            >
              <TaskItem task={task} />
            </Pressable>
          );
        })}

        {deletedTasks.length === 0 && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: "#888",
            }}
          >
            No deleted tasks
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
