import { Plan } from "@/api/planApi";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PlanItem from "../PlanItem";

const ACCENT = "#90717E";

interface PlanListProps {
  plans: Plan[];
  loading: boolean;
  onPlanPress: (plan: Plan) => void;
  onSeeAll: () => void;
}

export default function PlanList({
  plans,
  loading,
  onPlanPress,
  onSeeAll,
}: PlanListProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.header} onPress={onSeeAll}>
        <Text style={styles.title}>Plans</Text>
        <FontAwesome5 name="arrow-right" size={20} color="#79747E" />
      </Pressable>

      {/* Content */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color="#E3DBDF" />
          <Text className="mt-3 text-[14px] text-[#79747E] font-medium">
            No plans for this date
          </Text>
        </View>
      ) : (
        plans.map((plan) => (
          <PlanItem
            key={plan.id}
            plan={plan}
            onPress={() => onPlanPress(plan)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  loading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
});
