import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import ProfileScreen from "./profile";

export default function ProfileRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F2EFF0]">
        <ActivityIndicator size="large" color="#90717E" />
      </View>
    );
  }

  return <ProfileScreen userId={id} />;
}
