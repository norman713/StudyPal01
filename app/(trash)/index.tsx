import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";

import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import TabSelector from "./components/TabSelector";
import TrashDocuments from "./document";
import TrashTasks from "./task";

import taskApi, { DeletedTask } from "@/api/taskApi";

/* =======================
   SCREEN
======================= */

export default function TrashScreen() {
  const { teamId, planId, role } = useLocalSearchParams();

  const [currentTab, setCurrentTab] = useState<"tasks" | "documents">("tasks");
  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
     🔒 BLOCK ANDROID BACK
  ======================= */
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );

      return () => {
        subscription.remove();
      };
    }, [])
  );

  /* =======================
     FETCH DELETED TASKS
  ======================= */
  useEffect(() => {
    const fetchDeletedTasks = async () => {
      try {
        setLoading(true);
        const res = await taskApi.getDeletedTasks({
          teamId: teamId as string | undefined,
          size: 20,
        });
        setDeletedTasks(res.tasks);
      } catch (error) {
        console.log("Failed to fetch deleted tasks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedTasks();
  }, [teamId]);

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
      // TODO: call recover API here
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
              <TrashDocuments
                folders={[
                  { name: "General", itemCount: 12 },
                  { name: "Math", itemCount: 8 },
                  { name: "Science", itemCount: 15 },
                ]}
                files={[
                  { name: "DeCuong.xlsx", type: "excel" },
                  { name: "TaiLieu.xlsx", type: "excel" },
                  { name: "Report.pdf", type: "pdf" },
                ]}
              />
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
