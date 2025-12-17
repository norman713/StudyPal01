import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

const ACCENT = "#90717E";
export type Tab = "tasks" | "documents";

export default function TabSelector({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <View style={styles.container}>
      {(["tasks", "documents"] as Tab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.text, activeTab === tab && styles.activeText]}>
            {tab === "tasks" ? "Tasks" : "Documents"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#E3DBDF",
    borderRadius: 13,
    padding: 3,
    gap: 3,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: ACCENT,
  },
  text: {
    fontSize: 13,
    color: "#0F0C0D",
  },
  activeText: {
    color: "#F8F6F7",
    fontWeight: "600",
  },
});
