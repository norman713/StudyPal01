import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Checkbox, Text } from "react-native-paper";
import Svg, { Path, Rect } from "react-native-svg";

const ACCENT = "#90717E";

type Tab = "tasks" | "documents";
type ViewType = "tasks" | "documents" | "files";

// Mock data for deleted tasks
const deletedTasks = [
  {
    id: "task-1",
    code: "PLN-1",
    title: "Task 1",
    dateRange: "12:00 27 Oct, 2025 - 24:00 29 Oct, 2025",
    deleteDate: "12:00 26 Oct, 2025",
    priority: "high" as const,
  },
  {
    id: "task-2",
    code: "PLN-2",
    title: "Task 1",
    dateRange: "12:00 27 Oct, 2025 - 24:00 29 Oct, 2025",
    deleteDate: "12:45 27 Oct, 2025",
    priority: "high" as const,
  },
  {
    id: "task-3",
    code: "PLN-1",
    title: "Task 1",
    dateRange: "12:00 27 Oct, 2025 - 24:00 29 Oct, 2025",
    deleteDate: "12:00 26 Oct, 2025",
    priority: "medium" as const,
  },
  {
    id: "task-4",
    code: "PLN-3",
    title: "Task 1",
    dateRange: "12:00 27 Oct, 2025 - 24:00 29 Oct, 2025",
    deleteDate: "12:00 26 Oct, 2025",
    priority: "low" as const,
  },
];

// Mock data for folders
const folders = [
  { name: "General", itemCount: 12 },
  { name: "Math", itemCount: 8 },
  { name: "Science", itemCount: 15 },
];

// Mock data for files
const files = [
  { name: "DeCuong.xlsx", type: "excel" },
  { name: "TaiLieu.xlsx", type: "excel" },
];

const priorityColors = {
  high: "#FF5F57",
  medium: "#FEBC2F",
  low: "#27C840",
};

// ===== SVG Components =====
function FolderIllustration() {
  return (
    <Svg viewBox="0 0 100 100" width={100} height={100}>
      {/* Folder back part */}
      <Rect x="10" y="25" width="80" height="60" rx="4" fill="#FDB737" />
      {/* Folder tab */}
      <Path
        d="M10 25 L10 20 C10 17.7909 11.7909 16 14 16 L35 16 L40 25 Z"
        fill="#FDB737"
      />
      {/* Folder front part */}
      <Rect x="10" y="30" width="80" height="55" rx="4" fill="#FDCC70" />
      {/* Folder lines/details */}
      <Rect
        x="20"
        y="45"
        width="40"
        height="3"
        rx="1.5"
        fill="#FDB737"
        opacity={0.3}
      />
      <Rect
        x="20"
        y="55"
        width="60"
        height="3"
        rx="1.5"
        fill="#FDB737"
        opacity={0.3}
      />
      <Rect
        x="20"
        y="65"
        width="50"
        height="3"
        rx="1.5"
        fill="#FDB737"
        opacity={0.3}
      />
    </Svg>
  );
}

function DocumentIllustration() {
  return (
    <Svg viewBox="0 0 100 100" width={100} height={100}>
      {/* Document background */}
      <Rect
        x="20"
        y="10"
        width="60"
        height="80"
        rx="4"
        fill="white"
        stroke="#0F0C0D"
        strokeWidth="2"
      />
      {/* Document fold corner */}
      <Path
        d="M65 10 L65 25 L80 25 L65 10 Z"
        fill="#E8E5E6"
        stroke="#0F0C0D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Document lines */}
      <Rect
        x="30"
        y="35"
        width="40"
        height="2"
        rx="1"
        fill="#0F0C0D"
        opacity={0.3}
      />
      <Rect
        x="30"
        y="45"
        width="40"
        height="2"
        rx="1"
        fill="#0F0C0D"
        opacity={0.3}
      />
      <Rect
        x="30"
        y="55"
        width="30"
        height="2"
        rx="1"
        fill="#0F0C0D"
        opacity={0.3}
      />
      {/* Highlight bar */}
      <Rect x="30" y="70" width="40" height="8" rx="2" fill="#FDB737" />
    </Svg>
  );
}

