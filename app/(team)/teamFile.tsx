import folderApi, { FileDetail, FileItemApi } from "@/api/folderApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import { WebView } from "react-native-webview";

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
export default function FileScreen() {
  const { folderName, folderId, teamId } = useLocalSearchParams<{
    folderName?: string;
    folderId?: string;
    teamId?: string;
  }>();

  const [files, setFiles] = useState<FileItemApi[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [editFile, setEditFile] = useState<FileItemApi | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailFile, setDetailFile] = useState<FileDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch files on mount and focus
  useFocusEffect(
    React.useCallback(() => {
      if (folderId) {
        if (searchQuery.trim()) {
          handleSearch();
        } else {
          fetchFiles();
        }
      }
    }, [folderId, searchQuery])
  );

  const fetchFiles = async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      const res = await folderApi.getFiles(folderId);
      setFiles(res.files || []);
    } catch (e: any) {
      console.error("Fetch files failed", e);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!folderId) return;
    if (!searchQuery.trim()) {
      // If empty, revert to normal fetch
      fetchFiles();
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const res = await folderApi.searchFiles(folderId, searchQuery);
      setFiles(res.files || []);
    } catch (e) {
      console.error("Search failed", e);
      setErrorMessage("Failed to search files");
      setErrorVisible(true);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const onEditName = (file: FileItemApi) => {
    setActiveMenuId(null);
    setEditFile(file);
    setNewFileName(file.name);
  };
  const onOpenDetail = async (file: FileItemApi) => {
    setActiveMenuId(null);
    setIsDetailOpen(true);
    setDetailFile(null); // Clear previous detail
    setDetailLoading(true);

    try {
      const detail = await folderApi.getFileDetail(file.id);
      setDetailFile(detail);
    } catch (e) {
      console.error("Get detail failed", e);
      setErrorMessage("Failed to get file details");
      setErrorVisible(true);
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ===== PICK DOCUMENT =====
  const handlePickFile = async () => {
    setError(null);
    setUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const fileAsset = result.assets[0];

      if (!folderId) {
        setError("Folder ID missing");
        setUploading(false);
        return;
      }

      await folderApi.uploadFile(folderId, fileAsset);

      // Refresh list
      await fetchFiles();
      setShowUploadModal(false);
    } catch (e) {
      console.error("Upload failed", e);
      setErrorMessage("Failed to upload file");
      setErrorVisible(true);
    } finally {
      setUploading(false);
    }
  };

  // ===== OPEN FILE =====
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper to check if URL is local/private
  const isPrivateUrl = (url: string) => {
    return (
      url.includes("localhost") ||
      url.includes("127.0.0.1") ||
      url.includes("10.0.2.2") ||
      url.startsWith("http://192.168.") ||
      url.startsWith("http://10.") ||
      url.startsWith("http://172.")
    );
  };

  const openFile = async (item: FileItemApi) => {
    try {
      const url = item.url;
      // Use file name for extension check, URL might be signed/obscured
      const lowerName = item.name.toLowerCase();

      const isPdf = lowerName.endsWith(".pdf");
      const isOffice =
        lowerName.endsWith(".doc") ||
        lowerName.endsWith(".docx") ||
        lowerName.endsWith(".xls") ||
        lowerName.endsWith(".xlsx") ||
        lowerName.endsWith(".ppt") ||
        lowerName.endsWith(".pptx");

      const isImage =
        lowerName.endsWith(".jpg") ||
        lowerName.endsWith(".jpeg") ||
        lowerName.endsWith(".png") ||
        lowerName.endsWith(".gif") ||
        lowerName.endsWith(".webp");

      if (isImage) {
        setPreviewImage(url);
        return;
      }

      if (isPdf || isOffice) {
        if (isPrivateUrl(url)) {
          Alert.alert(
            "Cannot Preview File",
            "This file is hosted locally or on a private network and cannot be previewed directly. Would you like to try opening it externally?",
            [
              { text: "Open Externally", onPress: () => Linking.openURL(url) },
              { text: "Cancel", style: "cancel" },
            ]
          );
          return;
        }

        let viewerUrl = "";

        if (isOffice) {
          // Microsoft Office Viewer (Better for Docx, Xlsx, Pptx)
          viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
        } else {
          // Google Docs Viewer (Best for PDF)
          viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
        }

        setPreviewUrl(viewerUrl);
      } else {
        // Fallback
        await Linking.openURL(url);
      }
    } catch {
      setError("Cannot open this file");
    }
  };

  // ===== MENU ACTIONS (DEMO) =====
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const onDelete = (id: string) => {
    setActiveMenuId(null);
    setDeleteFileId(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteFileId) return;
    try {
      setLoading(true);
      await folderApi.deleteFile(deleteFileId);
      await fetchFiles();
    } catch (e) {
      console.error("Delete failed", e);
      setErrorMessage("Failed to delete file");
      setErrorVisible(true);
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setDeleteFileId(null);
    }
  };

  const handleRenameFile = async () => {
    if (!editFile || !newFileName.trim()) return;
    try {
      setRenaming(true);
      await folderApi.updateFile(editFile.id, newFileName);
      setEditFile(null);
      await fetchFiles();
    } catch (e: any) {
      console.error("Rename failed", e);
      const msg = e?.response?.data?.message
        ? Array.isArray(e.response.data.message)
          ? e.response.data.message.join("\n")
          : e.response.data.message
        : "Failed to rename file";

      setErrorMessage(msg);
      setErrorVisible(true);
    } finally {
      setRenaming(false);
    }
  };

  const handleDownload = async (item: FileItemApi) => {
    setActiveMenuId(null);
    try {
      setLoading(true);

      const filename = item.name;
      const fileUri = `${FileSystemLegacy.documentDirectory}${filename}`;

      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const downloadUrl = item.url.startsWith("http")
        ? item.url
        : `${baseUrl}${item.url}`;

      const { uri } = await FileSystemLegacy.downloadAsync(
        downloadUrl,
        fileUri
      );

      let safSuccess = false;

      if (Platform.OS === "android") {
        // @ts-ignore
        const SAF = FileSystem.StorageAccessFramework;
        if (SAF) {
          try {
            const permissions = await SAF.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
                encoding: FileSystemLegacy.EncodingType.Base64,
              });

              let mimeType = "application/octet-stream";
              if (filename.endsWith(".pdf")) mimeType = "application/pdf";
              else if (filename.endsWith(".jpg") || filename.endsWith(".png"))
                mimeType = "image/jpeg";

              const newUri = await SAF.createFileAsync(
                permissions.directoryUri,
                filename,
                mimeType
              );
              await SAF.writeAsStringAsync(newUri, base64, {
                encoding: FileSystemLegacy.EncodingType.Base64,
              });
              Alert.alert("Success", "File saved to selected folder");
              safSuccess = true;
            }
          } catch (safError) {
            console.log("SAF failed, falling back to share", safError);
          }
        }
      }

      if (!safSuccess) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Success", "File downloaded");
        }
      }
    } catch (e) {
      console.error("Download failed", e);
      setErrorMessage("Failed to download file");
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      className="flex-1 bg-[#F8F6F7]"
      onPress={() => setActiveMenuId(null)}
    >
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

      {/* SEARCH BAR */}
      <View className="px-4 py-2 bg-[#F8F6F7]">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 border border-gray-200">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search files..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                fetchFiles();
              }}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* FILE LIST */}
      <FlatList
        data={files}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={fetchFiles}
        contentContainerClassName="pt-4 pb-32"
        ListHeaderComponent={
          <Text className="px-4 mb-3 text-base font-bold">Files</Text>
        }
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-gray-400 mt-20">
              No files uploaded
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const menuVisible = activeMenuId === item.id;
          const dateString = new Date(item.updatedAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <View className="relative mx-4 mb-3 bg-white rounded-2xl px-4 py-3">
              {/* MAIN ROW */}
              <Pressable
                onPress={() => openFile(item)}
                className="flex-row items-center justify-between bg-[#F2EFF0] p-3"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-11 rounded-xl bg-[#90717E] items-center justify-center">
                    <Ionicons name="document-outline" size={30} color="#FFF" />
                  </View>

                  <View className="flex-1 pr-2">
                    <Text
                      className="text-[15px] font-bold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <Text className="text-[13px] text-black">
                      Last updated at: {dateString}
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
                  <MenuItem
                    label="Edit name"
                    onPress={() => onEditName(item)}
                  />

                  <MenuItem
                    label="Details"
                    onPress={() => onOpenDetail(item)}
                  />

                  <MenuItem
                    label="Download"
                    onPress={() => handleDownload(item)}
                  />
                  <MenuItem
                    label="Move"
                    onPress={() => {
                      setActiveMenuId(null);
                      router.push({
                        pathname: "/(team)/teamDocumentMove",
                        params: { fileId: item.id, teamId },
                      });
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
              onPress={handlePickFile}
              className="border border-dashed border-black-300 rounded-2xl py-10 items-center justify-center mb-4"
            >
              <Ionicons name="cloud-upload-outline" size={36} color="#B0B0B0" />
              <Text className="text-black mt-2 text-sm font-normal">
                Tap to select file to upload
              </Text>
            </Pressable>

            {/* SAVE BUTTON */}
            {/* 
            <Pressable
              onPress={handlePickFile}
              disabled={uploading}
              className="bg-[#90717E] py-3 rounded-full items-center"
            >
             ...
            </Pressable> 
            */}
            {uploading && (
              <View className="mt-2 items-center">
                <ActivityIndicator color="#90717E" />
                <Text className="text-xs text-gray-500 mt-1">Uploading...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* WEBVIEW PREVIEW MODAL */}
      <Modal
        visible={!!previewUrl}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
            <Appbar.Action
              icon="close"
              color="#fff"
              onPress={() => setPreviewUrl(null)}
            />
            <Appbar.Content title="Preview" titleStyle={{ color: "#fff" }} />
            <Appbar.Action
              icon="open-in-new"
              color="#fff"
              onPress={() => {
                if (previewUrl) {
                  let originalUrl = previewUrl
                    .replace(
                      "https://docs.google.com/gview?embedded=true&url=",
                      ""
                    )
                    .replace(
                      "https://view.officeapps.live.com/op/view.aspx?src=",
                      ""
                    );
                  Linking.openURL(decodeURIComponent(originalUrl));
                }
              }}
            />
          </Appbar.Header>
          {previewUrl && (
            <WebView
              source={{ uri: previewUrl }}
              className="flex-1"
              startInLoadingState
              renderError={() => (
                <View className="flex-1 justify-center items-center p-4">
                  <Text className="text-gray-500 text-center mb-2">
                    Failed to load preview.
                  </Text>
                  <Text className="text-gray-400 text-xs text-center">
                    It might be because the file is not public.
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      {/* IMAGE PREVIEW MODAL */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 bg-black">
          <Pressable
            className="absolute top-10 right-4 z-50 p-2"
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close-circle" size={32} color="#fff" />
          </Pressable>
          <View className="flex-1 justify-center items-center">
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={{ width: "100%", height: "80%" }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <QuestionModal
        visible={isDeleteModalVisible}
        title="Delete file?"
        message="Are you sure you want to delete this file? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />

      <Modal visible={!!editFile} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            {/* CLOSE */}
            <Pressable
              onPress={() => setEditFile(null)}
              className="absolute right-4 top-4"
            >
              <Ionicons name="close" size={22} color="#7A7A7A" />
            </Pressable>

            {/* TITLE */}
            <Text className="text-lg font-bold text-center mb-4">
              File name
            </Text>

            {/* INPUT */}
            <View className="border border-gray-300 rounded-xl px-2 mb-4">
              <TextInput
                value={newFileName}
                onChangeText={setNewFileName}
                placeholder="Enter file name"
                className="text-base"
              />
            </View>

            {/* SAVE BUTTON */}
            <Pressable
              disabled={renaming || !newFileName.trim()}
              onPress={handleRenameFile}
              className={`py-3 rounded-full items-center ${renaming || !newFileName.trim() ? "bg-gray-300" : "bg-[#90717E]"}`}
            >
              {renaming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-normal">Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

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
            <Text className="text-xl font-bold text-center mb-6">Details</Text>

            {detailLoading || !detailFile ? (
              <View className="py-10">
                <ActivityIndicator size="large" color="#90717E" />
              </View>
            ) : (
              <View className="px-5 gap-3">
                <DetailRow label="Name" value={detailFile.name} />
                <DetailRow label="Extension" value={detailFile.extension} />
                <DetailRow label="Size" value={detailFile.bytes + " bytes"} />
                <DetailRow label="Created by" value={detailFile.createdBy} />
                <DetailRow
                  label="Created at"
                  value={
                    detailFile.createdAt
                      ? new Date(detailFile.createdAt).toLocaleString("en-GB")
                      : "-"
                  }
                />
                <DetailRow label="Updated by" value={detailFile.updatedBy} />
                <DetailRow
                  label="Last updated at"
                  value={
                    detailFile.updatedAt
                      ? new Date(detailFile.updatedAt).toLocaleString("en-GB")
                      : "-"
                  }
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
