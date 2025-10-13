import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface JoinTeamModalProps {
  visible: boolean;
  avatar: string;
  teamName: string;
  description: string;
  ownerName: string;
  ownerAvatar: string;
  membersCount: number;
  onJoin: () => void;
  onClose: () => void;
}

export default function JoinTeamModal({
  visible,
  avatar,
  teamName,
  description,
  ownerName,
  ownerAvatar,
  membersCount,
  onJoin,
  onClose,
}: JoinTeamModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/60 justify-center items-center" />
      </TouchableWithoutFeedback>

      {/* Main Card*/}
      <View className="absolute inset-0 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-[280px] items-center shadow-md relative gap-2">
          {/* Close Modal */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-3 right-3"
          >
            <MaterialIcons name="close" size={22} color="#90717E" />
          </TouchableOpacity>

          {/* Avatar team */}
          <Image
            source={{ uri: avatar }}
            className="w-[80px] h-[80px] rounded-full mb-4"
            style={{
              borderWidth: 3,
              borderColor: "#F2EFF0",
            }}
          />

          <Text className="text-[17px] font-PoppinsSemiBold text-black text-center">
            {teamName}
          </Text>
          <Text className="text-[13px] text-gray-500 text-center mb-4">
            {description}
          </Text>

          {/* Owner */}
          <View className="flex-row items-center w-full mb-2 gap-1">
            <MaterialIcons name="person" size={20} color="#444" />
            <Text className="text-[13px] text-black font-PoppinsSemiBold">
              Owner:
            </Text>
            <Image
              source={{ uri: ownerAvatar }}
              className="ml-8 w-8 h-8 rounded-full mx-1"
            />
            <Text className="text-[13px] text-black">{ownerName}</Text>
          </View>

          {/* Members */}
          <View className="flex-row items-center w-full mb-5 gap-1">
            <MaterialIcons name="group" size={20} color="#444" />
            <Text className=" text-[13px] text-black font-PoppinsSemiBold">
              Members:
            </Text>
            <Text className="ml-4 text-[13px] text-black">{membersCount}</Text>
          </View>

          {/* Join button */}
          <TouchableOpacity
            onPress={onJoin}
            className="bg-[#90717E] rounded-full w-full py-3 items-center"
          >
            <Text className="text-white font-PoppinsRegular text-[15px]">
              Join
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
