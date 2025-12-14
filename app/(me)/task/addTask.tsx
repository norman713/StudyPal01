import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TPriority = "high" | "medium" | "low";

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  // Mock data - replace with actual API call
  const [taskName, setTaskName] = useState("Task A");
  const [taskNote, setTaskNote] = useState("This is task A note");
  const [fromTime, setFromTime] = useState("12:00");
  const [fromDate, setFromDate] = useState("12-12-1212");
  const [toTime, setToTime] = useState("12:00");
  const [toDate, setToDate] = useState("12-12-1212");
  const [priority, setPriority] = useState<TPriority>("high");

  const getPriorityColor = (p: TPriority) => {
    switch (p) {
      case "high":
        return "#FF5F57";
      case "medium":
        return "#FEBC2F";
      case "low":
        return "#27C840";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 h-14 bg-[#90717E]">
        {/* Left group: Back + Title */}
        <View className="flex-row items-center gap-2.5">
          <Pressable onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#F8F6F7" />
          </Pressable>

          <Text
            numberOfLines={1}
            className="text-lg font-semibold text-[#F8F6F7]"
          >
            Add new task
          </Text>
        </View>

        {/* Delete button */}
        <Pressable className="ml-auto p-1">
          <MaterialIcons name="delete" size={24} color="#F8F6F7" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* Task ID and Check */}
        <View className="bg-white p-4 gap-2">
          <View style={styles.taskHeader}>
            <Text style={styles.taskId}>TSK-{taskId || "1"}</Text>
            <View style={styles.checkButton}>
              <Ionicons name="checkmark" size={18} color="#F8F6F7" />
            </View>
          </View>

          {/* Task Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task name</Text>
            <TextInput
              style={styles.input}
              value={taskName}
              onChangeText={setTaskName}
            />
          </View>

          {/* Task Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task note (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={taskNote}
              onChangeText={setTaskNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* From Time and Date */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>From time</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={fromTime}
                  onChangeText={setFromTime}
                />
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>From date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={fromDate}
                  onChangeText={setFromDate}
                />
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>
          </View>

          {/* To Time and Date */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To time</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={toTime}
                  onChangeText={setToTime}
                />
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>To date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  value={toDate}
                  onChangeText={setToDate}
                />
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color="#49454F"
                  style={styles.icon}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityContainer}>
            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("high")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "high" && styles.radioSelected,
                  { borderColor: getPriorityColor("high") },
                ]}
              >
                {priority === "high" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("high") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>High</Text>
            </Pressable>

            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("medium")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "medium" && styles.radioSelected,
                  { borderColor: getPriorityColor("medium") },
                ]}
              >
                {priority === "medium" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("medium") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>Medium</Text>
            </Pressable>

            <Pressable
              style={styles.priorityOption}
              onPress={() => setPriority("low")}
            >
              <View
                style={[
                  styles.radio,
                  priority === "low" && styles.radioSelected,
                  { borderColor: getPriorityColor("low") },
                ]}
              >
                {priority === "low" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: getPriorityColor("low") },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.priorityText}>Low</Text>
            </Pressable>
          </View>
        </View>

        {/* Save Button */}
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EFF0",
  },
  header: {
    backgroundColor: "#90717E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#F8F6F7",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
    backgroundColor: "#F8F6F7",
    marginBottom: 10,
  },
  taskId: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#92AAA5",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#FEF7FF",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#0F0C0D",
    backgroundColor: "#FEF7FF",
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  inputWithIcon: {
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 8,
  },
  section: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
    paddingHorizontal: 9,
    marginBottom: 10,
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
    fontFamily: "Poppins_400Regular",
    color: "#1E1E1E",
  },
  menuItem: {
    backgroundColor: "#F8F6F7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0F0C0D",
  },
  saveButton: {
    backgroundColor: "#90717E",
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});
