import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";

import SessionSettingsModal, {
  MusicItemType,
  SessionSettingData,
} from "./setting";

/* =======================
   RING CONFIG
======================= */

const SIZE = 220;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* =======================
   HELPERS
======================= */

const parseTimeToSeconds = (time: string) => {
  const [h, m, s] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600)
    .toString()
    .padStart(2, "0");

  const m = Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0");

  const sec = (s % 60).toString().padStart(2, "0");

  return `${h}:${m}:${sec}`;
};

const extractYoutubeId = (url: string) => {
  try {
    const u = new URL(url);

    // youtu.be/VIDEO_ID
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }

    // youtube.com/watch?v=VIDEO_ID
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
};

/* =======================
   SCREEN
======================= */

export default function SessionScreen() {
  /* ===== SETTINGS ===== */
  const [totalTime, setTotalTime] = useState("00:11");
  const [focusTime, setFocusTime] = useState("00:05");
  const [breakTime, setBreakTime] = useState("00:02");
  const [musics, setMusics] = useState<MusicItemType[]>([]);

  /* ===== TIMER ===== */
  const FOCUS_SECONDS = parseTimeToSeconds(focusTime + ":00");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);

  const [isRunning, setIsRunning] = useState(false);

  /* ===== UI ===== */
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* =======================
     TIMER LOGIC
  ======================= */
  useEffect(() => {
    if (showSettings) {
      setIsRunning(false);
    }
  }, [showSettings]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const togglePlay = () => setIsRunning((p) => !p);

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /* =======================
     PROGRESS
  ======================= */

  const progress = secondsLeft / FOCUS_SECONDS;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  /* =======================
     MUSIC
  ======================= */

  const currentVideoId =
    musics.length > 0 ? extractYoutubeId(musics[0].url) : null;

  const hasMusic = Boolean(currentVideoId);

  return (
    <LinearGradient
      colors={["#474245", "#ADA1A7"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex-1"
    >
      {/* APP BAR */}
      <View className="pt-12 px-4 flex-row items-center">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white text-[16px] font-bold ml-3">Session</Text>
      </View>

      {/* CONTENT */}
      <View
        className={`flex-1 items-center ${
          hasMusic ? "justify-start" : "justify-center"
        }`}
      >
        {/* RING */}
        <View className="mb-6">
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#90717E" />
                <Stop offset="100%" stopColor="#92AAA5" />
              </SvgGradient>
            </Defs>

            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#FFFFFF"
              strokeWidth={STROKE_WIDTH}
              opacity={0.3}
              fill="none"
            />

            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="url(#ringGrad)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              originX={SIZE / 2}
              originY={SIZE / 2}
            />
          </Svg>

          <View className="absolute inset-0 items-center justify-center ">
            <Text className="text-white text-[42px] font-extrabold">
              {formatTime(secondsLeft)}
            </Text>
          </View>
        </View>

        {/* CONTROLS */}
        <View className="flex-row items-center gap-10 mb-10">
          <Pressable onPress={stopTimer}>
            <FontAwesome6 name="ban" size={40} color="white" />
          </Pressable>

          <Pressable
            onPress={togglePlay}
            className="w-[80px] h-[80px] rounded-full bg-white items-center justify-center"
          >
            <Ionicons
              name={isRunning ? "pause" : "play"}
              size={40}
              color="#5A5256"
            />
          </Pressable>

          <Pressable onPress={() => setShowSettings(true)}>
            <MaterialIcons name="settings" size={40} color="white" />
          </Pressable>
        </View>

        {/* FINISH */}
        <Pressable className="border-[3px] border-white rounded-full px-8 py-3">
          <Text className="text-white text-[24px] font-bold">
            FINISH STUDY SESSION
          </Text>
        </Pressable>
      </View>

      {/* SETTINGS */}
      <SessionSettingsModal
        visible={showSettings}
        initialData={{
          totalTime,
          focusTime,
          breakTime,
          musics,
        }}
        onClose={() => setShowSettings(false)}
        onSave={(data: SessionSettingData) => {
          setTotalTime(data.totalTime);
          setFocusTime(data.focusTime);
          setBreakTime(data.breakTime);
          setMusics(data.musics);
          setSecondsLeft(parseTimeToSeconds(data.focusTime + ":00"));
          setShowSettings(false);
        }}
      />
    </LinearGradient>
  );
}
