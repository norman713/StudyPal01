import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Appbar } from "react-native-paper";

type Reminder = {
  id: string;
  date: string;
  time: string;
};

export default function Reminders() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", date: "12 Dec, 2025", time: "12:00" },
    { id: "2", date: "12 Dec, 2025", time: "12:00" },
    { id: "3", date: "12 Dec, 2025", time: "12:00" },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = () => {
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
        // Show time picker after date is selected
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
      if (event.type === "set" && date) {
        setSelectedTime(date);
        // Save the reminder
        saveReminder();
      }
    } else {
      if (date) {
        setSelectedTime(date);
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
    saveReminder();
  };

  const saveReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const handleCancel = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction
          color="#fff"
          onPress={() => router.back()}
          style={{ marginLeft: 10 }}
        />
        <Appbar.Content
          title="Reminder"
          titleStyle={{
            color: "#fff",
            fontWeight: "600",
            fontSize: 16,
          }}
        />
      </Appbar.Header>

      <ScrollView className="flex-1 p-4">
        <View className="bg-[#F8F6F7] p-4">
          {/* Section Header */}
          <View className="flex-row justify-between items-center mb-5 px-2">
            <Text className="text-[16px] font-semibold">Reminders</Text>
            <Pressable
              onPress={handleAddReminder}
              className="w-5 h-5 justify-center items-center"
            >
              <Ionicons name="add" size={18} color="#90717E" />
            </Pressable>
          </View>

          {/* Reminders List */}
          {reminders.length > 0 && (
            <View className="space-y-2">
              {reminders.map((reminder) => (
                <View
                  key={reminder.id}
                  className="bg-[#F2EFF0] flex-row justify-between items-center px-2 py-1 mb-3 rounded-lg"
                >
                  <View className="flex-row items-center space-x-2">
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color="#92AAA5"
                      className="mr-2"
                    />
                    <Text className="text-[16px] font-normal text-[#0F0C0D]">
                      {reminder.time} {reminder.date}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteReminder(reminder.id)}
                    className="p-2"
                  >
                    <Ionicons name="close" size={18} color="#90717E" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal for Android */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker Modal for Android */}
      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
