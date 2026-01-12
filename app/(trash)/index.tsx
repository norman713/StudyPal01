import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";

import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import TabSelector from "./components/TabSelector";
import TrashDocuments from "./document";
import TrashTasks from "./task";

import taskApi, { DeletedTask } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";

/* =======================
   SCREEN
======================= */

export default function TrashScreen() {
  const { teamId } = useLocalSearchParams();

  const [currentTab, setCurrentTab] = useState<"tasks" | "documents">("tasks");

  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  /* =======================
     🔒 BLOCK ANDROID BACK
  ======================= */
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
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
      } catch (err) {
        console.log("Failed to fetch deleted tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedTasks();
  }, [teamId]);

  /* =======================
     RECOVER ONE TASK
  ======================= */
  const doRecoverOne = async () => {
    if (!selectedTaskId) return;

    try {
      setLoading(true);

      await taskApi.recoverTask(selectedTaskId, "CURRENT_ONLY");

      // remove recovered task khỏi list
      setDeletedTasks((prev) => prev.filter((t) => t.id !== selectedTaskId));

      setSelectedTaskId(null);
    } catch (err: any) {
      let message = "Recover task failed. Please try again.";

      const apiMsg = err?.response?.data?.message;
      if (typeof apiMsg === "string") message = apiMsg;
      if (Array.isArray(apiMsg)) message = apiMsg.join("\n");

      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
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

          <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
            {currentTab === "tasks" && (
              <TrashTasks
                deletedTasks={deletedTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                onRecover={() => {
                  if (!selectedTaskId) return;
                  setConfirmVisible(true);
                }}
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
          }
        }}
      />

      {/* CONFIRM MODAL */}
      <QuestionModal
        visible={confirmVisible}
        title="Recover task"
        message="Are you sure you want to recover this task?"
        confirmText="Recover"
        cancelText="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          doRecoverOne();
        }}
        onCancel={() => setConfirmVisible(false)}
      />

      {/* ERROR MODAL */}
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
