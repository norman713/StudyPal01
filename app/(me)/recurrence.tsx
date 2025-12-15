import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Appbar } from "react-native-paper";

type RecurrenceType = "NONE" | "DAILY" | "WEEKLY";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RecurrenceScreen() {
  const [type, setType] = useState<RecurrenceType>("WEEKLY");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Wed"]);

  const [fromDate, setFromDate] = useState("12-12-2025");
  const [toDate, setToDate] = useState("12-12-2025");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
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
          title="Recurrence"
          titleStyle={{
            color: "#fff",
            fontWeight: "600",
            fontSize: 16,
          }}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* TYPE */}
        <View className="bg-white p-4 mb-4">
          <Text className="text-xl font-semibold text-[#0F0C0D] mb-3">
            Type
          </Text>
          <View className="flex-row justify-between px-6 py-4">
            {[
              { key: "NONE", label: "None" },
              { key: "DAILY", label: "Daily" },
              { key: "WEEKLY", label: "Weekly" },
            ].map((item) => {
              const active = type === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setType(item.key as RecurrenceType)}
                  className="flex-row items-center gap-2"
                >
                  <View className="w-[18px] h-[18px] rounded-full border-2 border-[#90717E] items-center justify-center">
                    {active && (
                      <View className="w-2 h-2 rounded-full bg-[#90717E]" />
                    )}
                  </View>
                  <Text className="text-[16px] text-[#0F0C0D]">
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* WEEKLY DAYS */}
          {type === "WEEKLY" && (
            <View className="flex-row justify-between mb-6">
              {WEEK_DAYS.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg ${
                      active ? "bg-[#90717E]" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[16px] ${
                        active ? "text-white font-semibold" : "text-[#0F0C0D]"
                      }`}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* DURATION */}
        <View className="bg-white p-4">
          <Text className="text-xl font-semibold text-[#0F0C0D] mb-3">
            Duration
          </Text>

          <View className="flex-row gap-3">
            <DateInput
              label="From date"
              value={fromDate}
              onChangeText={setFromDate}
            />
            <DateInput
              label="To date"
              value={toDate}
              onChangeText={setToDate}
            />
          </View>
        </View>

        {/* SAVE */}
        <Pressable className="mt-8 bg-[#90717E] rounded-full py-3 items-center">
          <Text className="text-white text-base font-semibold">Save</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* =======================
   DATE INPUT + FORMAT
======================= */

function formatDateInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);

  let day = digits.slice(0, 2);
  let month = digits.slice(2, 4);
  let year = digits.slice(4, 8);

  if (day.length === 2) {
    const d = Number(day);
    if (d < 1) day = "01";
    if (d > 31) day = "31";
  }

  if (month.length === 2) {
    const m = Number(month);
    if (m < 1) month = "01";
    if (m > 12) month = "12";
  }

  if (year.length === 4) {
    const y = Number(year);
    if (y < 1900) year = "1900";
    if (y > 2099) year = "2099";
  }

  let result = day;
  if (month) result += `-${month}`;
  if (year) result += `-${year}`;

  return result;
}

function DateInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="flex-1 relative">
      {/* Floating label */}
      <Text
        className="absolute -top-2 left-4 z-10 px-1 text-[13px] text-[#49454F]"
        style={{ backgroundColor: "#FEF7FF" }}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center justify-between px-4 border rounded-full"
        style={{
          borderColor: "#79747E",
          backgroundColor: "#FEF7FF",
        }}
      >
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(formatDateInput(text))}
          placeholder="dd-mm-yyyy"
          keyboardType="number-pad"
          maxLength={10}
          className="flex-1 text-[15px] text-[#0F0C0D]"
        />

        <Ionicons name="calendar-outline" size={20} color="#49454F" />
      </View>
    </View>
  );
}
