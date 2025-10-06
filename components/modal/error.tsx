import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// Const
const errorIcon = require("../../assets/images/error.png");

export default function ErrorModal({
  visible,
  title = "Error!",
  message = "Something went wrong.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ErrorModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* Background overlay */}
      <View className="flex-1 bg-black/60 justify-center w-full items-center">
        {/* White box */}
        <View className="bg-white rounded-2xl px-6 pt-12 pb-6 w-4/5 items-center">
          {/* Error image */}
          <View className="absolute -top-8 p-1">
            <Image
              source={errorIcon}
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

          {/* Buttons */}
          <View className="w-full mt-4 flex-row justify-end gap-5">
            <TouchableOpacity onPress={onConfirm}>
              <Text className="text-[#FF5F57] font-PoppinsRegular text-[15px]">
                {confirmText}
              </Text>
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity onPress={onCancel}>
                <Text className="text-[#B8C6B6] font-PoppinsRegular text-[15px]">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
