import planApi from "@/api/planApi";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { Appbar, Text } from "react-native-paper";

const ACCENT = "#90717E";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface ActivityLog {
  id: string;
  action: string;
  entityName: string;
  timestamp: string;
  actorName: string;
  actorAvatarUrl?: string;
}

// ==================== SUB COMPONENTS ====================
function ActivityItem({
  activity,
  formatTimestamp,
}: {
  activity: ActivityLog;
  formatTimestamp: (dateStr: string) => string;
}) {
  return (
    <View className="flex-row items-start gap-3 bg-gray-100 p-3 mb-2">
      {/* Avatar */}
      <View
        className="w-10 h-10 rounded-full overflow-hidden"
        style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
      >
        <Image
          source={{
            uri: activity.actorAvatarUrl || "https://i.pravatar.cc/150",
          }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
      </View>

      {/* Content */}
      <View className="flex-1 flex-col justify-center pt-0.5">
        <Text className="text-[12px] text-[#0F0C0D] font-medium mb-0.5">
          {formatTimestamp(activity.timestamp)}
        </Text>
        <Text className="text-[16px] text-gray-800 font-normal">
          <Text style={{ fontWeight: "bold" }}>{activity.actorName}</Text>{" "}
          {activity.action} {activity.entityName}
        </Text>
      </View>
    </View>
  );
}

export default function PlanHistoryScreen() {
  const {
    teamId,
    planId,
    role: roleParam,
  } = useLocalSearchParams<{
    teamId: string;
    planId: string;
    role: Role;
  }>();

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchPlanHistory = useCallback(async () => {
    if (!planId) return;

    try {
      setLoading(true);
      const data = await planApi.getPlanHistory(planId);
      setActivities(data?.content || []);
    } catch (error) {
      console.log("Error fetching history:", error);
      // Keep empty or show error
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlanHistory();
  }, [fetchPlanHistory]);

  const formatTimestamp = (dateStr: string) => {
    return dayjs(dateStr).format("HH:mm DD MMM, YYYY");
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#94747c" }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Plan history"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      {/* Main Content */}
      <ScrollView className="p-4">
        {/* Card Container */}
        <View className="bg-white p-5 shadow-sm">
          {/* Title */}
          <Text
            className="text-[16px] text-black mb-4"
            style={{ fontWeight: "700" }}
          >
            Activitiy log
          </Text>

          {/* List */}
          <View className="flex-col gap-2">
            {activities.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-base text-[#79747E]">
                  No activities yet
                </Text>
              </View>
            ) : (
              activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  formatTimestamp={formatTimestamp}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
