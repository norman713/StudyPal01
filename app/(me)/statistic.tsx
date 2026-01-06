import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Appbar } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

const DURATION_OPTIONS = ["1 week", "30 days", "60 days", "90 days"];

export default function StatisticPage() {
  const [duration, setDuration] = useState("30 days");

  return (
    <View className="flex-1  bg-[#F2EFF0]">
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
        <View className="bg-white p-2 mb-3 mt-3">
          <View className=" flex-row items-center justify-between">
            <Text className="mt-4 mb-2 font-PoppinsSemiBold text-base text-[#3A2E33]">
              Duration
            </Text>
            <FontAwesome5 name="calendar" size={17} color="black" />
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {DURATION_OPTIONS.map((item) => {
              const active = item === duration;
              return (
                <Pressable
                  key={item}
                  onPress={() => setDuration(item)}
                  className={`px-4 py-2 rounded-full ${
                    active ? "bg-[#9B7B87]" : "bg-[#B8C6B6]"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      active ? "text-white" : "text-black]"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        {/* Sessions analysis */}
        <View className="bg-white p-2">
          <Text className="mb-3 font-PoppinsSemiBold text-base text-[#3A2E33]">
            My sessions analysis
          </Text>

          <View className="flex-row gap-4 mb-8">
            <StatCard value="75" label="Study sessions finished" />
            <StatCard2 value="24" label="Spent on study sessions" />
          </View>

          {/* Tasks analysis */}
          <Text className="mb-3 font-PoppinsSemiBold text-base text-[#3A2E33]">
            My tasks analysis
          </Text>

          <View className="items-center mb-10">
            <DonutChart />
            <Legend />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- Components ---------------- */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 bg-[#E3DBDF] rounded-2xl p-5 items-center">
      <Text className="text-[35px] font-PoppinsBold text-[#8C6E79]">
        {value}
        <Text className="text-[20px] font-PoppinsBold text-[#8C6E79]">%</Text>
      </Text>
      <Text className="mt-2 text-center font-normal text-[13px] text-black">
        {label}
      </Text>
    </View>
  );
}
function StatCard2({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 bg-[#F2EFF0] rounded-2xl p-5 items-center">
      <Text className="text-[35px] font-PoppinsBold text-[#92AAA5]">
        {value}
        <Text className="text-[20px] font-PoppinsBold text-[#92AAA5]">h</Text>
      </Text>

      <Text className="mt-2 text-center font-normal text-[13px] text-black">
        {label}
      </Text>
    </View>
  );
}

function DonutChart() {
  const size = 160;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { percent: 50, color: "#FF5F57" }, // High
    { percent: 20, color: "#FFC83D" }, // Medium
    { percent: 15, color: "#3CD070" }, // Low
    { percent: 15, color: "#9B7B87" }, // Unfinished
  ];

  let offset = 0;

  return (
    <Svg width={size} height={size}>
      {segments.map((seg, index) => {
        const length = (circumference * seg.percent) / 100;
        const strokeDasharray = `${length} ${circumference - length}`;
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
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}

function Legend() {
  const items = [
    { label: "High", color: "#FF5F57", value: "40%" },
    { label: "Medium", color: "#FFC83D", value: "20%" },
    { label: "Low", color: "#3CD070", value: "15%" },
    { label: "Unfinished", color: "#9B7B87", value: "15%" },
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
                className="w-5 h-5 mr-2"
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
    </View>
  );
}
