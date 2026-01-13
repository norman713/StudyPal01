import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";

const chatbotImage = require("../../../../assets/images/ChatbotLogoWithText.png");
export default function ChatBotSection({ teamId }: { teamId?: string }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(me)/ChatbotScreen",
          params: teamId ? { teamId } : undefined,
        })
      }
      className="mb-5"
    >
      <View className="bg-white  py-2">
        <Image
          source={chatbotImage}
          className="w-full h-12"
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}
