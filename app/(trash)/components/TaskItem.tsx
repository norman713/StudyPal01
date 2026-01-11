import { DeletedTask, TaskPriority } from "@/api/taskApi";
import { FontAwesome } from "@expo/vector-icons";
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
  const barColor = PRIORITY_COLOR_MAP[task.priority];

  return (
    <View className="flex-row w-full mb-2">
      {/* Priority bar */}
      <View style={{ backgroundColor: barColor }} className="w-2 rounded-sm" />

      {/* Content */}
      <View className="flex-1 bg-[#F2EFF0] px-3 py-2 flex-row items-center justify-between">
        <View className="flex-1 space-y-[2px]">
          {/* Title + cloned icon */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {task.taskType === "CLONED" && (
              <FontAwesome
                name="refresh"
                size={14}
                color="#7D8B91"
                style={{ marginRight: 6 }}
              />
            )}

            <Text className="text-[16px] font-medium text-[#0F0C0D]">
              {task.content}
            </Text>
          </View>

          <Text className="text-[12px] text-[#0F0C0D]">
            {dayjs(task.startDate).format("HH:mm DD MMM, YYYY")} -{" "}
            {dayjs(task.dueDate).format("HH:mm DD MMM, YYYY")}
          </Text>

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
