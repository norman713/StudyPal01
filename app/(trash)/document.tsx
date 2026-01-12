import folderApi, { DeletedFileItem } from "@/api/folderApi";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import DeletedDocumentItem from "./components/DeletedDocumentItem";

export default function TrashDocuments() {
  const [documents, setDocuments] = useState<DeletedFileItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchDeletedFiles = async (cursor?: string) => {
    try {
      setLoading(true);
      const res = await folderApi.getDeletedFiles({
        cursor,
        size: 10,
      });
      setDocuments((prev) => (cursor ? [...prev, ...res.files] : res.files));
      setNextCursor(res.nextCursor ?? null);
    } catch (err) {
      console.error("Failed to fetch deleted files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedFiles();
  }, []);

  const handleRecover = async (id: string) => {
    try {
      setActiveMenuId(null);
      await folderApi.recoverFile(id);
      fetchDeletedFiles();
    } catch (err) {
      console.error("Recover document failed:", err);
    }
  };

  const handleDeletePermanently = async (id: string) => {
    try {
      setActiveMenuId(null);
      await folderApi.deleteFilePermanently(id);
      fetchDeletedFiles();
    } catch (err) {
      console.error("Delete permanently failed:", err);
    }
  };

  return (
    <Pressable className="flex-1" onPress={() => setActiveMenuId(null)}>
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>
        Deleted documents
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {documents.map((doc) => (
          <DeletedDocumentItem
            key={doc.id}
            document={doc}
            folderName={doc.folderName}
            menuVisible={activeMenuId === doc.id}
            onToggleMenu={() =>
              setActiveMenuId(activeMenuId === doc.id ? null : doc.id)
            }
            onRecover={() => handleRecover(doc.id)}
            onDeletePermanently={() => handleDeletePermanently(doc.id)}
          />
        ))}

        {nextCursor && !loading && (
          <Pressable
            onPress={() => fetchDeletedFiles(nextCursor)}
            className="py-3 items-center"
          >
            <Text>Load more</Text>
          </Pressable>
        )}

        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      </ScrollView>
    </Pressable>
  );
}
