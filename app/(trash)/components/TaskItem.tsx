import { DeletedTask, TaskPriority } from "@/api/taskApi";
import dayjs from "dayjs";
import React from "react";
import { Pressable, Text, View } from "react-native";

const PRIORITY_COLOR_MAP: Record<TaskPriority, string> = {
  LOW: "#6BBF59",
  MEDIUM: "#F2B705",
  HIGH: "#E63946",
};

export default function TaskItem({
  task,
  selected,
  onPress,
}: {
  task: DeletedTask;
  selected: boolean;
  onPress: () => void;
}) {
  const barColor = PRIORITY_COLOR_MAP[task.priority];

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        marginBottom: 8,
        borderRadius: 10,
        backgroundColor: selected ? "#E8E2E5" : "#F2EFF0",
        borderWidth: selected ? 2 : 0,
        borderColor: "#90717E",
      }}
    >
      {/* Priority bar */}
      <View
        style={{
          backgroundColor: barColor,
          width: 6,
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
        }}
      />

      {/* Content */}
      <View style={{ flex: 1, padding: 12 }}>
        <Text className="text-[16px] font-medium text-[#0F0C0D]">
          {task.content}
        </Text>

        <Text className="text-[12px] text-[#0F0C0D]">
          {dayjs(task.startDate).format("HH:mm DD MMM, YYYY")} –{" "}
          {dayjs(task.dueDate).format("HH:mm DD MMM, YYYY")}
        </Text>

        <Text className="text-[12px] text-[#FF5F57]">
          Deleted at: {dayjs(task.deletedAt).format("HH:mm DD MMM, YYYY")}
        </Text>
      </View>
    </Pressable>
  );
}
