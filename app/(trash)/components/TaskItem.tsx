import dayjs from "dayjs";
import React from "react";
import { Text, View } from "react-native";
import { Checkbox } from "react-native-paper";

import { DeletedTask } from "@/api/taskApi";

export default function TaskItem({
  task,
  isSelected,
  onToggle,
}: {
  task: DeletedTask;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row w-full mb-2">
      {/* Left bar (deleted indicator) */}
      <View style={{ backgroundColor: "#FF5F57" }} className="w-2 rounded-sm" />

      {/* Content */}
      <View className="flex-1 bg-[#F2EFF0] px-3 py-2 flex-row items-center justify-between">
        <View className="flex-1 space-y-[2px]">
          {/* Title */}
          <Text className="text-[16px] font-medium text-[#0F0C0D]">
            {task.content}
          </Text>

          {/* Date range */}
          <Text className="text-[12px] text-[#0F0C0D]">
            {dayjs(task.startDate).format("HH:mm DD MMM, YYYY")} -{" "}
            {dayjs(task.dueDate).format("HH:mm DD MMM, YYYY")}
          </Text>

          {/* Deleted at */}
          <Text className="text-[12px] text-[#FF5F57]">
            Deleted at: {dayjs(task.deletedAt).format("HH:mm DD MMM, YYYY")}
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