// ===== Tab Selector =====
function TabSelector({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "tasks" && styles.activeTab]}
        onPress={() => onTabChange("tasks")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "tasks" && styles.activeTabText,
          ]}
        >
          Tasks
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "documents" && styles.activeTab]}
        onPress={() => onTabChange("documents")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "documents" && styles.activeTabText,
          ]}
        >
          Documents
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ===== Task Item =====
function TaskItem({
  task,
  isSelected,
  onToggle,
}: {
  task: (typeof deletedTasks)[0];
  isSelected: boolean;
  onToggle: () => void;
}) {
  const borderColor = priorityColors[task.priority];

  return (
    <View style={[styles.taskItemContainer, { backgroundColor: borderColor }]}>
      <View style={styles.taskItemContent}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskCode}>{task.code}</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDate}>{task.dateRange}</Text>
          <Text style={styles.taskDeleteDate}>
            Delete at:{" "}
            <Text style={{ color: "#FF5F57" }}>{task.deleteDate}</Text>
          </Text>
        </View>
        <Checkbox
          status={isSelected ? "checked" : "unchecked"}
          onPress={onToggle}
          color={ACCENT}
        />
      </View>
    </View>
  );
}

// ===== Tasks View =====
function TasksView({
  selectedTasks,
  selectAll,
  onTaskToggle,
  onSelectAllToggle,
  onRecover,
}: {
  selectedTasks: Set<string>;
  selectAll: boolean;
  onTaskToggle: (taskId: string) => void;
  onSelectAllToggle: () => void;
  onRecover: () => void;
}) {
  return (
    <View style={styles.viewContainer}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <View style={styles.headerActions}>
          {/* Recover button */}
          <TouchableOpacity
            onPress={onRecover}
            disabled={selectedTasks.size === 0}
            style={{ opacity: selectedTasks.size > 0 ? 1 : 0.4 }}
          >
            <MaterialCommunityIcons name="restore" size={22} color="#49454F" />
          </TouchableOpacity>
          {/* Select All checkbox */}
          <Checkbox
            status={selectAll ? "checked" : "unchecked"}
            onPress={onSelectAllToggle}
            color={ACCENT}
          />
        </View>
      </View>

      {/* Task list */}
      <View style={styles.taskList}>
        {deletedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTasks.has(task.id)}
            onToggle={() => onTaskToggle(task.id)}
          />
        ))}
      </View>
    </View>
  );
}

// ===== Folder Card =====
function FolderCard({
  folder,
  onPress,
}: {
  folder: (typeof folders)[0];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.folderCard} onPress={onPress}>
      <View style={styles.folderHeader}>
        <View style={styles.folderTitleRow}>
          <Ionicons name="folder" size={16} color="#0F0C0D" />
          <Text style={styles.folderName}>{folder.name}</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={18}
            color="#0F0C0D"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.folderIconContainer}>
        <FolderIllustration />
      </View>
    </TouchableOpacity>
  );
}

// ===== Documents View =====
function DocumentsView({
  onFolderClick,
}: {
  onFolderClick: (folderName: string) => void;
}) {
  return (
    <View style={styles.viewContainer}>
      <Text style={styles.sectionTitle}>Folders</Text>
      <View style={styles.foldersGrid}>
        <View style={styles.foldersRow}>
          <FolderCard
            folder={folders[0]}
            onPress={() => onFolderClick(folders[0].name)}
          />
          <FolderCard
            folder={folders[1]}
            onPress={() => onFolderClick(folders[1].name)}
          />
        </View>
        <View style={styles.foldersRow}>
          <FolderCard
            folder={folders[2]}
            onPress={() => onFolderClick(folders[2].name)}
          />
        </View>
      </View>
    </View>
  );
}

// ===== File Card =====
function FileCard({ file }: { file: (typeof files)[0] }) {
  return (
    <View style={styles.fileCard}>
      <View style={styles.fileHeader}>
        <View style={styles.fileTitleRow}>
          <Ionicons name="document" size={16} color="#0F0C0D" />
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={18}
            color="#0F0C0D"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.fileIconContainer}>
        <DocumentIllustration />
      </View>
    </View>
  );
}

