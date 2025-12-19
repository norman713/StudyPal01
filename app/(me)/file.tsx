import AddFileModal from "@/components/modal/addFile";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Appbar } from "react-native-paper";

type FileItem = {
  id: string;
  name: string;
  date: string;
};

const FILES: FileItem[] = [
  { id: "1", name: "File_A.txt", date: "12:00 27 Oct, 2025" },
  { id: "2", name: "File_B.docx", date: "12:00 27 Oct, 2025" },
];

export default function FileScreen() {
  const { folderId, folderName } = useLocalSearchParams<{
    folderId?: string;
    folderName?: string;
  }>();

  const [showAddFile, setShowAddFile] = useState(false);

  return (
    <View className="flex-1 bg-[#F8F6F7]">
      {/* APP BAR */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        {/* BACK */}
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />

        {/* TITLE */}
        <Appbar.Content
          title={folderName ?? "Folder"}
          titleStyle={{
            color: "#F8F6F7",
            fontWeight: "700",
            fontSize: 16,
          }}
        />

        {/* RIGHT ICON (CUSTOM) */}
        <View className="pr-2">
          <Pressable onPress={() => setShowAddFile(true)} hitSlop={10}>
            <Ionicons name="add" size={26} color="#F8F6F7" />
          </Pressable>
        </View>
      </Appbar.Header>

      {/* FILE LIST */}
      <FlatList
        data={FILES}
        keyExtractor={(i) => i.id}
        contentContainerClassName="pt-4 pb-32"
        ListHeaderComponent={
          <Text className="px-4 mb-3 text-base font-bold">Files</Text>
        }
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-xl bg-[#90717E] items-center justify-center">
                <Ionicons name="document-text-outline" size={22} color="#FFF" />
              </View>

              <View>
                <Text className="text-[15px] font-bold">{item.name}</Text>
                <Text className="text-xs text-gray-500">{item.date}</Text>
              </View>
            </View>

            <Ionicons name="ellipsis-vertical" size={18} color="#6A6A6A" />
          </View>
        )}
      />

      {/* ADD FILE MODAL */}
      <AddFileModal
        visible={showAddFile}
        onClose={() => setShowAddFile(false)}
        onSave={(fileName) => {
          console.log("Upload file:", fileName, "to folder:", folderId);
          setShowAddFile(false);
        }}
      />
    </View>
  );
}
