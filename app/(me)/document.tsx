import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { BackHandler, FlatList, Pressable, Text, View } from "react-native";

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
  { id: "d", name: "Folder C", files: 2 },
  { id: "e", name: "Folder C", files: 4 },
  { id: "f", name: "Folder F", files: 4 },
  { id: "j", name: "Folder J", files: 4 },
  { id: "k", name: "Folder J", files: 4 },
  { id: "h", name: "Folder H", files: 4 },
];

/* =======================
   FOLDER ITEM
======================= */

type FolderItemProps = {
  folder: Folder;
  isMenuOpen: boolean;
  onPress?: (folder: Folder) => void;
  onMorePress?: () => void;
  onRecover?: () => void;
  onDelete?: () => void;
};

function FolderItem({
  folder,
  isMenuOpen,
  onPress,
  onMorePress,
  onRecover,
  onDelete,
}: FolderItemProps) {
  return (
    <View className="mx-4 mb-3">
      <Pressable
        onPress={() => onPress?.(folder)}
        className="bg-[#F2EFF0] rounded-2xl px-4 py-3 flex-row items-center justify-between"
      >
        {/* LEFT */}
        <View className="flex-row items-center gap-3 p-2">
          <View className="w-12 h-12 rounded-full bg-[#E3DBDF] items-center justify-center">
            <Ionicons name="folder-outline" size={24} color="#90717E" />
          </View>

          <View>
            <Text className="text-[16px] font-bold text-[#2E2E2E]">
              {folder.name}
            </Text>
            <Text className="text-[15px] text-gray-500 mt-0.5">
              {folder.files} files
            </Text>
          </View>
        </View>

        {/* RIGHT */}
        <Pressable hitSlop={10} onPress={onMorePress}>
          <Ionicons name="ellipsis-vertical" size={18} color="#6A4E5A" />
        </Pressable>
      </Pressable>

      {/* CONTEXT MENU */}
      {isMenuOpen && (
        <View className="absolute right-0 top-14 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <Pressable onPress={onRecover} className="px-4 py-3">
            <Text className="text-[13px] text-black">Recover</Text>
          </Pressable>

          <View className=" bg-gray-100" />
          <Pressable onPress={onDelete} className="px-4 py-3">
            <Text className="text-[13px] text-black">Delete permanently</Text>
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

  /* =======================
     STORAGE (MOCK)
  ======================= */

  const usedGB = 2;
  const totalGB = 10;
  const progressPercent = (usedGB / totalGB) * 100;

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* HEADER */}
      <Header scope="me" />

      {/* CONTENT */}
      <View className="m-3 bg-white">
        <FlatList
          data={FOLDERS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
          ListHeaderComponent={
            <View className="px-4 pt-4 pb-3">
              <Text className="text-[16px] font-bold mb-2">Folders</Text>
              {/* PROGRESS BAR */}
              <View className="h-2 rounded-full bg-gray-200 overflow-hidden ">
                <View
                  className="h-full bg-[#90717E] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
              {/* STORAGE INFO */}
              <Text className="text-[15px] text-[#0F0C0D] mt-2 text-center">
                {usedGB}GB has been used out of a total of {totalGB}GB
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FolderItem
              folder={item}
              isMenuOpen={openMenuId === item.id}
              onPress={(folder) => {
                router.push({
                  pathname: "/(me)/file",
                  params: {
                    folderId: folder.id,
                    folderName: folder.name,
                  },
                });
              }}
              onMorePress={() => {
                setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
              onRecover={() => {
                setOpenMenuId(null);
                console.log("Recover folder", item.id);
              }}
              onDelete={() => {
                setOpenMenuId(null);
                console.log("Delete folder permanently", item.id);
              }}
            />
          )}
        />
      </View>

      {/* BOTTOM BAR */}
      <BottomBar
        activeTab="me"
        onTabPress={(tab) => {
          switch (tab) {
            case "team":
              router.push("/(team)/search");
              break;
            case "notification":
              router.push("/(noti)");
              break;
            case "me":
              router.push("/");
              break;
            case "trash":
              router.push("/(trash)");
              break;
          }
        }}
        onCenterPress={() => {
          console.log("Add folder / upload file");
        }}
      />
    </View>
  );
}
