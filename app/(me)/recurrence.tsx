import taskApi, { RecurrenceRule } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Appbar, TextInput } from "react-native-paper";

dayjs.extend(customParseFormat);

type RecurrenceType = "NONE" | "DAILY" | "WEEKLY";

// Frontend display
const WEEK_DAYS_DISPLAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Backend values
const WEEK_DAYS_BACKEND = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function RecurrenceScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<RecurrenceType>("NONE");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Store full backend day strings in selectedDays? Or map?
  // Let's store Backend strings to make it easier for submitting, map for display.

  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(dayjs().add(1, "week").toDate());

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    console.log("RecurrenceScreen mounted, taskId:", taskId);
    if (taskId) {
      fetchRecurrence();
    }
  }, [taskId]);

  const fetchRecurrence = async () => {
    try {
      setLoading(true);
      console.log("Fetching recurrence for:", taskId);
      const data = await taskApi.getRecurrenceRules(taskId);
      console.log("Fetched recurrence data:", data);
      if (data) {
        setType((data.recurrenceType || "NONE") as RecurrenceType);
        if (data.weekDays) {
          setSelectedDays(data.weekDays);
        }
        if (data.recurrenceStartDate) {
          setFromDate(dayjs(data.recurrenceStartDate).toDate());
        }
        if (data.recurrenceEndDate) {
          setToDate(dayjs(data.recurrenceEndDate).toDate());
        }
      }
    } catch (error: any) {
      console.log("Error fetching recurrence", error?.response?.data || error);
      // If error (e.g. 404 or no rules), just keep defaults
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (backendDay: string) => {
    setSelectedDays((prev) =>
      prev.includes(backendDay)
        ? prev.filter((d) => d !== backendDay)
        : [...prev, backendDay]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const isNone = type === "NONE";

      // Only format dates if type !== NONE
      const start = isNone ? null : `${dayjs(fromDate).format("YYYY-MM-DD")}`;

      const end = isNone ? null : `${dayjs(toDate).format("YYYY-MM-DD")} `;

      const payload: RecurrenceRule = {
        type: type,
        weekDays: type === "WEEKLY" ? selectedDays : null,
        recurrenceStartDate: start,
        recurrenceEndDate: end,
      };

      console.log("Saving payload:", JSON.stringify(payload, null, 2));

      await taskApi.updateRecurrenceRules(taskId, payload);
      router.back();
    } catch (error: any) {
      console.log("Error saving recurrence", error);

      const apiMessage =
        error?.response?.data?.message || "Network error. Please try again.";

      setErrorMessage(apiMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />

        <Appbar.Content
          title="Recurrence"
          titleStyle={{
            fontSize: 16,
            color: "#FFFFFF",
            fontFamily: "Poppins_400Regular",
          }}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading && (
          <ActivityIndicator
            size="small"
            color="#90717E"
            style={{ marginBottom: 10 }}
          />
        )}

        {/* TYPE */}
        <View className="bg-white p-4">
          <Text className="text-xl font-semibold text-[#0F0C0D] mb-3">
            Type
          </Text>

          <View className="flex-row gap-6 mb-4 ">
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
                  <Text className="text-[15px] font-medium text-[#0F0C0D]">
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {/* WEEKLY DAYS */}
          {type === "WEEKLY" && (
            <View className="flex-row justify-between mb-6 flex-wrap">
              {WEEK_DAYS_BACKEND.map((day, index) => {
                const active = selectedDays.includes(day);
                const displayLabel = WEEK_DAYS_DISPLAY[index];
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg mb-2 ${
                      active ? "bg-[#90717E]" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[15px] ${
                        active ? "text-white font-semibold" : "text-[#0F0C0D]"
                      }`}
                    >
                      {displayLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* DURATION */}
        {type !== "NONE" && (
          <View className="bg-white p-4 mt-4">
            <Text className="text-xl font-semibold text-[#0F0C0D] mb-3">
              Duration
            </Text>

            <View className="flex-row gap-3">
              <TextInput
                mode="outlined"
                label="From date"
                value={dayjs(fromDate).format("DD/MM/YYYY")}
                editable={false}
                style={{ width: 150 }}
                contentStyle={{
                  fontSize: 14,
                }}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                right={
                  <TextInput.Icon
                    icon={() => <Ionicons name="calendar-outline" size={22} />}
                    onPress={() => setShowFromDatePicker(true)}
                  />
                }
              />

              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={(e, selected) => {
                    setShowFromDatePicker(false);
                    if (selected) setFromDate(selected);
                  }}
                />
              )}
              <TextInput
                mode="outlined"
                label="To date"
                value={dayjs(toDate).format("DD/MM/YYYY")}
                editable={false}
                style={{ width: 150 }}
                contentStyle={{
                  fontSize: 14,
                }}
                theme={{
                  roundness: 99,
                  colors: {
                    background: "#FFFFFF",
                  },
                }}
                right={
                  <TextInput.Icon
                    icon={() => <Ionicons name="calendar-outline" size={22} />}
                    onPress={() => setShowToDatePicker(true)}
                  />
                }
              />

              {showToDatePicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={(e, selected) => {
                    setShowToDatePicker(false);
                    if (selected) setToDate(selected);
                  }}
                />
              )}
            </View>
          </View>
        )}

        {/* SAVE */}
        <Pressable
          onPress={handleSave}
          className="mt-8 bg-[#90717E] rounded-full py-3 items-center"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">Save</Text>
          )}
        </Pressable>
      </ScrollView>

      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
      />
    </View>
  );
}
