import taskApi, { RecurrenceRule } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

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

  const [fromDate, setFromDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [toDate, setToDate] = useState(
    dayjs().add(1, "week").format("DD-MM-YYYY")
  );

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
          setFromDate(dayjs(data.recurrenceStartDate).format("DD-MM-YYYY"));
        }
        if (data.recurrenceEndDate) {
          setToDate(dayjs(data.recurrenceEndDate).format("DD-MM-YYYY"));
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
      const start = isNone
        ? null
        : dayjs(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD");

      const end = isNone
        ? null
        : dayjs(toDate, "DD-MM-YYYY").format("YYYY-MM-DD");

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

          <View className="flex-row gap-6 mb-4">
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
                  <Text className="text-[15px] text-[#0F0C0D]">
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
        className="flex-row items-center justify-between px-4 py-3 border rounded-full"
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
