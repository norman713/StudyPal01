import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CreateModalProps {
  visible: boolean;
  onSave: (teamName: string, description: string) => void;
  onCancel: () => void;
  initialName?: string;
  initialDescription?: string;
}

export default function CreateModal({
  visible,
  onSave,
  onCancel,
  initialName = "",
  initialDescription = "",
}: CreateModalProps) {
  const [teamName, setTeamName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  // Reset input mỗi lần modal mở lại
  useEffect(() => {
    if (visible) {
      setTeamName(initialName);
      setDescription(initialDescription);
    }
  }, [visible]);

  const handleSave = () => {
    if (!teamName.trim() || !description.trim()) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }
    onSave(teamName.trim(), description.trim());
  };

  const disabled = !teamName.trim() || !description.trim();

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
            Create new team
          </Text>

          {/* Team name input */}
          <TextInput
            placeholder="Enter team name"
            value={teamName}
            onChangeText={setTeamName}
            className="w-full border border-[#DADADA] rounded-lg px-3 py-2 text-[15px] text-black mb-3"
            placeholderTextColor="#9CA3AF"
          />

          {/* Team description input */}
          <TextInput
            placeholder="Enter team description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="w-full border border-[#DADADA] rounded-lg px-3 py-2 text-[15px] text-black h-[120px]"
            placeholderTextColor="#9CA3AF"
          />

          {/* Save button */}
          <TouchableOpacity
            disabled={disabled}
            onPress={handleSave}
            className={`rounded-full w-full py-3 mt-6 items-center ${
              disabled ? "bg-gray-400" : "bg-[#90717E]"
            }`}
          >
            <Text className="text-white text-[15px] font-PoppinsRegular">
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
