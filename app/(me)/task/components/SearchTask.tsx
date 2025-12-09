import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import TaskItem from "./Task/TaskItem";
const addButtonImg = require("../../../../assets/images/Addbutton.png");

type TPriority = "high" | "medium" | "low";

type TTask = {
  id: number;
  name: string;
  start: string;
  end: string;
  priority: TPriority;
  completed: boolean;
  repeat?: boolean;
};

export default function SearchTasksScreen() {
  const [taskName, setTaskName] = useState("");
  const [fromDate, setFromDate] = useState("12-12-1212");
  const [toDate, setToDate] = useState("12-12-1212");

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  const [tasks] = useState<TTask[]>([
    {
      id: 1,
      name: "Task 1",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "high",
      completed: false,
      repeat: true,
    },
    {
      id: 2,
      name: "Task 2",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "medium",
      completed: true,
    },
    {
      id: 3,
      name: "Task 3",
      start: "12:00 27 Oct, 2025",
      end: "24:00 29 Oct, 2025",
      priority: "low",
      completed: true,
    },
  ]);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="bg-[#90717E] pt-12 pb-3 px-4 flex-row items-center">
        <IconButton
          icon={() => <FontAwesome name="angle-left" size={22} color="#fff" />}
        />
        <Text className="text-white text-lg font-semibold ml-1">
          Search tasks
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-2">
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
              value={fromDate}
              editable={false}
              outlineStyle={{ borderRadius: 12 }}
              right={
                <TextInput.Icon
                  icon={() => (
                    <FontAwesome name="calendar" size={20} color="#555" />
                  )}
                  onPress={() => setShowFromPicker(!showFromPicker)}
                />
              }
            />

            {showFromPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="calendar" // UI đẹp & không lag
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setFromDate(formatDate(selectedDate));
                  }
                  setShowFromPicker(false);
                }}
              />
            )}
          </View>

          {/* To date */}
          <View className="flex-1 ml-2">
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
                  onPress={() => setShowToPicker(!showToPicker)}
                />
              }
            />

            {showToPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setToDate(formatDate(selectedDate));
                  }
                  setShowToPicker(false);
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
        >
          Search
        </Button>

        {/* Filter label */}
        <View className="flex-row items-center mb-2">
          <FontAwesome name="filter" size={20} color="#444" />
          <Text className="ml-2 text-xl font-bold">Tasks</Text>
        </View>

        {/* Task list */}
        <View className="mb-10">
          {tasks.map((t) => (
            <TaskItem key={t.id} task={t} />
          ))}
        </View>
      </ScrollView>

      {/* ADD NEW TASK BUTTON */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={() => console.log("Add new task")}
          activeOpacity={0.7}
        >
          <Image
            source={addButtonImg}
            style={{ width: 70, height: 70 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text className="text-[#90717E] mt-2" style={{ fontSize: 16 }}>
          Add new task
        </Text>
      </View>
    </View>
  );
}
