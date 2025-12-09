import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ChatBotSection from "./task/components/Chatbot";
import HeaderSection from "./task/components/Header";
import TaskListSection from "./task/components/TaskList";

export default function Taskcreen() {
  return (
    <View className="flex-1 bg-[#F8F6F7]">
      {/* HEADER cố định */}
      <Header
        items={[]}
        onSelect={function (key: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      {/* THÂN CUỘN ĐƯỢC */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection />
        <ChatBotSection />
        <TaskListSection />
      </ScrollView>

      {/* BOTTOM BAR cố định */}
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
              router.push("/");
              break;
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // để tránh bị che bởi bottom bar
  },
});
