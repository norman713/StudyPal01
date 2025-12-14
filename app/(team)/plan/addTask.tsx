import planApi, { TaskPriority } from "@/api/planApi";
import { planCreationStore } from "@/utils/planCreationStore";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import AssigneeSelector from "./components/AssigneeSelector";
import DateTimeInput from "./components/DateTimeInput";
import PrioritySelector from "./components/PrioritySelector";

type Role = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Add New Task Screen - giống design taskDetail
 */
export default function AddTaskScreen() {
  const {
    teamId,
    planId,
    role: roleParam,
  } = useLocalSearchParams<{
    teamId: string;
    planId: string;
    role: string;
  }>();

  // Form states
  const [taskName, setTaskName] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [fromTime, setFromTime] = useState("12:00");
  const [fromDate, setFromDate] = useState("12-12-1212");
  const [toTime, setToTime] = useState("12:00");
  const [toDate, setToDate] = useState("12-12-1212");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");

  // Submit state
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!taskName.trim()) {
      Alert.alert("Error", "Task name is required");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    if (!teamId) return;

    setLoading(true);
    try {
      // Parse dates
      const [fromDay, fromMonth, fromYear] = fromDate.split("-").map(Number);
      const [fromHour, fromMin] = fromTime.split(":").map(Number);
      const startDate = new Date(
        fromYear,
        fromMonth - 1,
        fromDay,
        fromHour,
        fromMin
      );

      const [toDay, toMonth, toYear] = toDate.split("-").map(Number);
      const [toHour, toMin] = toTime.split(":").map(Number);
      const dueDate = new Date(toYear, toMonth - 1, toDay, toHour, toMin);

      // Check if we are creating a new plan (planId is "new" or missing)
      const isNewPlan = !planId || planId === "new";

      if (isNewPlan) {
        // Save to local store
        planCreationStore.addTask({
          content: taskName.trim(),
          note: taskNote.trim(),
          startDate: dayjs(startDate).format("YYYY-MM-DD HH:mm:ss"),
          dueDate: dayjs(dueDate).format("YYYY-MM-DD HH:mm:ss"),
          assigneeId: assigneeId || undefined,
          priority,
        });
        router.back();
      } else {
        // Direct API call for existing plan
        await planApi.createTask(teamId, planId, {
          name: taskName.trim(),
          description: taskNote.trim(),
          startDate: dayjs(startDate).format("YYYY-MM-DD HH:mm:ss"),
          dueDate: dayjs(dueDate).format("YYYY-MM-DD HH:mm:ss"),
          assigneeId: assigneeId || undefined,
        });
        router.back();
      }
    } catch (err) {
      console.warn("Failed to create task", err);
      Alert.alert("Error", "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={styles.header}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content title="Add new task" titleStyle={styles.headerTitle} />
        <View style={styles.placeholderButton} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Main Form Section */}
        <View style={styles.mainFormSection}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>Detail</Text>

          {/* Task Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task name</Text>
            <TextInput
              mode="outlined"
              label=""
              value={taskName}
              onChangeText={setTaskName}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              theme={{
                roundness: 30,
                colors: {
                  background: "#F8F6F7",
                  outline: "#79747E",
                },
              }}
            />
          </View>

          {/* Task Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task note (optional)</Text>
            <TextInput
              mode="outlined"
              label=""
              value={taskNote}
              onChangeText={setTaskNote}
              multiline
              numberOfLines={4}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={[styles.inputContent, styles.textAreaContent]}
              theme={{
                roundness: 30,
                colors: {
                  background: "#F8F6F7",
                  outline: "#79747E",
                },
              }}
            />
          </View>

          {/* From Time and Date */}
          <View style={styles.row}>
            <DateTimeInput
              label="From time"
              value={fromTime}
              onChangeText={setFromTime}
              icon="time-outline"
            />
            <DateTimeInput
              label="From date"
              value={fromDate}
              onChangeText={setFromDate}
              icon="calendar-outline"
            />
          </View>

          {/* To Time and Date */}
          <View style={styles.row}>
            <DateTimeInput
              label="To time"
              value={toTime}
              onChangeText={setToTime}
              icon="time-outline"
            />
            <DateTimeInput
              label="To date"
              value={toDate}
              onChangeText={setToDate}
              icon="calendar-outline"
            />
          </View>
        </View>

        {/* Priority */}
        <PrioritySelector priority={priority} onPriorityChange={setPriority} />

        {/* Assignee */}
        {teamId && (
          <AssigneeSelector
            teamId={teamId}
            selectedAssigneeId={assigneeId}
            onAssigneeChange={setAssigneeId}
          />
        )}
      </ScrollView>
      {/* Create Button */}
      <Pressable
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>Create</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EFF0",
  },
  header: {
    backgroundColor: "#90717E",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholderButton: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  mainFormSection: {
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
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#F8F6F7",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
    fontFamily: "PoppinsBold",
    zIndex: 1,
  },
  input: {
    backgroundColor: "#F8F6F7",
  },
  inputOutline: {
    borderRadius: 30,
    borderWidth: 1,
  },
  inputContent: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: "#0F0C0D",
    paddingHorizontal: 16,
  },
  textAreaContent: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  createButton: {
    backgroundColor: "#90717E",
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: "center",
    margin: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PoppinsBold",
  },
});
