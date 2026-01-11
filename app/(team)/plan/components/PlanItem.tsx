import { Plan } from "@/api/planApi";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProgressCircle from "./ProgressCircle";

interface PlanItemProps {
  plan: Plan;
  onPress: () => void;
}

export default function PlanItem({ plan, onPress }: PlanItemProps) {
  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format("HH:mm DD MMM, YYYY");
  };

  // useEffect(() => {
  //   console.log(plan.progress);
  // })

  return (
    <TouchableOpacity
      style={styles.planItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.planInfo}>
        <Text style={styles.planName}>{plan.title}</Text>
        <Text style={styles.planDate}>
          {formatDate(plan.startDate)} - {formatDate(plan.dueDate)}
        </Text>
      </View>
      <ProgressCircle progress={plan.progress ?? 0} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2EFF0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
  },
  planInfo: {
    flex: 1,
    marginRight: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  planDate: {
    fontSize: 12,
    color: "#0F0C0D",
    marginTop: 2,
  },
});
