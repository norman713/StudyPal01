import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  BackHandler,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

/* =======================
   TYPES
======================= */

type Folder = {
  id: string;
  name: string;
  files: number;
};

/* =======================
   MOCK DATA
======================= */

const FOLDERS: Folder[] = [
  { id: "a", name: "Folder A", files: 4 },
  { id: "b", name: "Folder B", files: 4 },
  { id: "c", name: "Folder C", files: 4 },
];

/* =======================
   FOLDER ITEM
======================= */

function FolderItem({
  folder,
  isMenuOpen,
  onPress,
  onMorePress,
}: {
  folder: Folder;
  isMenuOpen: boolean;
  onPress: () => void;
  onMorePress: () => void;
}) {
  return (
    <View className="mx-4 mb-3">
      <Pressable
        onPress={onPress}
        className="bg-[#F2EFF0] rounded-2xl px-4 py-3 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-[#E3DBDF] items-center justify-center">
            <Ionicons name="folder-outline" size={24} color="#90717E" />
          </View>

          <View>
            <Text className="text-[16px] font-bold">{folder.name}</Text>
            <Text className="text-[14px] text-gray-500">
              {folder.files} files
            </Text>
          </View>
        </View>

        <Pressable hitSlop={10} onPress={onMorePress}>
          <Ionicons name="ellipsis-vertical" size={18} color="#6A4E5A" />
        </Pressable>
      </Pressable>

      {isMenuOpen && (
        <View className="absolute right-2 top-14 w-40 bg-white rounded-xl shadow-lg z-50">
          <Pressable className="px-4 py-3">
            <Text className="text-sm">Edit name</Text>
          </Pressable>
          <Pressable className="px-4 py-3">
            <Text className="text-sm">Details</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* =======================
   SCREEN
======================= */

export default function DocumentScreen() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [])
  );

  const usedGB = 2;
  const totalGB = 10;
  const progressPercent = (usedGB / totalGB) * 100;

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* CUSTOM HEADER */}
      <View className="bg-[#90717E] px-4 pt-12 pb-4 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>

        <Text className="text-white font-bold text-[16px]">
          Select destination
        </Text>

        <Pressable onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
      </View>

      {/* CONTENT */}
      <View className="flex-1 bg-white">
        <FlatList
          data={FOLDERS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
          ListHeaderComponent={
            <View className="px-4 pt-4 pb-3">
              <Text className="text-[16px] font-bold mb-2">Folders</Text>

              {/* PROGRESS */}
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-[#90717E]"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>

              <Text className="text-sm text-center mt-2">
                {usedGB}GB has been used out of a total of {totalGB}GB
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FolderItem
              folder={item}
              isMenuOpen={openMenuId === item.id}
              onPress={() =>
                router.push({
                  pathname: "/(me)/file",
                  params: {
                    folderId: item.id,
                    folderName: item.name,
                  },
                })
              }
              onMorePress={() =>
                setOpenMenuId(openMenuId === item.id ? null : item.id)
              }
            />
          )}
        />
      </View>

      {/* CREATE FOLDER MODAL */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Create new folder</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={22} color="#7A7A7A" />
              </Pressable>
            </View>

            <TextInput
              placeholder="Enter folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
              className="border border-gray-300 rounded-xl px-4 py-3 mb-5"
            />

            <Pressable
              className="bg-[#90717E] py-3 rounded-full items-center"
              onPress={() => {
                console.log("Create folder:", newFolderName);
                setShowCreateModal(false);
                setNewFolderName("");
              }}
            >
              <Text className="text-white font-semibold">Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
