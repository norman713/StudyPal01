import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

interface QuestionModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const errorIcon = require("../../assets/images/question.png");

export default function QuestionModal({
  visible,
  title = "Success!",
  message = "Your action was completed successfully.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: QuestionModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/60 justify-center w-full items-center">
        <View className="bg-white rounded-2xl px-6 pt-12 pb-6 w-4/5 items-center">
          {/* Icon */}
          <View className="absolute -top-8 p-1">
            <Image
              source={errorIcon}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-[21px] font-PoppinsRegular text-black mt-2 mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-[14px] font-PoppinsRegular text-[#49454F] text-center mb-5">
            {message}
          </Text>

          <View className="w-full mt-4 flex-row justify-end gap-5">
            <TouchableOpacity onPress={onConfirm}>
              <Text className="text-[#90717E] text-[15px]">{confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel}>
              <Text className="text-[#B8C6B6] text-[15px]">{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
