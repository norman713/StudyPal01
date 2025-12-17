import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Folder = {
  name: string;
  itemCount?: number;
};

export default function FolderCard({
  folder,
  onPress,
}: {
  folder: Folder;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="w-[175px] h-[153px] bg-[#F8F6F7] rounded-2xl p-3 justify-between"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 flex-1">
          <Ionicons name="folder" size={16} color="#0F0C0D" />
          <Text
            numberOfLines={1}
            className="text-[16px] font-medium text-[#0F0C0D] flex-shrink"
          >
            {folder.name}
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

      {/* Folder Image */}
      <View className="flex-1 items-center justify-center">
        <Image
          source={require("@/assets/images/folder.png")}
          resizeMode="contain"
          className="w-[90px] h-[70px]"
        />
      </View>

      {/* Footer */}
      {typeof folder.itemCount === "number" && (
        <Text className="text-[12px] text-[#49454F]">
          {folder.itemCount} items
        </Text>
      )}
    </TouchableOpacity>
  );
}
