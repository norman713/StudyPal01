import { DeletedFileItem } from "@/api/folderApi";
import React, { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import DeletedDocumentItem from "./components/DeletedDocumentItem";

/* =======================
   MOCK DATA
======================= */

const MOCK_DELETED_DOCUMENTS: (DeletedFileItem & { folderName?: string })[] = [
  {
    id: "file-1",
    name: "File_A.txt",
    extension: "txt",
    url: "",
    folderName: "Folder A",
    deletedAt: "2025-10-27T12:00:00Z",
  },
  {
    id: "file-2",
    name: "Report_2024.pdf",
    extension: "pdf",
    url: "",
    folderName: "Finance",
    deletedAt: "2025-10-26T09:30:00Z",
  },
  {
    id: "file-3",
    name: "Budget.xlsx",
    extension: "xlsx",
    url: "",
    folderName: "Planning",
    deletedAt: "2025-10-25T16:45:00Z",
  },
];

/* =======================
   COMPONENT
======================= */

export default function TrashDocuments() {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleRecover = (id: string) => {
    setActiveMenuId(null);
    console.log("Recover document:", id);
  };

  const handleDeletePermanently = (id: string) => {
    setActiveMenuId(null);
    console.log("Delete permanently:", id);
  };

  return (
    <View className="flex-1">
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>
        Deleted documents
      </Text>

      {/* 🔥 TAP OUTSIDE LAYER */}
      {activeMenuId && (
        <Pressable
          className="absolute inset-0 z-40"
          onPress={() => setActiveMenuId(null)}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // 🔥 QUAN TRỌNG
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {MOCK_DELETED_DOCUMENTS.map((doc) => (
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
      </ScrollView>
    </View>
  );
}
