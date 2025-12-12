import memberApi from "@/api/memberApi";
import planApi from "@/api/planApi";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";

const ACCENT = "#90717E";

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Add New Task Screen - giống design
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

  // Date/Time picker states
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Assignee states
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<Member | null>(null);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Fetch team members for assignee
  const fetchMembers = useCallback(async () => {
    if (!teamId) return;
    setLoadingMembers(true);
    try {
      const res = await memberApi.getAll(teamId);
      // Map member data to match our interface
      const mappedMembers = (res.members || []).map((m) => ({
        id: m.userId,
        name: m.name,
        avatarUrl: m.avatarUrl,
      }));
      setMembers(mappedMembers);
      // Set default assignee to first member
      if (mappedMembers.length > 0) {
        setSelectedAssignee(mappedMembers[0]);
      }
    } catch (err) {
      // API chưa có - dùng mock data
      console.warn("Member API not available, using mock data");
      // Mock data
      const mockMembers = [
        {
          id: "1",
          name: "Nguyetlun115",
          avatarUrl: "https://i.pravatar.cc/40?img=1",
        },
        {
          id: "2",
          name: "Minh Huy",
          avatarUrl: "https://i.pravatar.cc/40?img=2",
        },
        {
          id: "3",
          name: "Minh Hoàng",
          avatarUrl: "https://i.pravatar.cc/40?img=3",
        },
      ];
      setMembers(mockMembers);
      setSelectedAssignee(mockMembers[0]);
    } finally {
      setLoadingMembers(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Format helpers
  const formatTime = (date: Date) => {
    return dayjs(date).format("HH:mm");
  };

  const formatDate = (date: Date) => {
    return dayjs(date).format("DD-MM-YYYY");
  };

  // Handlers
  const handleFromTimeChange = (event: any, selectedDate?: Date) => {
    setShowFromTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFromTime(formatTime(selectedDate));
    }
  };

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFromDate(formatDate(selectedDate));
    }
  };

  const handleToTimeChange = (event: any, selectedDate?: Date) => {
    setShowToTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setToTime(formatTime(selectedDate));
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setToDate(formatDate(selectedDate));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!taskName.trim()) {
      newErrors.name = "Task name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    if (!teamId || !planId) return;

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

      await planApi.createTask(teamId, planId, {
        name: taskName.trim(),
        description: taskNote.trim(),
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        assigneeId: selectedAssignee?.id,
      });

      router.back();
    } catch (err) {
      // API chưa có - quay lại trang trước
      console.warn("Create Task API not available");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Add new task"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          {/* Detail Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detail</Text>

            {/* Task Name */}
            <TextInput
              mode="outlined"
              label="Task name"
              value={taskName}
              onChangeText={setTaskName}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
              error={!!errors.name}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Task Note */}
            <TextInput
              mode="outlined"
              label="Task note"
              value={taskNote}
              onChangeText={setTaskNote}
              style={styles.inputMultiline}
              outlineStyle={{ borderRadius: 12 }}
              multiline
              numberOfLines={4}
            />

            {/* Time/Date Row - From */}
            <View style={styles.dateTimeRow}>
              {/* From Time */}
              <View style={styles.dateTimeField}>
                <TextInput
                  mode="outlined"
                  label="From time"
                  value={fromTime}
                  editable={false}
                  outlineStyle={{ borderRadius: 12 }}
                  right={
                    <TextInput.Icon
                      icon={() => (
                        <Ionicons name="time-outline" size={20} color="#555" />
                      )}
                      onPress={() => setShowFromTimePicker(true)}
                    />
                  }
                />
                {showFromTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleFromTimeChange}
                  />
                )}
              </View>

              {/* From Date */}
              <View style={styles.dateTimeField}>
                <TextInput
                  mode="outlined"
                  label="From date"
                  value={fromDate}
                  editable={false}
                  outlineStyle={{ borderRadius: 12 }}
                  right={
                    <TextInput.Icon
                      icon={() => (
                        <FontAwesome name="calendar" size={20} color="#555" />
                      )}
                      onPress={() => setShowFromDatePicker(true)}
                    />
                  }
                />
                {showFromDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="calendar"
                    onChange={handleFromDateChange}
                  />
                )}
              </View>
            </View>

            {/* Time/Date Row - To */}
            <View style={styles.dateTimeRow}>
              {/* To Time */}
              <View style={styles.dateTimeField}>
                <TextInput
                  mode="outlined"
                  label="To time"
                  value={toTime}
                  editable={false}
                  outlineStyle={{ borderRadius: 12 }}
                  right={
                    <TextInput.Icon
                      icon={() => (
                        <Ionicons name="time-outline" size={20} color="#555" />
                      )}
                      onPress={() => setShowToTimePicker(true)}
                    />
                  }
                />
                {showToTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleToTimeChange}
                  />
                )}
              </View>

              {/* To Date */}
              <View style={styles.dateTimeField}>
                <TextInput
                  mode="outlined"
                  label="To date"
                  value={toDate}
                  editable={false}
                  outlineStyle={{ borderRadius: 12 }}
                  right={
                    <TextInput.Icon
                      icon={() => (
                        <FontAwesome name="calendar" size={20} color="#555" />
                      )}
                      onPress={() => setShowToDatePicker(true)}
                    />
                  }
                />
                {showToDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="calendar"
                    onChange={handleToDateChange}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Assignee Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Assignee</Text>

            <TouchableOpacity
              style={styles.assigneeSelector}
              onPress={() => setShowAssigneePicker(!showAssigneePicker)}
            >
              {loadingMembers ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : selectedAssignee ? (
                <>
                  {selectedAssignee.avatarUrl ? (
                    <Image
                      source={{ uri: selectedAssignee.avatarUrl }}
                      style={styles.assigneeAvatar}
                    />
                  ) : (
                    <View style={styles.assigneeAvatarPlaceholder}>
                      <Text style={styles.assigneeAvatarText}>
                        {selectedAssignee.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.assigneeName}>
                    {selectedAssignee.name}
                  </Text>
                </>
              ) : (
                <Text style={styles.assigneePlaceholder}>Select assignee</Text>
              )}
              <Ionicons
                name={showAssigneePicker ? "chevron-up" : "chevron-down"}
                size={24}
                color={ACCENT}
              />
            </TouchableOpacity>

            {/* Assignee Dropdown */}
            {showAssigneePicker && (
              <View style={styles.assigneeDropdown}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.assigneeOption,
                      selectedAssignee?.id === member.id &&
                        styles.assigneeOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedAssignee(member);
                      setShowAssigneePicker(false);
                    }}
                  >
                    {member.avatarUrl ? (
                      <Image
                        source={{ uri: member.avatarUrl }}
                        style={styles.optionAvatar}
                      />
                    ) : (
                      <View style={styles.optionAvatarPlaceholder}>
                        <Text style={styles.optionAvatarText}>
                          {member.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.optionName}>{member.name}</Text>
                    {selectedAssignee?.id === member.id && (
                      <Ionicons name="checkmark" size={20} color={ACCENT} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.createButton}
            buttonColor={ACCENT}
            labelStyle={{ fontSize: 16 }}
          >
            Create
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F7",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  inputMultiline: {
    backgroundColor: "#fff",
    marginBottom: 12,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: "#FF5F57",
    marginTop: -8,
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  dateTimeField: {
    flex: 1,
  },
  // Assignee
  assigneeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F6F7",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3DBDF",
  },
  assigneeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  assigneeAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  assigneeAvatarText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  assigneeName: {
    flex: 1,
    fontSize: 16,
    color: "#0F0C0D",
  },
  assigneePlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "#79747E",
  },
  assigneeDropdown: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3DBDF",
    overflow: "hidden",
  },
  assigneeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2EFF0",
  },
  assigneeOptionSelected: {
    backgroundColor: "#F8F6F7",
  },
  optionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  optionAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionAvatarText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  optionName: {
    flex: 1,
    fontSize: 14,
    color: "#0F0C0D",
  },
  // Footer
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E3DBDF",
  },
  createButton: {
    borderRadius: 100,
  },
});
