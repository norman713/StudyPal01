import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";

import BottomBar from "@/components/ui/buttom";
import TabSelector from "./components/TabSelector";
import TrashDocuments from "./document";
import TrashTasks from "./task";

import taskApi, { DeletedTask } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import Header from "@/components/ui/header";

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

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const [confirmVisible, setConfirmVisible] = useState(false);

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

  const doRecover = async () => {
    try {
      setLoading(true);

      await Promise.all(
        Array.from(selectedTasks).map((taskId) =>
          taskApi.recoverTask(taskId, "CURRENT_ONLY")
        )
      );

      // remove recovered tasks from list
      setDeletedTasks((prev) =>
        prev.filter((task) => !selectedTasks.has(task.id))
      );

      setSelectedTasks(new Set());
      setSelectAll(false);
    } catch (err: any) {
      console.error("Recover task failed", err);

      let message = "Recover task failed. Please try again.";

      if (err?.response?.data) {
        const data = err.response.data;

        if (typeof data.message === "string") {
          message = data.message;
        } else if (Array.isArray(data.message)) {
          message = data.message.join("\n");
        }
      }

      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = () => {
    if (selectedTasks.size === 0) return;
    setConfirmVisible(true);
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <View className="flex-1 p-2">
        <View className="flex-1 bg-[#F8F6F7] rounded-xl p-2">
          <TabSelector activeTab={currentTab} onTabChange={setCurrentTab} />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 90 }}
            showsVerticalScrollIndicator={true}
          >
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

            {currentTab === "documents" && <TrashDocuments />}
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
      <QuestionModal
        visible={confirmVisible}
        title="Recover tasks"
        message="Are you sure you want to recover these selected tasks?"
        confirmText="Recover"
        cancelText="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          doRecover();
        }}
        onCancel={() => setConfirmVisible(false)}
      />

      <ErrorModal
        visible={errorVisible}
        title="Recover failed"
        message={errorMessage}
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
