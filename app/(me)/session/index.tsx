import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  BackHandler,
  Pressable,
  Text,
  View,
} from "react-native";
import sessionApi, { SessionSettings } from "../../../api/sessionApi";

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
  return h * 3600 + m * 60 + (s || 0);
};

const secondsToHHMM = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  // If we want to show seconds in the timer, we should return HH:mm:ss logic if needed,
  // but for the INPUTS we use HH:mm.
  // The TIMER display uses `formatTime` which includes seconds.
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const calcStages = (total: number, focus: number, rest: number) => {
  const cycle = focus + rest;
  if (cycle <= 0) return 0;
  return Math.ceil(total / cycle);
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
  const [totalTime, setTotalTime] = useState("00:00");
  const [focusTime, setFocusTime] = useState("00:00");
  const [breakTime, setBreakTime] = useState("00:00");
  const [musics, setMusics] = useState<MusicItemType[]>([]);

  // Keep track of raw seconds for logic
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  /* ===== SESSION STATE ===== */
  const [studiedAt, setStudiedAt] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [totalStages, setTotalStages] = useState(1);
  const [isBreak, setIsBreak] = useState(false);

  const [strictMode, setStrictMode] = useState(false);

  /* =======================
   MUSIC PLAYER
======================= */

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentMusicIdRef = useRef<string | null>(null);

  const playMusic = async (music?: MusicItemType) => {
    if (!music?.url) return;

    // ✅ Nếu đã có sound và đúng bài → resume
    if (currentMusicIdRef.current === music.id && soundRef.current) {
      await soundRef.current.playAsync();
      return;
    }

    // ❌ Nếu khác bài → stop & recreate
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      currentMusicIdRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(music.url, {
      isLooping: true,
      volume: 0.6,
    });

    soundRef.current = sound;
    currentMusicIdRef.current = music.id;

    await sound.playAsync();
  };

  const pauseMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  };
  const stopMusic = async () => {
    if (!soundRef.current) return;

    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();

    soundRef.current = null;
    currentMusicIdRef.current = null;
  };

  /* ===== DATA LOADING ===== */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await sessionApi.getSettings();
      console.log(
        "🔥 [SESSION] getSettings response:",
        JSON.stringify(data, null, 2)
      );

      // Backend returns seconds, we convert to HH:mm for UI
      setTotalTime(secondsToHHMM(data.totalTimeInSeconds));
      setFocusTime(secondsToHHMM(data.focusTimeInSeconds));
      setBreakTime(secondsToHHMM(data.breakTimeInSeconds));

      // Update the timer initial state
      setSecondsLeft(data.focusTimeInSeconds);

      // Initialize numeric states for logic
      setFocusSeconds(data.focusTimeInSeconds);
      setBreakSeconds(data.breakTimeInSeconds);
      setTotalSeconds(data.totalTimeInSeconds);
      const stages = calcStages(
        data.totalTimeInSeconds,
        data.focusTimeInSeconds,
        data.breakTimeInSeconds
      );
      setTotalStages(stages);

      // Handle music
      // If enableBgMusic is true but we don't know WHICH music, we just select the first one as default?
      // Or we can leave it empty if the user hasn't selected anything locally yet?
      // Since backend only stores boolean, we might want to default to 'rain' if true and no local music is set.
      // For now, let's just respect the boolean for "has music" if possible, but the UI requires specific music item.
      setEnableBgMusic(data.enableBgMusic);

      if (data.enableBgMusic) {
        setMusics([
          {
            id: "rain",
            title: "🌧 Rain sound",
            url: require("@/assets/sound/rain.mp3"),
          },
        ]);
      } else {
        setMusics([]);
      }
    } catch (error) {
      console.log("Error fetching session settings", error);
    }
  };

  /* ===== TIMER ===== */
  const FOCUS_SECONDS = parseTimeToSeconds(focusTime + ":00");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);

  const [isRunning, setIsRunning] = useState(false);
  const [enableBgMusic, setEnableBgMusic] = useState(false);

  /* ===== UI ===== */
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* =======================
     TIMER LOGIC
  ======================= */
  useEffect(() => {
    if (!strictMode) return;

    const onBackPress = () => {
      Alert.alert(
        "Session in progress",
        "You must finish or stop the session before leaving.",
        [{ text: "OK" }]
      );
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => sub.remove();
  }, [strictMode]);

  useEffect(() => {
    if (!strictMode) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        Alert.alert(
          "Session stopped",
          "You left the app. The session has been stopped."
        );

        stopTimer();
      }
    });

    return () => sub.remove();
  }, [strictMode]);

  /* =======================
     TIMER LOGIC
  ======================= */
  useEffect(() => {
    if (showSettings) {
      setIsRunning(false);
    }
  }, [showSettings]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
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
  }, [isRunning, isBreak, currentStage]);

  const handleTimerComplete = () => {
    if (isBreak) {
      if (currentStage >= totalStages) {
        const totalRun = totalStages * (focusSeconds + breakSeconds);
        finishSession(totalRun);
      } else {
        setCurrentStage((s) => s + 1);
        setIsBreak(false);
        setSecondsLeft(focusSeconds);
        // Keep running
      }
    } else {
      // Focus finished

      // Check if we hit the total requested time
      // Elapsed so far = (currentStage - 1) * cycle + focus
      const cycleSeconds = focusSeconds + breakSeconds;
      const elapsedSoFar = (currentStage - 1) * cycleSeconds + focusSeconds;

      // If we have reached or exceeded total time, we stop here (skip break)
      if (elapsedSoFar >= totalSeconds) {
        finishSession(elapsedSoFar);
        return;
      }

      // Go to break
      setIsBreak(true);
      setSecondsLeft(breakSeconds);
      // Keep running
    }
  };

  /* ===== HELPERS FOR ELAPSED TIME ===== */
  const calcElapsed = () => {
    // If we haven't started, 0
    if (!studiedAt) return 0;

    const cycleSeconds = focusSeconds + breakSeconds;
    const completedStagesSeconds = (currentStage - 1) * cycleSeconds;

    let currentStageElapsed = 0;
    if (isBreak) {
      // Finished focus fully, now in break
      currentStageElapsed = focusSeconds + (breakSeconds - secondsLeft);
    } else {
      // In focus
      currentStageElapsed = focusSeconds - secondsLeft;
    }

    return completedStagesSeconds + currentStageElapsed;
  };

  const finishSession = async (explicitElapsed?: number) => {
    setIsRunning(false);
    setStrictMode(false);
    if (!studiedAt) return;

    // Use explicit value (natural finish) or calculate (manual finish)
    const elapsed = explicitElapsed ?? calcElapsed();

    // Ensure integers
    const finalDuration = Math.round(totalSeconds);
    const finalElapsed = Math.round(elapsed);

    try {
      const payload = {
        studiedAt: studiedAt,
        durationInSeconds: finalDuration, // User requested: session total time
        elapsedTimeInSeconds: finalElapsed, // User requested: time passed
      };

      console.log(
        "🔥 [SESSION] saveSession payload:",
        JSON.stringify(payload, null, 2)
      );

      await sessionApi.saveSession(payload);
      console.log("🔥 [SESSION] saveSession success");

      Alert.alert("Success", "Study session saved!");
    } catch (e: any) {
      console.log("🔥 [SESSION] saveSession error:", e);
      if (e.response) {
        console.log(
          "🔥 [SESSION] saveSession error status:",
          e.response.status
        );
        console.log(
          "🔥 [SESSION] saveSession error data:",
          JSON.stringify(e.response.data, null, 2)
        );
      }
      Alert.alert("Error", "Failed to save session.");
    }

    resetState();
  };

  const togglePlay = () => {
    if (!isRunning && !studiedAt) {
      // First start
      setStudiedAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
      setStrictMode(true);
    }
    setIsRunning((p) => !p);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setStrictMode(false);

    resetState();
  };

  const resetState = () => {
    setIsRunning(false);
    setStudiedAt(null);
    setCurrentStage(1);
    setIsBreak(false);
    setSecondsLeft(focusSeconds); // Reset to focus time
  };

  /* =======================
     PROGRESS
  ======================= */

  // Progress based on current block (Focus or Break)
  const currentTotal = isBreak ? breakSeconds : focusSeconds;
  const progress = currentTotal > 0 ? secondsLeft / currentTotal : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  /* =======================
     MUSIC
  ======================= */

  const hasMusic = enableBgMusic;
  /* =======================
   MUSIC CONTROLLER
======================= */

  useEffect(() => {
    if (!enableBgMusic) {
      stopMusic();
      return;
    }

    if (isRunning) {
      playMusic(musics[0]);
    } else {
      pauseMusic();
    }
  }, [isRunning, enableBgMusic, musics]);

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
      <View className="flex-1 items-center justify-center">
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
        <View className="flex-row items-center gap-10 mb-6">
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

        {/* STATUS TEXT */}
        <View className="mb-4">
          <Text className="text-white/80 font-bold text-[16px]">
            {isBreak ? "REST TIME" : "FOCUS TIME"}
          </Text>
          <Text className="text-white/60 text-center text-[14px]">
            Stage {currentStage} / {totalStages}
          </Text>
        </View>

        {/* FINISH */}
        <Pressable
          onPress={() => finishSession()}
          className="border-[3px] border-white rounded-full px-8 py-3"
        >
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
        onSave={async (data: SessionSettingData) => {
          try {
            const fSeconds = parseTimeToSeconds(data.focusTime + ":00");
            const bSeconds = parseTimeToSeconds(data.breakTime + ":00");
            const tSeconds = parseTimeToSeconds(data.totalTime + ":00");
            const enableBgMusic = data.musics.length > 0;

            const payload: SessionSettings = {
              focusTimeInSeconds: fSeconds,
              breakTimeInSeconds: bSeconds,
              totalTimeInSeconds: tSeconds,
              enableBgMusic,
            };

            console.log(
              "🔥 [SESSION] updateSettings payload:",
              JSON.stringify(payload, null, 2)
            );

            await sessionApi.updateSettings(payload);
            console.log("🔥 [SESSION] updateSettings success");

            setTotalTime(data.totalTime);
            setFocusTime(data.focusTime);
            setBreakTime(data.breakTime);
            setMusics(data.musics);

            // Update internal numeric state
            setFocusSeconds(fSeconds);
            setBreakSeconds(bSeconds);
            setTotalSeconds(tSeconds);

            const stages = calcStages(tSeconds, fSeconds, bSeconds);
            setTotalStages(stages);

            // Reset timer
            resetState();

            setShowSettings(false);
          } catch (e) {
            Alert.alert("Error", "Failed to save settings");
          }
        }}
      />
    </LinearGradient>
  );
}
