import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import FileCard from "./components/FileCard";
import FolderCard from "./components/FolderCard";

export default function TrashDocuments({
  folders,
  files,
}: {
  folders: any[];
  files: any[];
}) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  if (selectedFolder) {
    return (
      <View>
        <Text variant="titleMedium" style={{ marginBottom: 10 }}>
          Files
        </Text>
        <ScrollView contentContainerStyle={{ flexDirection: "row", gap: 20 }}>
          {files.map((file) => (
            <FileCard key={file.name} file={file} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View>
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>
        Folders
      </Text>

      <ScrollView contentContainerStyle={{ gap: 20 }}>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {folders.map((folder) => (
            <FolderCard
              key={folder.name}
              folder={folder}
              onPress={() => setSelectedFolder(folder.name)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
