import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
}

// Const
const successIcon = require("../../assets/images/success.png");

export default function SuccessModal({
  visible,
  title = "Success!",
  message = "Your action was completed successfully.",
  confirmText = "Confirm",
  onConfirm,
}: SuccessModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* Background overlay */}
      <View className="flex-1 bg-black/60 justify-center w-full items-center">
        {/* White box */}
        <View className="bg-white rounded-2xl px-6 pt-12 pb-6 w-4/5 items-center">
          {/* Success image */}
          <View className="absolute -top-8 p-1 ">
            <Image
              source={successIcon}
              className="w-16 h-16"
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

          {/* Confirm button */}
          <TouchableOpacity className="w-full items-end" onPress={onConfirm}>
            <Text className="text-[#27C840] font-PoppinsRegular">
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
