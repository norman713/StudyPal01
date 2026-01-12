import folderApi, { FileItemApi, FolderListItem } from "@/api/folderApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

export default function DocumentScreen() {
  const { fileId } = useLocalSearchParams<{ fileId: string }>();

  // State
  const [currentFolder, setCurrentFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [folders, setFolders] = useState<FolderListItem[]>([]);
  const [files, setFiles] = useState<FileItemApi[]>([]);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  // Statistics
  const [usageUsed, setUsageUsed] = useState(0);
  const [usageLimit, setUsageLimit] = useState(0);

  const usedGB = usageUsed / 1024 / 1024 / 1024;
  const totalGB = usageLimit / 1024 / 1024 / 1024;
  const progressPercent =
    totalGB > 0 ? Math.min((usedGB / totalGB) * 100, 100) : 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentFolder) {
        // Fetch files in folder
        const res = await folderApi.getFiles(currentFolder.id);
        setFiles(res.files || []);
      } else {
        // Fetch folder list
        const res = await folderApi.getFolders();
        setFolders(res.folders || []);
      }
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      setUsageLoading(true);
      const res = await folderApi.getUserFolderUsage();
      setUsageUsed(res.usageUsed || 0);
      setUsageLimit(res.usageLimit || 0);
    } catch (e) {
      console.error("Fetch usage failed", e);
    } finally {
      setUsageLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      if (!currentFolder) {
        fetchUsage();
      }

      const onBackPress = () => {
        if (currentFolder) {
          setCurrentFolder(null); // Go back to folder list
          return true;
        }
        router.back();
        return true;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [currentFolder])
  );

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setCreating(true);
      await folderApi.createFolder({ name: newFolderName });
      setNewFolderName("");
      setShowCreateModal(false);
      fetchData();
    } catch (e) {
      Alert.alert("Error", "Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const handleMoveFile = async () => {
    if (!fileId || !currentFolder) return;

    try {
      setProcessing(true);
      await folderApi.moveFile(fileId, currentFolder.id);
      Alert.alert("Success", "File moved successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error("Move file failed", e);
      Alert.alert("Error", "Failed to move file");
    } finally {
      setProcessing(false);
    }
  };

  // --- RENDERS ---

  const renderFolderList = () => (
    <View>
      {/* Header Info */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-[16px] font-bold mb-2">Folders</Text>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-[#90717E]"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
        <Text className="text-sm text-center mt-2">
          {usageLoading
            ? "Loading..."
            : `${usedGB.toFixed(2)}GB has been used out of a total of ${totalGB.toFixed(2)}GB`}
        </Text>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchData}
        contentContainerClassName="pb-32"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCurrentFolder({ id: item.id, name: item.name })}
            className="mx-4 mb-3 bg-[#F2EFF0] rounded-2xl px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-[#E3DBDF] items-center justify-center">
                <Ionicons name="folder-outline" size={24} color="#90717E" />
              </View>
              <View>
                <Text className="text-[16px] font-bold">{item.name}</Text>
                <Text className="text-[14px] text-gray-500">
                  {item.fileCount} files
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6A4E5A" />
          </Pressable>
        )}
      />
    </View>
  );

  const renderFileList = () => (
    <View className="flex-1">
      {/* Search Bar mimic */}
      <View className="px-4 py-2">
        <View className="flex-row items-center bg-[#F2EFF0] rounded-full px-4 py-2">
          <Text className="text-gray-400 flex-1">Search by file name</Text>
          <Ionicons name="search" size={20} color="#9CA3AF" />
        </View>
      </View>

      <Text className="px-4 py-2 font-bold text-[16px]">Files</Text>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchData}
        contentContainerClassName="pb-32"
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">No files</Text>
        }
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 bg-[#F2EFF0] rounded-2xl px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#90717E] items-center justify-center">
                <Ionicons name="document-outline" size={24} color="#FFF" />
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-[15px] font-bold">
                  {item.name}
                </Text>
                <Text className="text-[12px] text-gray-500">
                  Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="#6A4E5A" />
          </View>
        )}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.Action
          icon="close"
          color="#fff"
          onPress={() => {
            if (currentFolder)
              setCurrentFolder(null); // behaves like back
            else router.back();
          }}
        />
        <Appbar.Content
          title="Select destination"
          titleStyle={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
        />
        {!currentFolder && (
          <Appbar.Action
            icon="plus"
            color="#fff"
            onPress={() => setShowCreateModal(true)}
          />
        )}
      </Appbar.Header>

      <View className="flex-1">
        {currentFolder ? renderFileList() : renderFolderList()}
      </View>

      {/* BOTTOM ACTIONS */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex-row gap-4">
        <Pressable
          disabled={!currentFolder || processing}
          onPress={handleMoveFile}
          className={`flex-1 py-3 rounded-full items-center ${currentFolder ? "bg-[#90717E]" : "bg-gray-300"}`}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Move</Text>
          )}
        </Pressable>

        <Pressable
          disabled={processing}
          onPress={() => router.back()}
          className="flex-1 py-3 rounded-full items-center bg-[#C2D6CA]" // Matches green/grey tone in image
        >
          <Text className="text-black font-bold text-base">Cancel</Text>
        </Pressable>
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
              disabled={creating || !newFolderName.trim()}
              className={`py-3 rounded-full items-center ${creating || !newFolderName.trim() ? "bg-gray-300" : "bg-[#90717E]"}`}
              onPress={handleCreateFolder}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
