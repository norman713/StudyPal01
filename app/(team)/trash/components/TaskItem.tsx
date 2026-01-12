import { DeletedTask, TaskPriority } from "@/api/taskApi";
import dayjs from "dayjs";
import React from "react";
import { Text, View } from "react-native";
import { Checkbox } from "react-native-paper";

const PRIORITY_COLOR_MAP: Record<TaskPriority, string> = {
  LOW: "#6BBF59",
  MEDIUM: "#F2B705",
  HIGH: "#E63946",
};

export default function TaskItem({
  task,
  isSelected,
  onToggle,
}: {
  task: DeletedTask;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const dateRange = `${dayjs(task.startDate).format("DD/MM/YYYY HH:mm")} → ${dayjs(
    task.dueDate
  ).format("DD/MM/YYYY HH:mm")}`;

  const barColor = PRIORITY_COLOR_MAP[task.priority];
  return (
    <View className="flex-row w-full mb-2">
      {/* Priority bar */}
      <View style={{ backgroundColor: barColor }} className="w-2 rounded-sm" />

      {/* Content */}
      <View className="flex-1 bg-[#F2EFF0] px-3 py-2 flex-row items-center justify-between">
        <View className="flex-1 space-y-[2px]">
          <Text className="text-[12px] text-[#49454F] font-PoppinsSemiBold">
            {task.planCode}
          </Text>

          <Text className="text-[16px] font-medium text-[#0F0C0D]">
            {task.content}
          </Text>

          <Text className="text-[12px] text-[#0F0C0D]">{dateRange}</Text>

          <Text className="text-[12px] text-[#FF5F57]">
            Delete at: {dayjs(task.deletedAt).format("DD/MM/YYYY HH:mm")}
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
