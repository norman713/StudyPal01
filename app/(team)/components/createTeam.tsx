import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TeamNameModalProps {
  visible: boolean;
  onSave: (teamName: string) => void;
  onCancel: () => void;
  initialName?: string;
}

export default function TeamNameModal({
  visible,
  onSave,
  onCancel,
  initialName = "",
}: TeamNameModalProps) {
  const [teamName, setTeamName] = useState(initialName);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 bg-black/60 justify-center items-center px-6" />
      </TouchableWithoutFeedback>

      <View className="absolute inset-0 justify-center items-center px-6">
        <View className="bg-white w-full max-w-sm rounded-2xl p-6 relative items-center">
          {/* Close button */}
          <TouchableOpacity
            onPress={onCancel}
            className="absolute top-4 right-4"
          >
            <MaterialIcons name="close" size={24} color="#90717E" />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-[18px] font-PoppinsSemiBold text-black mb-4">
            Team name
          </Text>

          {/* Input field */}
          <TextInput
            placeholder="Enter team name"
            value={teamName}
            onChangeText={setTeamName}
            className="w-full border border-[#DADADA] rounded-lg px-3 py-2 text-[15px] text-black"
            placeholderTextColor="#9CA3AF"
          />

          {/* Save button */}
          <TouchableOpacity
            onPress={() => onSave(teamName)}
            className="bg-[#90717E] rounded-full w-full py-3 mt-6 items-center"
          >
            <Text className="text-white text-[15px] font-PoppinsRegular">
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
