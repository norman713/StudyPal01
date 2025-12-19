import taskApi, { PersonalTask } from "@/api/taskApi";
import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { BackHandler, FlatList, StyleSheet, View } from "react-native";

import ChatBotSection from "./task/components/Chatbot";
import HeaderSection from "./task/components/Header";
import TaskListSection from "./task/components/TaskList";

export default function TaskScreen() {
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [userData, setUserData] = useState<any>(null);

  // Helpers
  const loadTaskDates = async (month: number, year: number) => {
    try {
      const dates = await taskApi.getTaskDates(month, year);
      setMarkedDates(dates || []);
    } catch (error) {
      console.error("Failed to load task dates", error);
    }
  };

  const loadTasksForDate = async (date: Date) => {
    try {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const res = await taskApi.getTasksByDate(dateStr);
      setTasks(res || []);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [])
  );

  // Initial Load & Auth Check
  useFocusEffect(
    useCallback(() => {
      const initData = async () => {
        try {
          // 1. Fetch User Summary (Verifies Auth & gets User)
          const { default: userApi } = await import("@/api/userApi");
          const user = await userApi.getSummary();
          setUserData(user);

          // Add delay to prevent race condition/preflight error
          await new Promise((resolve) => setTimeout(resolve, 500));

          // 2. Only if auth succeeds, fetch Tasks
          const now = new Date();
          // We can run these in parallel
          await Promise.all([
            loadTaskDates(now.getMonth() + 1, now.getFullYear()),
            loadTasksForDate(now),
          ]);
        } catch (error) {
          console.error("Failed to initialize task screen", error);
        }
      };

      initData();

      return () => {};
    }, [])
  );

  // Handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadTasksForDate(date);
  };

  const handleMonthChange = (date: Date) => {
    loadTaskDates(date.getMonth() + 1, date.getFullYear());
  };

  const handleToggleTask = (id: string) => {
    // Implement toggle API if available, or just local optimistic update
    // User didn't provide toggle API yet
    console.log("Toggle task", id);
  };

  return (
    <View className="flex-1 bg-[#F8F6F7]">
      <Header scope="me" />
      <View className="flex-1">
        <FlatList
          data={[1]}
          renderItem={null}
          ListHeaderComponent={
            <View style={styles.container}>
              <HeaderSection
                userName={userData?.name || "User"}
                taskCount={tasks.length} // Simple count for selected day
                markedDates={markedDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />
              <ChatBotSection />
              <TaskListSection tasks={tasks} onToggleTask={handleToggleTask} />
            </View>
          }
          keyExtractor={() => "main"}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomBar
        activeTab="me"
        onTabPress={(tab) => {
          switch (tab) {
            case "team":
              router.push("/(team)/search");
              break;
            case "notification":
              router.push("/(noti)");
              break;
            case "me":
              router.push("/");
              break;
            case "trash":
              router.push("/(trash)");
              break;
          }
        }}
        onCenterPress={() => {
          router.push("/(me)/task/addTask");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
