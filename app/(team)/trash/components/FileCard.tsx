import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type FileItem = {
  name: string;
};

export default function FileCard({ file }: { file: FileItem }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="w-[175px] h-[153px] bg-[#F8F6F7] rounded-2xl p-3 justify-between"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 flex-1">
          <Ionicons name="document-outline" size={16} color="#0F0C0D" />
          <Text
            numberOfLines={1}
            className="text-[16px] font-medium text-[#0F0C0D] flex-shrink"
          >
            {file.name}
          </Text>
        </View>

        <TouchableOpacity hitSlop={10}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={18}
            color="#0F0C0D"
          />
        </TouchableOpacity>
      </View>

      {/* File Image */}
      <View className="flex-1 items-center justify-center">
        <Image
          source={require("@/assets/images/file.png")}
          resizeMode="contain"
          className="w-[80px] h-[80px]"
        />
      </View>
    </TouchableOpacity>
  );
}