// ===== Files View =====
function FilesView({ folderName }: { folderName: string }) {
  return (
    <View style={styles.viewContainer}>
      <Text style={styles.sectionTitle}>Files</Text>
      <View style={styles.filesGrid}>
        {files.map((file) => (
          <FileCard key={file.name} file={file} />
        ))}
      </View>
    </View>
  );
}

// ===== Main Screen =====
export default function TrashScreen() {
  const { teamId, planId, role } = useLocalSearchParams<{
    teamId?: string;
    planId?: string;
    role?: string;
  }>();

  const [currentView, setCurrentView] = useState<ViewType>("tasks");
  const [currentTab, setCurrentTab] = useState<Tab>("tasks");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleBack = () => {
    if (currentView === "files") {
      setCurrentView("documents");
      setSelectedFolder("");
    } else {
      router.back();
    }
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setCurrentView("files");
  };

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    setCurrentView(tab);
    setSelectedTasks(new Set());
    setSelectAll(false);
  };

  const handleTaskToggle = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAllToggle = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedTasks(new Set(deletedTasks.map((t) => t.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleRecover = () => {
    if (selectedTasks.size > 0) {
      // Navigate to plan detail after recover
      if (teamId && planId) {
        router.push({
          pathname: "/(team)/plan/planDetail",
          params: { teamId, planId, role },
        });
      } else {
        // If no teamId/planId, just go back
        router.back();
      }
    }
  };

  const getTitle = () => {
    if (currentView === "files") return selectedFolder;
    return "Recover";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header mode="small" style={styles.header}>
        <Appbar.BackAction color="#fff" onPress={handleBack} />
        <Appbar.Content title={getTitle()} titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.card}>
          {/* Tab Selector - only show when not in files view */}
          {currentView !== "files" && (
            <TabSelector activeTab={currentTab} onTabChange={handleTabChange} />
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {currentView === "tasks" && (
              <TasksView
                selectedTasks={selectedTasks}
                selectAll={selectAll}
                onTaskToggle={handleTaskToggle}
                onSelectAllToggle={handleSelectAllToggle}
                onRecover={handleRecover}
              />
            )}

            {currentView === "documents" && (
              <DocumentsView onFolderClick={handleFolderClick} />
            )}

            {currentView === "files" && (
              <FilesView folderName={selectedFolder} />
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EFF0",
  },
  header: {
    backgroundColor: ACCENT,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#F8F6F7",
    borderRadius: 10,
    padding: 10,
  },
  // Tab Selector
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E3DBDF",
    borderRadius: 13,
    padding: 3,
    gap: 3,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: ACCENT,
  },
  tabText: {
    fontSize: 12,
    color: "#0F0C0D",
    fontWeight: "400",
  },
  activeTabText: {
    color: "#F8F6F7",
    fontWeight: "600",
  },
  // View Container
  viewContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
    paddingHorizontal: 9,
    marginBottom: 10,
  },
  // Header Row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 9,
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // Task List
  taskList: {
    gap: 1,
  },
  taskItemContainer: {
    width: "100%",
  },
  taskItemContent: {
    backgroundColor: "#F2EFF0",
    marginLeft: 4,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskInfo: {
    flex: 1,
    gap: 2,
  },
  taskCode: {
    fontSize: 12,
    color: "#49454F",
    fontWeight: "500",
  },
  taskTitle: {
    fontSize: 16,
    color: "#0F0C0D",
    fontWeight: "500",
  },
  taskDate: {
    fontSize: 12,
    color: "#0F0C0D",
  },
  taskDeleteDate: {
    fontSize: 12,
    color: "#FF5F57",
  },
  // Folders Grid
  foldersGrid: {
    gap: 10,
  },
  foldersRow: {
    flexDirection: "row",
    gap: 20,
  },
  folderCard: {
    width: 175,
    height: 153,
    backgroundColor: "#F2EFF0",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
  },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  folderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  folderName: {
    fontSize: 16,
    color: "#0F0C0D",
  },
  folderIconContainer: {
    alignSelf: "center",
  },
  // Files Grid
  filesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  fileCard: {
    width: 175,
    height: 153,
    backgroundColor: "#F2EFF0",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: "#0F0C0D",
    flex: 1,
  },
  fileIconContainer: {
    alignSelf: "center",
  },
});
