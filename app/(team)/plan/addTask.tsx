import planApi, { TaskPriority } from "@/api/planApi";
import ErrorModal from "@/components/modal/error";
import { planCreationStore } from "@/utils/planCreationStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { nanoid } from "nanoid/non-secure";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import AssigneeSelector from "./components/AssigneeSelector";
import PrioritySelector from "./components/PrioritySelector";

type Role = "OWNER" | "ADMIN" | "MEMBER";

export default function AddTaskScreen() {
  const {
    teamId,
    planId,
    role: roleParam,
    content: contentParams,
    description: descriptionParams,
  } = useLocalSearchParams<{
    teamId: string;
    planId: string;
    role: string;
    content: string;
    description: string;
  }>();

  // Form states
  const [taskName, setTaskName] = useState(contentParams || "");
  const [taskNote, setTaskNote] = useState(descriptionParams || "");

  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle DateTimePicker visibility
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const now = dayjs();
  const [fromTime, setFromTime] = useState(now.format("HH:mm"));
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(dayjs().add(7, "day").toDate());

  const nextHour = now.add(1, "hour");
  const [toTime, setToTime] = useState(nextHour.format("HH:mm"));

  // Submit state
  const [loading, setLoading] = useState(false);

  const formatDateDisplay = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const validate = () => {
    if (!taskName.trim()) {
      setErrorMessage("Task name is required");
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    if (!teamId) return;
    const tempId = nanoid();
    setLoading(true);
    try {
      // Check if we are creating a new plan (planId is "new" or missing)
      const isNewPlan = !planId || planId === "new";

      if (isNewPlan) {
        // Save to local store
        const oldTasks = planCreationStore.getTasks();

        const exist = oldTasks.find((task) => task.tempId);

        const data = {
          tempId,
          content: taskName.trim(),
          note: taskNote.trim(),
          startDate: `${dayjs(fromDate).format("YYYY-MM-DD")} ${fromTime}:00`,
          dueDate: `${dayjs(toDate).format("YYYY-MM-DD")} ${toTime}:00`,
          assigneeId: assigneeId || undefined,
          priority,
        };

        if (exist) {
          planCreationStore.updateTask(exist.tempId, data);
        } else {
          planCreationStore.addTask(data);
        }

        router.back();
      } else {
        await planApi.createTask(teamId, planId, {
          content: taskName.trim(),
          note: taskNote.trim(),
          startDate: `${dayjs(fromDate).format("YYYY-MM-DD")} ${fromTime}:00`,
          dueDate: `${dayjs(toDate).format("YYYY-MM-DD")} ${toTime}:00`,
          assigneeId: assigneeId || undefined,
          priority,
        });
        router.back();
      }
    } catch (err: any) {
      console.warn("Failed to create task", err);

      if (!planId || planId === "new") {
        planCreationStore.removeTask(tempId);
      }

      const apiMessage =
        err?.response?.data?.message || err?.message || "Failed to create task";

      setErrorMessage(apiMessage);
      setShowErrorModal(true);
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
          <View>
            <Text style={styles.inputLabel}>Task name</Text>
            <TextInput
              mode="outlined"
              label=""
              value={taskName}
              onChangeText={setTaskName}
              theme={{
                roundness: 99,
                colors: {
                  background: "#fff",
                  outline: "#79747E",
                },
              }}
            />
          </View>

          {/* Task Note */}
          <View>
            <Text style={styles.inputLabel}>Task note (optional)</Text>
            <TextInput
              mode="outlined"
              label=""
              value={taskNote}
              onChangeText={setTaskNote}
              multiline
              numberOfLines={4}
              outlineStyle={styles.inputOutline}
              contentStyle={[styles.inputContent, styles.textAreaContent]}
              theme={{
                roundness: 30,
                colors: {
                  background: "#FFF",
                  outline: "#79747E",
                },
              }}
            />
          </View>

          {/* From Time and Date */}
          <View style={styles.row}>
            {/* From Time */}
            <View>
              <TextInput
                mode="outlined"
                label="From time"
                value={fromTime}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                style={{ width: 130 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons name="time-outline" size={24} color="#49454F" />
                    )}
                    onPress={() => setShowFromTimePicker(true)}
                  />
                }
              />

              {showFromTimePicker && (
                <DateTimePicker
                  value={dayjs(fromDate)
                    .hour(Number(fromTime.split(":")[0]))
                    .minute(Number(fromTime.split(":")[1]))
                    .toDate()}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowFromTimePicker(false);
                    if (selected) {
                      setFromTime(dayjs(selected).format("HH:mm"));
                    }
                  }}
                />
              )}
            </View>

            {/* From Date */}
            <View>
              <TextInput
                mode="outlined"
                label="From date"
                value={formatDateDisplay(fromDate)}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#49454F"
                      />
                    )}
                    onPress={() => setShowFromDatePicker(true)}
                  />
                }
              />
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFromDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setFromDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* To Time and Date */}
          <View style={styles.row}>
            {/* To Time */}
            <View>
              <TextInput
                mode="outlined"
                label="To time"
                value={toTime}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                style={{ width: 130 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons name="time-outline" size={24} color="#49454F" />
                    )}
                    onPress={() => setShowToTimePicker(true)}
                  />
                }
              />

              {showToTimePicker && (
                <DateTimePicker
                  value={dayjs(toDate)
                    .hour(Number(toTime.split(":")[0]))
                    .minute(Number(toTime.split(":")[1]))
                    .toDate()}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowToTimePicker(false);
                    if (selected) {
                      setToTime(dayjs(selected).format("HH:mm"));
                    }
                  }}
                />
              )}
            </View>

            {/* To Date */}
            <View>
              <TextInput
                mode="outlined"
                label="To date"
                value={formatDateDisplay(toDate)}
                editable={false}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#49454F"
                      />
                    )}
                    onPress={() => setShowToDatePicker(true)}
                  />
                }
              />
              {showToDatePicker && (
                <DateTimePicker
                  minimumDate={fromDate}
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowToDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setToDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Priority */}
        <View>
          <PrioritySelector
            priority={priority}
            onPriorityChange={setPriority}
          />
        </View>

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
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
      />
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
    fontSize: 16,
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
    backgroundColor: "#fff",
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

  inputLabel: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
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
