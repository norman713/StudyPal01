import { DeletedFileItem } from "@/api/folderApi";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  document: DeletedFileItem;
  folderName?: string;
  menuVisible: boolean;
  onToggleMenu: () => void;
  onRecover: () => void;
  onDeletePermanently: () => void;
}

export default function DeletedDocumentItem({
  document,
  folderName,
  menuVisible,
  onToggleMenu,
  onRecover,
  onDeletePermanently,
}: Props) {
  return (
    <View className="relative mx-4 mb-3 bg-white rounded-2xl px-4 py-3">
      {/* MAIN ROW */}
      <View className="flex-row items-center justify-between bg-[#F2EFF0] p-3 rounded-xl">
        <View className="flex-row items-center gap-3 flex-1">
          {/* ICON */}
          <View className="w-10 h-11 rounded-xl bg-[#90717E] items-center justify-center">
            <Ionicons name="document-outline" size={28} color="#FFF" />
          </View>

          {/* INFO */}
          <View className="flex-1 pr-2">
            {!!folderName && (
              <Text className="text-[12px] text-gray-600 mb-[2px]">
                {folderName}
              </Text>
            )}

            <Text
              className="text-[15px] font-bold text-[#0F0C0D]"
              numberOfLines={1}
            >
              {document.name}
            </Text>

            <Text className="text-[12px] text-[#FF5F57] mt-1">
              Deleted at{" "}
              {dayjs(document.deletedAt).format("HH:mm DD MMM, YYYY")}
            </Text>
          </View>
        </View>

        {/* THREE DOT */}
        <Pressable hitSlop={10} onPress={onToggleMenu}>
          <Ionicons name="ellipsis-vertical" size={18} color="#555" />
        </Pressable>
      </View>

      {/* MENU */}
      {menuVisible && (
        <View className="absolute right-3 top-14 z-50 w-44 rounded-xl bg-[#F1EBEE] shadow-md py-1">
          <MenuItem label="Recover" onPress={onRecover} />
          <MenuItem
            label="Delete permanently"
            danger
            onPress={onDeletePermanently}
          />
        </View>
      )}
    </View>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
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
