import taskApi, { PersonalTask, SearchTaskRequest } from "@/api/taskApi";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";
import TaskItem from "./Task/TaskItem";
const addButtonImg = require("../../../../assets/images/Addbutton.png");
const ACCENT = "#90717E";

export default function SearchTasksScreen() {
  const [taskName, setTaskName] = useState("");
  // Default dates: today and 7 days from now, or just empty?
  // User example: "2025-12-10 00:00:00"
  // Let's settle on current date for UI, but formatted for API
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(dayjs().add(7, "day").toDate());

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Search results
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDateDisplay = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const handleSearch = async () => {
    try {
      if (!taskName.trim()) {
        // If no keyword, clear list and return or alert?
        // User asked why it calls API. So we should stop it.
        // Let's clear the list to be distinct.
        setTasks([]);
        return;
      }
      if (dayjs(toDate).isBefore(dayjs(fromDate))) {
        alert("To date must be after From date");
        return;
      }
      setLoading(true);

      const request: SearchTaskRequest = {
        keyword: taskName.trim() || undefined,
        fromDate: dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        toDate: dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        size: 20,
      };

      console.log("SEARCH REQUEST", request);

      const response = await taskApi.searchTasks(request);

      console.log("SEARCH RESPONSE", response);

      setTasks(response?.tasks ?? []);
    } catch (error: any) {
      console.error("Failed to search tasks");
      console.error(error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Search tasks"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      <ScrollView className="flex-1 px-5 py-2">
        {/* Search input */}
        <TextInput
          label="Search by task name"
          mode="outlined"
          value={taskName}
          onChangeText={setTaskName}
          outlineStyle={{ borderRadius: 30 }}
        />

        {/* Date Row */}
        <View className="flex-row mb-4 mt-4">
          {/* From date */}
          <View className="flex-1 mr-2">
            <TextInput
              mode="outlined"
              label="From date"
              value={formatDateDisplay(fromDate)}
              editable={false}
              outlineStyle={{ borderRadius: 999 }}
              right={
                <TextInput.Icon
                  icon={() => (
                    <FontAwesome name="calendar" size={20} color="#555" />
                  )}
                  onPress={() => setShowFromPicker(true)}
                />
              }
            />

            {showFromPicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowFromPicker(false);
                  if (event.type === "set" && selectedDate) {
                    setFromDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* To date */}
          <View className="flex-1 ml-2">
            <TextInput
              mode="outlined"
              label="To date"
              value={formatDateDisplay(toDate)}
              editable={false}
              outlineStyle={{ borderRadius: 999 }}
              right={
                <TextInput.Icon
                  icon={() => (
                    <FontAwesome name="calendar" size={20} color="#555" />
                  )}
                  onPress={() => setShowToPicker(true)}
                />
              }
            />

            {showToPicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowToPicker(false);
                  if (event.type === "set" && selectedDate) {
                    setToDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
        </View>

        {/* Search button */}
        <Button
          mode="contained"
          buttonColor="#90717E"
          className="rounded-full mb-6"
          labelStyle={{ fontSize: 16 }}
          onPress={handleSearch}
          loading={loading}
          disabled={loading}
        >
          Search
        </Button>

        {/* Filter label */}
        <View className="flex-row items-center mb-2">
          <FontAwesome name="filter" size={20} color="#444" />
          <Text className="ml-2 text-xl font-bold">Tasks ({tasks.length})</Text>
        </View>

        {/* Task list */}
        <View className="mb-10">
          {tasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onPress={() => {
                if (t.taskType === "PERSONAL" || t.taskType === "CLONED") {
                  router.push({
                    pathname: "/(me)/task/taskDetail",
                    params: { taskId: t.id },
                  });
                } else if (t.taskType === "TEAM") {
                  router.push({
                    pathname: "/(team)/plan/taskDetail",
                    params: { taskId: t.id },
                  });
                }
              }}
              onToggle={() => console.log("Toggle task", t.id)}
            />
          ))}
          {tasks.length === 0 && !loading && (
            <Text className="text-gray-500 text-center mt-4">
              No tasks found
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ADD NEW TASK BUTTON */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={() => router.push("/(me)/task/addTask")}
          activeOpacity={0.7}
        >
          <Image
            source={addButtonImg}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text
          className="text-[#90717E] font-normal mt-2"
          style={{ fontSize: 16 }}
        >
          Add new task
        </Text>
      </View>
    </View>
  );
}
