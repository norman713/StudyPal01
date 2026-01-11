import ErrorModal from "@/components/modal/error";
import { FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import DateRangeModal from "../(team)/components/DateRangeModal";
import sessionApi, { SessionStatisticsResponse } from "../../api/sessionApi";
import taskApi, { TaskStatisticsResponse } from "../../api/taskApi";

const DURATION_OPTIONS = [
  { label: "1 week", value: 7 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

export default function StatisticPage() {
  const [duration, setDuration] = useState<number | "custom">(30);
  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [stats, setStats] = useState<TaskStatisticsResponse>({
    total: 0,
    unfinished: 0,
    low: 0,
    medium: 0,
    high: 0,
  });
  const [sessionStats, setSessionStats] = useState<SessionStatisticsResponse>({
    timeSpentInSeconds: 0,
    completionPercentage: 0,
  });

  // Custom date range state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customRange, setCustomRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      let fromDate: string;
      let toDate: string;
      const FORMAT = "YYYY-MM-DDTHH:mm:ss";

      if (duration === "custom" && customRange) {
        fromDate = customRange.from;
        toDate = customRange.to;
      } else if (typeof duration === "number") {
        toDate = dayjs().format(FORMAT);
        fromDate = dayjs().subtract(duration, "day").format(FORMAT);
      } else {
        // Fallback
        toDate = dayjs().format(FORMAT);
        fromDate = dayjs().subtract(30, "day").format(FORMAT);
      }

      const [taskData, sessionData] = await Promise.all([
        taskApi.getStatistics(fromDate, toDate),
        sessionApi.getStatistics(fromDate, toDate),
      ]);

      setStats(taskData);
      setSessionStats(sessionData);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load statistics. Please try again.";
      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  }, [duration, customRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleCustomAnalyze = (from: Date, to: Date) => {
    const FORMAT = "YYYY-MM-DDTHH:mm:ss";
    setCustomRange({
      from: dayjs(from).startOf("day").format(FORMAT),
      to: dayjs(to).endOf("day").format(FORMAT),
    });
    setDuration("custom");
  };

  const formatHours = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(1);
    return hours.endsWith(".0") ? hours.split(".")[0] : hours;
  };

  return (
    <View className="flex-1  bg-[#F2EFF0]">
      <DateRangeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAnalyze={handleCustomAnalyze}
      />
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />
        <Appbar.Content
          title="Statistics"
          titleStyle={{ color: "#fff", fontWeight: "500", fontSize: 16 }}
        />
      </Appbar.Header>

      <ScrollView className="px-4">
        {/* Duration */}
        <View className="bg-white p-2 mb-3 mt-3 rounded-lg">
          <View className=" flex-row items-center justify-between">
            <Text className="mt-4 mb-2 font-PoppinsSemiBold text-base text-[#3A2E33]">
              Duration
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <FontAwesome5
                name="calendar"
                size={17}
                color={duration === "custom" ? "#90717E" : "black"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {DURATION_OPTIONS.map((item) => {
              const active = item.value === duration;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => setDuration(item.value)}
                  className={`px-4 py-2 rounded-full ${active ? "bg-[#9B7B87]" : "bg-[#B8C6B6]"}`}
                >
                  <Text
                    className={`font-semibold text-sm ${active ? "text-white" : "text-black"}`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        {/* Sessions analysis */}
        <View className="bg-white p-2 rounded-lg mb-3">
          <Text className="mb-3 font-PoppinsSemiBold text-base text-[#3A2E33]">
            My sessions analysis
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#90717E" className="py-4" />
          ) : (
            <View className="flex-row gap-4 mb-8">
              <StatCard
                value={`${sessionStats.completionPercentage.toFixed(1)}`}
                label="Study sessions finished"
                suffix="%"
                bgClass="bg-[#E3DBDF]"
                textClass="text-[#90717E]"
              />
              <StatCard
                value={`${formatHours(sessionStats.timeSpentInSeconds)}`}
                label="Spent on study sessions"
                suffix="h"
                bgClass="bg-[#F2EFF0]"
                textClass="text-[#92AAA5]"
              />
            </View>
          )}
        </View>

        {/* Tasks analysis */}
        <View className="bg-white p-2 rounded-lg">
          <Text className="mb-3 font-PoppinsSemiBold text-base text-[#3A2E33]">
            My tasks analysis
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#90717E" className="py-10" />
          ) : (
            <View className="items-center mb-10">
              <DonutChart stats={stats} />
              <Legend stats={stats} />
            </View>
          )}
        </View>
      </ScrollView>
      <ErrorModal
        visible={errorVisible}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  value,
  label,
  suffix,
  bgClass,
  textClass 
}: {
  value: string;
  label: string;
  suffix: string;
  bgClass : string,
  textClass: string
}) {
  return (
    <View className={`flex-1 rounded-2xl p-5 items-center ${bgClass}`}>
      <Text className={`text-[35px] font-PoppinsBold ${textClass}`}>
        {value}
        <Text className={`text-[20px] font-PoppinsBold ${textClass}`}>
          {suffix}
        </Text>
      </Text>
      <Text className="mt-2 text-center font-normal text-[13px] text-black">
        {label}
      </Text>
    </View>
  );
}

function DonutChart({ stats }: { stats: TaskStatisticsResponse }) {
  const size = 160;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate total from segments to ensure 100% chart fill
  const total = stats.high + stats.medium + stats.low + stats.unfinished;
  const safeTotal = total === 0 ? 1 : total;

  // Calculate percentages
  const highP = (stats.high / safeTotal) * 100;
  const mediumP = (stats.medium / safeTotal) * 100;
  const lowP = (stats.low / safeTotal) * 100;
  const unfinishedP = (stats.unfinished / safeTotal) * 100;

  const segments = [
    { percent: highP, color: "#FF5F57" }, // High
    { percent: mediumP, color: "#FFC83D" }, // Medium
    { percent: lowP, color: "#3CD070" }, // Low
    { percent: unfinishedP, color: "#9B7B87" }, // Unfinished
  ];

  let offset = 0;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#F8F6F7"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {segments.map((seg, index) => {
        if (seg.percent <= 0) return null;
        const length = (circumference * seg.percent) / 100;
        const strokeDasharray = `${length} ${circumference - length} `;
        const strokeDashoffset = -offset;

        offset += length;

        return (
          <Circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            fill="none"
            strokeLinecap="butt"
            rotation="-90"
            origin={`${size / 2}, ${size / 2} `}
          />
        );
      })}
    </Svg>
  );
}

