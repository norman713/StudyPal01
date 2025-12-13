import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import ChatBotSection from "./task/components/Chatbot";
import HeaderSection from "./task/components/Header";
import TaskListSection from "./task/components/TaskList";

export default function TaskScreen() {
  return (
    <View className="flex-1 bg-[#F8F6F7]">
      <Header items={[]} onSelect={() => {}} />

      <FlatList
        data={[1]}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.container}>
            <HeaderSection />
            <ChatBotSection />
            <TaskListSection />
          </View>
        }
        keyExtractor={() => "main"}
        showsVerticalScrollIndicator={false}
      />

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
    paddingBottom: 100,
  },
});
