import planApi, { Plan } from "@/api/planApi";
import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import ChatBotSection from "./components/PlanScreen/Chatbot";
import PlanHeader from "./components/PlanScreen/Header";
import PlanList from "./components/PlanScreen/PlanList";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Plans Section - with arrow to navigate to search
 */

/**
 * Main Plan Screen - với Calendar
 */
export default function PlanScreen() {
  const {
    teamId,
    role: roleParam,
    teamName,
  } = useLocalSearchParams<{
    teamId: string;
    role: Role;
    teamName: string;
  }>();

  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  // States
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [bottomTab, setBottomTab] = useState<
    "me" | "team" | "notification" | "trash"
  >("team");

  // Mock plan dates for calendar highlighting - bao gồm cả startDate và dueDate
  const planDates = plans.flatMap((p) => [
    dayjs(p.startDate).format("YYYY-MM-DD"),
    dayjs(p.dueDate).format("YYYY-MM-DD"),
  ]);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      const res = await planApi.getPlans(teamId);
      setPlans(res.plans || []);
    } catch (err: any) {
      // API chưa có hoặc server lỗi - dùng mock data để demo
      console.warn("Plan API not available, using mock data");
      // Mock data - dùng ngày trong tháng hiện tại để hiển thị màu đỏ
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      // Tạo các ngày có plan trong tháng hiện tại
      const day7 = new Date(year, month, 7).toISOString();
      const day10 = new Date(year, month, 10).toISOString();
      const day16 = new Date(year, month, 16).toISOString();
      const day18 = new Date(year, month, 18).toISOString();

      setPlans([
        {
          id: "1",
          code: "PLN-1",
          name: "Plan A",
          description: "Plan description",
          startDate: day7,
          dueDate: day10,
          progress: 75.0,
          totalTasks: 20,
          completedTasks: 15,
          status: "IN_PROGRESS",
        },
        {
          id: "2",
          code: "PLN-2",
          name: "Plan B",
          description: "Plan B description",
          startDate: day16,
          dueDate: day18,
          progress: 75.0,
          totalTasks: 10,
          completedTasks: 7,
          status: "IN_PROGRESS",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handlers
  const handlePlanPress = (plan: Plan) => {
    router.push({
      pathname: "/(team)/plan/planDetail",
      params: { teamId, planId: plan.id, role },
    });
  };

  const handleSeeAllPlans = () => {
    router.push({
      pathname: "/(team)/plan/searchPlan",
      params: { teamId, role },
    });
  };

  const handleCreatePlan = () => {
    router.push({
      pathname: "/(team)/plan/planCreate",
      params: { teamId, role, mode: "create" },
    });
  };

  return (
    <View style={styles.container}>
      <Header items={[]} onSelect={() => {}} />

      <FlatList
        data={[1]}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            <PlanHeader />

            <ChatBotSection />

            <PlanList
              plans={plans}
              loading={loading}
              onPlanPress={handlePlanPress}
              onSeeAll={handleSeeAllPlans}
            />
          </View>
        }
        keyExtractor={() => "main"}
        showsVerticalScrollIndicator={false}
      />

      {/* Sử dụng FAB sẵn có của BottomBar */}
      <BottomBar
        activeTab={bottomTab}
        onTabPress={(tab) => {
          setBottomTab(tab);
          switch (tab) {
            case "me":
              router.push("/(me)");
              break;
            case "team":
              router.push("/(team)/search");
              break;
            case "notification":
              router.push("/(noti)");
              break;
            case "trash":
              router.push("/(team)/trash/index");
              break;
          }
        }}
        onCenterPress={canManage ? handleCreatePlan : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F7",
  },
  content: {
    padding: 16,
    paddingBottom: 180,
  },
  // Header Section
  headerSection: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 8,
    color: "#0F0C0D",
  },
  planCountText: {
    color: ACCENT,
    fontWeight: "bold",
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  navBtn: {
    fontSize: 22,
    color: "#49454F",
    fontWeight: "700",
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F0C0D",
  },
  // ChatBot Section
  chatBotContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  botAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F2EFF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F2EFF0",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  // Plans Section
  plansSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  plansSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plansSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyPlans: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#79747E",
  },
  // Plan Item
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2EFF0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
  },
  planInfo: {
    flex: 1,
    marginRight: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  planDate: {
    fontSize: 12,
    color: "#0F0C0D",
    marginTop: 2,
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: ACCENT,
  },
});
