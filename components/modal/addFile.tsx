import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

type AddFileModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (fileName: string) => void;
};

export default function AddFileModal({
  visible,
  onClose,
  onSave,
}: AddFileModalProps) {
  const [fileName, setFileName] = useState("");

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* OVERLAY */}
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        {/* MODAL CARD */}
        <View className="w-full max-w-[340px] bg-white rounded-[28px] px-6 py-6 relative">
          {/* CLOSE BUTTON */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="absolute right-4 top-4 z-10"
          >
            <Ionicons name="close" size={22} color="#90717E" />
          </Pressable>

          {/* TITLE */}
          <Text className="text-[18px] font-extrabold text-center mb-5 text-[#2E2E2E]">
            Add new file
          </Text>

          {/* ================= DROP ZONE (DOUBLE LAYER) ================= */}
          <Pressable
            onPress={() => {
              console.log("Pick file");
            }}
            className="mb-4"
          >
            {/* OUTER DASHED BORDER */}
            <View className="border border-dashed border-gray-900 rounded-2xl p-[3px]">
              {/* INNER CONTENT */}
              <View className="rounded-xl py-10 items-center justify-center bg-white">
                <Ionicons
                  name="cloud-upload-outline"
                  size={36}
                  color="#C0C0C0"
                />
                <Text className="text-[15px] text-gray-400 mt-3 text-center">
                  Drag and drop a file here or click
                </Text>
              </View>
            </View>
          </Pressable>

          {/* FILE NAME INPUT */}
          <TextInput
            value={fileName}
            onChangeText={setFileName}
            placeholder="File_name.docx"
            placeholderTextColor="#555555"
            className="border border-black text-black rounded-xl px-4 py-2.5 text-[15px] mb-5"
          />

          {/* SAVE BUTTON */}
          <Pressable
            onPress={() => {
              onSave(fileName);
              setFileName("");
            }}
            className="bg-[#90717E] rounded-full py-3 items-center"
          >
            <Text className="text-white font-semibold text-[15px]">Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
