import folderApi, { GetFolderDetailResponse } from "@/api/folderApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

/* =======================
   TYPES
======================= */

type Folder = {
  id: string;
  name: string;
  files: number;
};

/* =======================
   FOLDER ITEM
======================= */

type FolderItemProps = {
  folder: Folder;
  isMenuOpen: boolean;
  onPress?: (folder: Folder) => void;
  onMorePress?: () => void;
  onRecover?: () => void;
  onDetail?: () => void;
  onDelete?: () => void;
};

function FolderItem({
  folder,
  isMenuOpen,
  onPress,
  onMorePress,
  onRecover,
  onDetail,
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
            <Text className="text-[13px] text-black">Edit name</Text>
          </Pressable>
          <Pressable onPress={onDetail} className="px-4 py-3">
            <Text className="text-[13px] text-black">Details</Text>
          </Pressable>
          <Pressable onPress={onDelete} className="px-4 py-3">
            <Text className="text-[13px] text-black">Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-[13px] font-PoppinsBold text-[#1C1B1F]">
        {label}:
      </Text>
      <Text className="text-[13px] text-[#1C1B1F]">{value}</Text>
    </View>
  );
}

/* =======================
   SCREEN
======================= */

export default function DocumentScreen() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [usageUsed, setUsageUsed] = useState(0);
  const [usageLimit, setUsageLimit] = useState(0);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailFolder, setDetailFolder] =
    useState<GetFolderDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  useFocusEffect(
    useCallback(() => {
      if (!teamId) return;

      fetchFolders();
      fetchTeamFolderUsage();

      const onBackPress = () => true;
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => sub.remove();
    }, [teamId])
  );

  const fetchFolders = async () => {
    try {
      setIsLoading(true);

      const data = await folderApi.getFolders({ teamId });

      setFolders(
        data.folders.map((f) => ({
          id: f.id,
          name: f.name,
          files: f.fileCount,
        }))
      );
    } catch (e) {
      console.error("Fetch folders failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamFolderUsage = async () => {
    if (!teamId) return;

    try {
      setIsUsageLoading(true);

      const data = await folderApi.getTeamFolderUsage(teamId);

      setUsageUsed(data.usageUsed);
      setUsageLimit(data.usageLimit);
    } catch (e) {
      console.error("Fetch team folder usage failed", e);
    } finally {
      setIsUsageLoading(false);
    }
  };

  /* =======================
     STORAGE 
  ======================= */
  const usedGB = usageUsed / 1024 / 1024 / 1024;
  const totalGB = usageLimit / 1024 / 1024 / 1024;

  const progressPercent =
    totalGB > 0 ? Math.min((usedGB / totalGB) * 100, 100) : 0;

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* HEADER */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />
        <Appbar.Content
          title="Documents"
          titleStyle={{ color: "#F8F6F7", fontWeight: "700", fontSize: 16 }}
        />
        <Pressable onPress={() => setIsCreateModalOpen(true)} className="pr-3">
          <Ionicons name="add" size={26} color="#F8F6F7" />
        </Pressable>
      </Appbar.Header>
      {/* CONTENT */}
      <View className="m-3 bg-white">
        <FlatList
          data={folders}
          refreshing={isLoading}
          onRefresh={fetchFolders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
          ListHeaderComponent={
            <View className="px-4 pt-4 pb-3">
              <Text className="text-[16px] font-bold mb-2">Folders</Text>
              {/* PROGRESS BAR */}
              <View className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <View
                  className="h-full bg-[#90717E] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
              {/* STORAGE INFO */}
              <Text className="text-[15px] text-[#0F0C0D] mt-2 text-center">
                {isUsageLoading
                  ? "Loading storage info..."
                  : `${usedGB.toFixed(2)}GB has been used out of a total of ${totalGB.toFixed(
                      2
                    )}GB`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FolderItem
              folder={item}
              isMenuOpen={openMenuId === item.id}
              onPress={(folder) => {
                router.push({
                  pathname: "/(team)/teamFile",
                  params: {
                    folderId: folder.id,
                    folderName: folder.name,
                    teamId,
                  },
                });
              }}
              onMorePress={() => {
                setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
              onRecover={() => {
                setOpenMenuId(null);
                setEditingFolderId(item.id);
                setEditingFolderName(item.name);
                setIsEditModalOpen(true);
              }}
              onDetail={async () => {
                setOpenMenuId(null);
                setIsDetailOpen(true);
                setIsDetailLoading(true);

                try {
                  const data = await folderApi.getFolderDetail(item.id);
                  setDetailFolder(data);
                } catch (e) {
                  setErrorMessage("Failed to load folder details");
                  setErrorVisible(true);
                } finally {
                  setIsDetailLoading(false);
                }
              }}
              onDelete={() => {
                setOpenMenuId(null);
                setSelectedFolderId(item.id);
                setIsDeleteModalOpen(true);
              }}
            />
          )}
        />
      </View>
      {/* CREATE FOLDER MODAL */}

      {isCreateModalOpen && (
        <View className="absolute inset-0 z-50">
          {/* OVERLAY */}
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => setIsCreateModalOpen(false)}
          />

          {/* MODAL */}
          <View className="absolute left-6 right-6 top-1/3 bg-white rounded-3xl p-6">
            {/* CLOSE */}
            <Pressable
              className="absolute right-4 top-4"
              onPress={() => setIsCreateModalOpen(false)}
            >
              <Ionicons name="close" size={20} color="#444" />
            </Pressable>

            {/* TITLE */}
            <Text className="text-[18px] font-bold text-center mb-4">
              Create new folder
            </Text>

            {/* INPUT */}

            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Enter folder name"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-[15px] text-black"
            />

            {/* SAVE BUTTON */}
            <Pressable
              disabled={!folderName.trim() || isCreating}
              className={`rounded-full py-4 items-center ${
                folderName.trim() && !isCreating
                  ? "bg-[#90717E]"
                  : "bg-gray-300"
              }`}
              onPress={async () => {
                if (!folderName.trim()) return;

                try {
                  setIsCreating(true);

                  await folderApi.createFolder({
                    teamId,
                    name: folderName.trim(),
                  });

                  /* fetch lại danh sách folder */
                  await fetchFolders();

                  setFolderName("");
                  setIsCreateModalOpen(false);
                } catch (e) {
                  console.error("Create folder failed", e);
                } finally {
                  setIsCreating(false);
                }
              }}
            >
              <Text className="text-white text-[16px] font-semibold">Save</Text>
            </Pressable>
          </View>
        </View>
      )}
      {/* DELETE FOLDER MODAL  */}
      <QuestionModal
        visible={isDeleteModalOpen}
        title="Delete folder?"
        message="Are you sure you want to delete this folder? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!selectedFolderId) return;

          try {
            setIsDeleting(true);
            await folderApi.deleteFolder(selectedFolderId);
            await fetchFolders(); // refresh list
            setIsDeleteModalOpen(false);
            setSelectedFolderId(null);
          } catch (e) {
            console.error("Delete folder failed", e);
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => {
          if (isDeleting) return;
          setIsDeleteModalOpen(false);
          setSelectedFolderId(null);
        }}
      />

      {/* EDIT FOLDER MODAL  */}
      {isEditModalOpen && (
        <View className="absolute inset-0 z-50">
          {/* OVERLAY */}
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => {
              if (isUpdating) return;
              setIsEditModalOpen(false);
            }}
          />

          <View className="absolute left-6 right-6 top-1/3 bg-white rounded-3xl p-6">
            {/* CLOSE */}
            <Pressable
              className="absolute right-4 top-4"
              onPress={() => {
                if (isUpdating) return;
                setIsEditModalOpen(false);
              }}
            >
              <Ionicons name="close" size={20} color="#444" />
            </Pressable>

            {/* TITLE */}
            <Text className="text-[18px] font-bold text-center mb-4">
              Folder name
            </Text>

            {/* INPUT */}
            <TextInput
              value={editingFolderName}
              onChangeText={setEditingFolderName}
              placeholder="Enter folder name"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-[15px] text-black"
            />

            {/* SAVE */}
            <Pressable
              disabled={
                !editingFolderName.trim() ||
                isUpdating ||
                editingFolderName.trim() === ""
              }
              className={`rounded-full py-4 items-center ${
                editingFolderName.trim() && !isUpdating
                  ? "bg-[#90717E]"
                  : "bg-gray-300"
              }`}
              onPress={async () => {
                if (!editingFolderId) return;
                if (!editingFolderName.trim()) return;

                try {
                  setIsUpdating(true);

                  await folderApi.updateFolder(
                    editingFolderId,
                    editingFolderName.trim()
                  );

                  await fetchFolders();

                  setIsEditModalOpen(false);
                  setEditingFolderId(null);
                } catch (e: any) {
                  const msg =
                    e?.response?.data?.message || "Something went wrong";

                  setErrorMessage(msg);
                  setErrorVisible(true);
                } finally {
                  setIsUpdating(false);
                }
              }}
            >
              <Text className="text-white text-[16px] font-semibold">Save</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* FOLDER DETAIL MODAL  */}
      {isDetailOpen && (
        <View className="absolute inset-0 z-50">
          {/* OVERLAY */}
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => setIsDetailOpen(false)}
          />

          {/* BOTTOM SHEET */}
          <View className="absolute bottom-0 left-0 right-0 bg-[#F7F2F4] rounded-t-3xl px-6 pt-4 pb-8">
            {/* DRAG INDICATOR */}
            <View className="w-20 h-1 bg-gray-400 rounded-full self-center mb-4" />

            {isDetailLoading || !detailFolder ? (
              <ActivityIndicator size="small" color="#90717E" />
            ) : (
              <View className="px-5">
                <DetailRow label="Name" value={detailFolder.name} />
                <DetailRow
                  label="Created at"
                  value={new Date(detailFolder.createdAt).toLocaleString()}
                />
                <DetailRow label="Created by" value={detailFolder.createdBy} />
                <DetailRow
                  label="Last updated at"
                  value={new Date(detailFolder.updatedAt).toLocaleString()}
                />
                <DetailRow
                  label="Last updated by"
                  value={detailFolder.updatedBy}
                />
                <DetailRow
                  label="Size"
                  value={`${(detailFolder.bytes / 1024 / 1024).toFixed(2)} MB`}
                />
                <DetailRow
                  label="File count"
                  value={detailFolder.fileCount.toString()}
                />
              </View>
            )}
          </View>
        </View>
      )}
      <ErrorModal
        visible={errorVisible}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
