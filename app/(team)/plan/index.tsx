import planApi, { Plan } from "@/api/planApi";
import ChatBotSection from "@/app/(me)/task/components/Chatbot";
import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import PlanHeader from "./components/PlanScreen/Header";
import PlanList from "./components/PlanScreen/PlanList";

const ACCENT = "#90717E";
const addButtonImg = require("../../../assets/images/Addbutton.png");

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

  // New States
  const [userSummary, setUserSummary] = useState<any>(null); // Replace any with proper type import if avail
  const [taskStats, setTaskStats] = useState({ total: 0 });
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  const [bottomTab, setBottomTab] = useState<
    "me" | "team" | "notification" | "trash"
  >("team");

  // Fetch helpers
  const loadPlansForDate = async (date: Date) => {
    if (!teamId) return;
    try {
      setLoading(true);
      // API expects YYYY-MM-DD
      const dateStr = dayjs(date).format("YYYY-MM-DD");

      // Use the specific date method that returns Plan[]
      const res = await planApi.getPlansByDate(teamId, dateStr);
      setPlans(res || []);
    } catch (err) {
      console.error("Failed to fetch plans for date", err);
      // Fallback or empty
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDates = async (month: number, year: number) => {
    if (!teamId) return;
    try {
      const dates = await planApi.getPlanDates(teamId, month, year);
      setMarkedDates(dates || []);
    } catch (err) {
      console.error("Failed to fetch plan dates", err);
    }
  };
  const loadStats = async (memberId: string) => {
    if (!teamId || !memberId) return;

    try {
      const from = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss");
      const to = dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss");

      const stats = await planApi.getTaskStatistics(teamId, memberId, from, to);

      setTaskStats(stats);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // Initial Load
  useFocusEffect(
    useCallback(() => {
      if (!teamId) return;

      const initData = async () => {
        try {
          // 1. Get User Info first (Verify Auth)
          const { default: userApi } = await import("@/api/userApi");
          const user = await userApi.getSummary();
          setUserSummary(user);

          // Add delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // 2. Get Stats & Plans
          const now = new Date();
          await Promise.all([
            loadStats(user.id),
            loadPlanDates(now.getMonth() + 1, now.getFullYear()),
            loadPlansForDate(now),
          ]);
        } catch (error) {
          console.error("Failed to initialize plan screen", error);
        }
      };

      initData();
    }, [teamId])
  );

  // Handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadPlansForDate(date);
  };

  const handleMonthChange = (date: Date) => {
    loadPlanDates(date.getMonth() + 1, date.getFullYear());
  };

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
    if (!canManage) {
      Alert.alert("Permission", "You are not admin or owner");
      return;
    }
    router.push({
      pathname: "/(team)/plan/planCreate",
      params: { teamId, role, mode: "create" },
    });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />

        <Appbar.Content
          title={teamName || "Team"}
          titleStyle={{
            color: "#F8F6F7",
            fontWeight: "700",
            fontSize: 16,
          }}
        />
      </Appbar.Header>
      <View className="flex-1 pb-4">
        <FlatList
          data={[1]}
          renderItem={null}
          ListHeaderComponent={
            <View style={styles.content}>
              <PlanHeader
                userName={userSummary?.name || "User"}
                taskCount={taskStats.total || 0}
                markedDates={markedDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />

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
      </View>

      {/* Sử dụng FAB sẵn có của BottomBar */}
      {/* <BottomBar
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
        onCenterPress={handleCreatePlan}
      /> */}
      <View className="items-center mb-6">
        <TouchableOpacity onPress={handleCreatePlan} activeOpacity={0.7}>
          <Image
            source={addButtonImg}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
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
