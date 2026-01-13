import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";

import TabSelector from "./components/TabSelector";
import TrashDocuments from "./document";
import TrashTasks from "./task";

import taskApi, { DeletedTask } from "@/api/taskApi";
import ErrorModal from "@/components/modal/error";
import { Appbar } from "react-native-paper";

export default function TrashScreen() {
  const { teamId } = useLocalSearchParams();

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
  const handleRecover = async () => {
    try {
      setLoading(true);

      await Promise.all(
        deletedTasks.map((task) => taskApi.recoverTaskInPlan(task.id))
      );

      setDeletedTasks([]);
    } catch (err: any) {
      console.error("Recover failed", err);
      setErrorMessage("Recover task failed. Please try again.");
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
                onRecover={handleRecover}
              />
            )}

            {currentTab === "documents" && <TrashDocuments />}
          </ScrollView>
        </View>
      </View>

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
