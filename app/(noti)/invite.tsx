import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function InvitationPage() {
  const invitations = [
    {
      id: "1",
      teamName: "This is my team",
      sender: "Nguyetlun115",
      time: "09:00 12 Dec, 2025",
      avatar: "https://i.pravatar.cc/100?img=5",
    },
    {
      id: "2",
      teamName: "This is my team",
      sender: "Nguyetlun115",
      time: "09:00 12 Dec, 2025",
      avatar: "https://i.pravatar.cc/100?img=4",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <Text className="ml-4 mt-3 text-[16px] font-PoppinsSemiBold">
        Invitation List
      </Text>
      <ScrollView className="px-4 mt-2 mb-20">
        {invitations.map((inv) => (
          <View
            key={inv.id}
            className="flex-row items-startrounded-lg p-3 mb-3"
          >
            <Image
              source={{ uri: inv.avatar }}
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3 flex-1">
              <Text className="font-PoppinsSemiBold text-black text-[16px]">
                Invitation to {inv.teamName}
              </Text>

              <Text className="text-[12px] text-[#92AAA5] mt-1">
                {inv.time}
              </Text>

              <Text className="text-[13px] text-black mt-1 leading-[18px]">
                {inv.sender} has invited you to team "{inv.teamName}".
              </Text>

              <View className="flex-row gap-3 mt-3">
                <TouchableOpacity className="bg-[#90717E] px-10 py-2 rounded-[100px] justify-center items-center">
                  <Text className="text-white font-PoppinsRegular text-[15px]">
                    Accept
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-[#B8C6B6] px-10 py-2 rounded-[100px] justify-center items-center">
                  <Text className="text-[#0F0C0D] font-PoppinsRegular text-[15px]">
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
