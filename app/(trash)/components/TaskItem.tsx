import React from "react";
import { Text, View } from "react-native";
import { Checkbox } from "react-native-paper";

type TaskPriority = "high" | "medium" | "low";

type TrashTask = {
  id: string;
  title: string;
  dateRange: string;
  deleteDate: string;
  priority: TaskPriority;
};

const priorityColors: Record<TaskPriority, string> = {
  high: "#FF5F57",
  medium: "#FEBC2F",
  low: "#27C840",
};

export default function TaskItem({
  task,
  isSelected,
  onToggle,
}: {
  task: TrashTask;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row w-full mb-2">
      {/* Priority bar */}
      <View
        style={{ backgroundColor: priorityColors[task.priority] }}
        className="w-2 rounded-sm"
      />

      {/* Content */}
      <View className="flex-1 bg-[#F2EFF0] px-3 py-2 flex-row items-center justify-between">
        <View className="flex-1 space-y-[2px]">
          <Text className="text-[16px] font-medium text-[#0F0C0D]">
            {task.title}
          </Text>

          <Text className="text-[12px] text-[#0F0C0D]">{task.dateRange}</Text>

          <Text className="text-[12px] text-[#FF5F57]">
            Delete at: {task.deleteDate}
          </Text>
        </View>

        <Checkbox
          status={isSelected ? "checked" : "unchecked"}
          onPress={onToggle}
        />
      </View>
    </View>
  );
}
