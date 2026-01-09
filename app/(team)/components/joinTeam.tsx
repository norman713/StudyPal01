import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";

interface JoinTeamModalProps {
  visible: boolean;
  avatar?: string | null;
  ownerAvatar?: string | null;
  teamName: string;
  description?: string | null;
  ownerName: string;
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
        <View className="bg-white rounded-[30px] p-7 w-[280px] items-center shadow-md relative gap-2">
          {/* Close Modal */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-5 right-5"
          >
            <MaterialIcons name="close" size={22} color="#90717E" />
          </TouchableOpacity>

          {/* Avatar team */}
          {avatar ? (
            <Avatar.Image
              size={80}
              source={{ uri: avatar }}
              style={{
                marginBottom: 16,
                borderColor: "#F2EFF0",
              }}
            />
          ) : (
            <Avatar.Text
              size={80}
              label={teamName ? teamName.charAt(0).toUpperCase() : "U"}
              labelStyle={{
                fontSize: 50,
                fontWeight: "400",
                color: "#fff",
              }}
              style={{
                backgroundColor: "#6B4EFF",
                marginRight: 8,
                marginBottom: 16,
              }}
            />
          )}
          <View className="gap-1">
            <Text className="text-[17px] font-PoppinsSemiBold text-black text-center">
              {teamName}
            </Text>
            <Text className="text-[13px] font-normal text-[#92AAA5] text-center mb-4">
              {description ?? ""}
            </Text>
          </View>

          {/* Owner */}
          <View className="flex-row items-center w-full mb-2 gap-1">
            <MaterialIcons name="person" size={20} color="#444" />
            <Text className="text-[13px] text-black font-PoppinsSemiBold">
              Owner:
            </Text>
            {ownerAvatar ? (
              <Avatar.Image
                size={30}
                source={{ uri: ownerAvatar }}
                style={{ marginHorizontal: 6 }}
              />
            ) : (
              <Avatar.Text
                size={24}
                label={ownerName?.charAt(0).toUpperCase() ?? "U"}
                style={{
                  backgroundColor: "#6B4EFF",
                  marginHorizontal: 2,
                  marginLeft: 40,
                }}
                color="#fff"
              />
            )}

            <Text className="text-[13px] text-black">{ownerName}</Text>
          </View>

          {/* Members */}
          <View className="flex-row items-center w-full mb-5 gap-1">
            <MaterialIcons name="group" size={20} color="#444" />
            <Text className=" text-[13px] text-black font-PoppinsSemiBold">
              Members:
            </Text>
            <Text className="ml-[30px] text-[13px] text-black">
              {membersCount}
            </Text>
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
