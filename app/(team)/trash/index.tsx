import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";

import TabSelector from "./components/TabSelector";
import TrashDocuments from "./document";
import TrashTasks from "./task";

import taskApi, { DeletedTask } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import { Appbar } from "react-native-paper";

export default function TrashScreen() {
  const { teamId } = useLocalSearchParams();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [currentTab, setCurrentTab] = useState<"tasks" | "documents">("tasks");
  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
  const [loading, setLoading] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  /* ======================= 
     BLOCK ANDROID BACK
  ===================== */
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
        console.error("Failed to fetch deleted tasks", err);
        setErrorMessage("Failed to load deleted tasks.");
        setErrorVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedTasks();
  }, [teamId]);

  /* =======================
     RECOVER (simple action)
  ======================= */

  const doRecoverOne = async () => {
    if (!selectedTaskId) return;

    try {
      setLoading(true);

      await taskApi.recoverTaskInPlan(selectedTaskId);

      // remove task vừa recover khỏi list
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

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />
        <Appbar.Content
          title="Recover"
          titleStyle={{ color: "#F8F6F7", fontWeight: "700", fontSize: 16 }}
        />
      </Appbar.Header>

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

      <ErrorModal
        visible={errorVisible}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