function Legend({ stats }: { stats: TaskStatisticsResponse }) {
  // Use same total logic as chart to match percentages
  const total = stats.high + stats.medium + stats.low + stats.unfinished;
  const safeTotal = total === 0 ? 1 : total;

  const getPercent = (val: number) =>
    ((val / safeTotal) * 100).toFixed(1) + "%";

  const items = [
    { label: "High", color: "#FF5F57", value: getPercent(stats.high) },
    { label: "Medium", color: "#FFC83D", value: getPercent(stats.medium) },
    { label: "Low", color: "#3CD070", value: getPercent(stats.low) },
    {
      label: "Unfinished",
      color: "#9B7B87",
      value: getPercent(stats.unfinished),
    },
  ];

  return (
    <View className="mt-5 w-full px-2">
      <View className="flex-row justify-between gap-x-4">
        {items.map((item) => (
          <View
            key={item.label}
            className="flex-col items-center justify-center"
          >
            {/* Box with color and label in one row */}
            <View className="flex-row items-center">
              <View
                className="w-5 h-5 mr-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <Text className="text-[13px] font-normal text-[#3A2E33]">
                {item.label}
              </Text>
            </View>
            {/* Number (percentage) in separate row */}
            <Text className="text-black font-PoppinsBold text-[13px] mt-1">
              {item.value}
            </Text>
          </View>
        ))}
      </View>
      <Text className="text-center mt-4 text-gray-500 text-xs">
        Total tasks: {stats.total}
      </Text>
    </View>
  );
}
