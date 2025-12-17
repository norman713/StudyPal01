import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";

import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import TrashTasks from "./task";
import TabSelector from "./components/TabSelector";
import TrashDocuments from "./document";

/* =======================
   TYPES & MOCK DATA
======================= */

// ---- TASKS ----
type TaskPriority = "high" | "medium" | "low";

export type TrashTask = {
  id: string;
  title: string;
  dateRange: string;
  deleteDate: string;
  priority: TaskPriority;
};

const deletedTasks: TrashTask[] = [
  {
    id: "task-1",
    title: "Task 1",
    dateRange: "12:00 27 Oct, 2025 - 24:00 29 Oct, 2025",
    deleteDate: "12:00 26 Oct, 2025",
    priority: "high",
  },
  {
    id: "task-2",
    title: "Task 2",
    dateRange: "08:00 20 Oct, 2025 - 18:00 22 Oct, 2025",
    deleteDate: "09:30 21 Oct, 2025",
    priority: "medium",
  },
  {
    id: "task-3",
    title: "Task 3",
    dateRange: "09:00 15 Oct, 2025 - 17:00 18 Oct, 2025",
    deleteDate: "10:00 16 Oct, 2025",
    priority: "low",
  },
];

// ---- FOLDERS ----
type FolderItem = {
  name: string;
  itemCount: number;
};

const folders: FolderItem[] = [
  { name: "General", itemCount: 12 },
  { name: "Math", itemCount: 8 },
  { name: "Science", itemCount: 15 },
];

// ---- FILES ----
type FileItem = {
  name: string;
  type: "excel" | "pdf" | "doc";
};

const files: FileItem[] = [
  { name: "DeCuong.xlsx", type: "excel" },
  { name: "TaiLieu.xlsx", type: "excel" },
  { name: "Report.pdf", type: "pdf" },
];

/* =======================
   SCREEN
======================= */

export default function TrashScreen() {
  const { teamId, planId, role } = useLocalSearchParams();

  const [currentTab, setCurrentTab] = useState<"tasks" | "documents">("tasks");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  /* =======================
     🔒 BLOCK ANDROID BACK
  ======================= */
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true // chặn back
      );

      return () => {
        subscription.remove();
      };
    }, [])
  );

  /* =======================
     HANDLERS
  ======================= */
  const handleTaskToggle = (id: string) => {
    const next = new Set(selectedTasks);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedTasks(next);
  };

  const handleSelectAllToggle = () => {
    if (!selectAll) {
      setSelectedTasks(new Set(deletedTasks.map((t) => t.id)));
    } else {
      setSelectedTasks(new Set());
    }
    setSelectAll(!selectAll);
  };

  const handleRecover = () => {
    if (teamId && planId) {
      router.replace({
        pathname: "/(team)/plan/planDetail",
        params: { teamId, planId, role },
      });
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* HEADER */}
      <Header
        avatarLabel="A"
        items={[
          { key: "inbox", label: "Inbox", icon: "inbox", badge: 24 },
          { key: "outbox", label: "Outbox", icon: "send" },
          { key: "favorites", label: "Favorites", icon: "heart-outline" },
          { key: "trash", label: "Trash", icon: "trash-can-outline" },
        ]}
        activeKey="trash"
        onSelect={() => {}}
      />

      {/* CONTENT */}
      <View className="flex-1 p-2">
        <View className="flex-1 bg-[#F8F6F7] rounded-xl p-2">
          <TabSelector activeTab={currentTab} onTabChange={setCurrentTab} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {currentTab === "tasks" && (
              <TrashTasks
                deletedTasks={deletedTasks}
                selectedTasks={selectedTasks}
                selectAll={selectAll}
                onTaskToggle={handleTaskToggle}
                onSelectAllToggle={handleSelectAllToggle}
                onRecover={handleRecover}
              />
            )}

            {currentTab === "documents" && (
              <TrashDocuments folders={folders} files={files} />
            )}
          </ScrollView>
        </View>
      </View>

      {/* BOTTOM BAR */}
      <BottomBar
        activeTab="trash"
        onTabPress={(tab) => {
          switch (tab) {
            case "team":
              router.replace("/(team)/search");
              break;
            case "notification":
              router.replace("/(noti)");
              break;
            case "me":
              router.replace("/(me)");
              break;
            case "trash":
              break;
          }
        }}
      />
    </View>
  );
}
