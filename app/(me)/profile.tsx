import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Divider, Text } from "react-native-paper";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#F4F1EF]">
      {/* ===== Header ===== */}
      <View className="bg-[#9C7C8A] pt-14 pb-20 items-center relative">
        {/* Back button */}
        <TouchableOpacity className="absolute left-4 top-14">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="absolute -bottom-14">
          <View className="w-28 h-28 rounded-full bg-white items-center justify-center">
            <Image
              source={{
                uri: "https://i.pinimg.com/564x/91/ed/4f/91ed4f22f0b6a0f9c6eecb65c4d6c7df.jpg",
              }}
              className="w-24 h-24 rounded-full"
            />
          </View>
        </View>
      </View>

      {/* ===== Content ===== */}
      <View className="mt-20 px-6">
        {/* Name */}
        <Text className="text-center text-xl font-bold mb-6">Nguyetlun115</Text>

        {/* Info */}
        <View className="space-y-4 mb-6">
          <InfoRow
            icon={
              <MaterialIcons name="calendar-today" size={20} color="#555" />
            }
            text="12-12-1212"
          />

          <InfoRow
            icon={<Ionicons name="female" size={20} color="#555" />}
            text="Female"
          />

          <InfoRow
            icon={<MaterialIcons name="email" size={20} color="#555" />}
            text="nguyetkhongcao@gmail.com"
          />
        </View>

        <Divider />

        {/* Actions */}
        <View className="mt-4">
          <ActionRow label="Change profile" />
          <ActionRow label="Reset password" />
          <ActionRow label="Log out" danger />
        </View>
      </View>
    </View>
  );
}

/* ===== Components ===== */

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center space-x-3">
      {icon}
      <Text className="text-gray-800">{text}</Text>
    </View>
  );
}

function ActionRow({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between py-4">
      <Text className={danger ? "text-red-500" : "text-gray-800"}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={danger ? "#EF4444" : "#999"}
      />
    </TouchableOpacity>
  );
}
