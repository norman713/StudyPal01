import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

type FileItem = {
  id: string;
  name: string;
  uri: string;
  date: string;
  size?: number;
};
const mockFiles: FileItem[] = [
  {
    id: "file-1",
    name: "File_A.txt",
    uri: "file:///mock/path/File_A.txt",
    date: "12:00 27 Oct, 2025",
    size: 1240, // KB
  },
  {
    id: "file-2",
    name: "File_B.docx",
    uri: "file:///mock/path/File_B.docx",
    date: "12:00 27 Oct, 2025",
    size: 2560,
  },
  {
    id: "file-3",
    name: "File_C.xlsx",
    uri: "file:///mock/path/File_C.xlsx",
    date: "12:00 27 Oct, 2025",
    size: 4096,
  },
];

export default function FileScreen() {
  const { folderName } = useLocalSearchParams<{ folderName?: string }>();

  // const [files, setFiles] = useState<FileItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>(mockFiles);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== PICK PDF (DEMO) =====
  const pickPdfMock = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        uri: file.uri,
        size: file.size,
        date: new Date().toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      setFiles((prev) => [newFile, ...prev]);
      setShowUploadModal(false);
    } catch {
      setError("Failed to pick file");
    } finally {
      setLoading(false);
    }
  };

  // ===== OPEN FILE =====
  const openFile = async (uri: string) => {
    try {
      if (Platform.OS === "android") {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        await Linking.openURL(contentUri);
      } else {
        await Linking.openURL(uri);
      }
    } catch {
      setError("Cannot open this file");
    }
  };

  // ===== MENU ACTIONS (DEMO) =====
  const onDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setActiveMenuId(null);
  };

  return (
    <Pressable
      className="flex-1 bg-[#F8F6F7]"
      onPress={() => setActiveMenuId(null)}
    >
      {/* APP BAR */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />
        <Appbar.Content
          title={folderName ?? "Folder"}
          titleStyle={{ color: "#F8F6F7", fontWeight: "700", fontSize: 16 }}
        />
        <Pressable onPress={() => setShowUploadModal(true)} className="pr-3">
          <Ionicons name="add" size={26} color="#F8F6F7" />
        </Pressable>
      </Appbar.Header>

      {/* FILE LIST */}
      <FlatList
        data={files}
        keyExtractor={(i) => i.id}
        contentContainerClassName="pt-4 pb-32"
        ListHeaderComponent={
          <Text className="px-4 mb-3 text-base font-bold">Files</Text>
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">
            No files uploaded
          </Text>
        }
        renderItem={({ item }) => {
          const menuVisible = activeMenuId === item.id;

          return (
            <View className="relative mx-4 mb-3 bg-white rounded-2xl px-4 py-3">
              {/* MAIN ROW */}
              <Pressable
                onPress={() => openFile(item.uri)}
                className="flex-row items-center justify-between bg-[#F2EFF0] p-3"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-11 rounded-xl bg-[#90717E] items-center justify-center">
                    <Ionicons name="document-outline" size={30} color="#FFF" />
                  </View>

                  <View>
                    <Text className="text-[15px] font-bold">{item.name}</Text>
                    <Text className="text-[13px] text-black">
                      Last updated at: {item.date}
                    </Text>
                  </View>
                </View>

                {/* THREE DOT */}
                <Pressable
                  hitSlop={10}
                  onPress={() => setActiveMenuId(menuVisible ? null : item.id)}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="#555" />
                </Pressable>
              </Pressable>

              {/* MENU */}
              {menuVisible && (
                <View className="absolute right-3 top-14 z-50 w-44 rounded-xl bg-[#F1EBEE] shadow-md py-1">
                  <MenuItem label="Edit name" />
                  <MenuItem label="Details" />
                  <MenuItem label="Download" />
                  <MenuItem
                    label="Move"
                    onPress={() => {
                      setActiveMenuId(null);
                      router.push("/(me)/documentMove");
                    }}
                  />

                  <MenuItem
                    label="Delete"
                    danger
                    onPress={() => onDelete(item.id)}
                  />
                </View>
              )}
            </View>
          );
        }}
      />

      {/* UPLOAD MODAL */}
      <Modal visible={showUploadModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            {/* HEADER */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Add new file</Text>
              <Pressable onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={22} color="#7A7A7A" />
              </Pressable>
            </View>

            {/* DROP ZONE */}
            <Pressable
              onPress={pickPdfMock}
              className="border border-dashed border-black-300 rounded-2xl py-10 items-center justify-center mb-4"
            >
              <Ionicons name="cloud-upload-outline" size={36} color="#B0B0B0" />
              <Text className="text-black mt-2 text-sm">
                Tap to select file to upload
              </Text>
            </Pressable>

            {/* FILE NAME INPUT */}
            <View className="border border-black-300 rounded-xl px-4 py-3 mb-5">
              <Text className="text-gray-700 text-sm">
                {files[0]?.name ?? "File_name.docx"}
              </Text>
            </View>

            {/* SAVE BUTTON */}
            <Pressable
              onPress={pickPdfMock}
              disabled={loading}
              className="bg-[#90717E] py-3 rounded-full items-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} className="px-4 py-2">
      <Text className={`text-sm ${danger ? "text-red-500" : "text-gray-800"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
