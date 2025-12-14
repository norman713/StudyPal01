import { TaskPriority } from "@/api/planApi";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PrioritySelectorProps {
  priority: TaskPriority;
  onPriorityChange: (priority: TaskPriority) => void;
}

const getPriorityColor = (p: TaskPriority) => {
  switch (p) {
    case "HIGH":
      return "#FF5F57";
    case "MEDIUM":
      return "#FEBC2F";
    case "LOW":
      return "#27C840";
    default:
      return "#FEBC2F";
  }
};

export default function PrioritySelector({
  priority,
  onPriorityChange,
}: PrioritySelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Priority</Text>
      <View style={styles.priorityContainer}>
        <Pressable
          style={styles.priorityOption}
          onPress={() => onPriorityChange("HIGH")}
        >
          <View
            style={[
              styles.radio,
              priority === "HIGH" && styles.radioSelected,
              { borderColor: getPriorityColor("HIGH") },
            ]}
          >
            {priority === "HIGH" && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: getPriorityColor("HIGH") },
                ]}
              />
            )}
          </View>
          <Text style={styles.priorityText}>High</Text>
        </Pressable>

        <Pressable
          style={styles.priorityOption}
          onPress={() => onPriorityChange("MEDIUM")}
        >
          <View
            style={[
              styles.radio,
              priority === "MEDIUM" && styles.radioSelected,
              { borderColor: getPriorityColor("MEDIUM") },
            ]}
          >
            {priority === "MEDIUM" && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: getPriorityColor("MEDIUM") },
                ]}
              />
            )}
          </View>
          <Text style={styles.priorityText}>Medium</Text>
        </Pressable>

        <Pressable
          style={styles.priorityOption}
          onPress={() => onPriorityChange("LOW")}
        >
          <View
            style={[
              styles.radio,
              priority === "LOW" && styles.radioSelected,
              { borderColor: getPriorityColor("LOW") },
            ]}
          >
            {priority === "LOW" && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: getPriorityColor("LOW") },
                ]}
              />
            )}
          </View>
          <Text style={styles.priorityText}>Low</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#F8F6F7",
    padding: 10,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#0F0C0D",
    paddingHorizontal: 9,
    marginBottom: 0,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  priorityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    backgroundColor: "#E6E6E6",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: "#1E1E1E",
  },
});
