import ErrorModal from "@/components/modal/error";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Text } from "react-native-paper";
import Svg, { Circle, G } from "react-native-svg";
import teamApi, { TeamMemberTaskStatistic } from "../../api/teamApi";
import DateRangeModal from "./components/DateRangeModal";

const ACCENT = "#90717E";

type Duration = "1week" | "30days" | "60days" | "90days" | "custom";

interface TeamAnalysis {
  total: number;
  high: number;
  medium: number;
  low: number;
  unfinished: number;
}

/**
 * Donut Chart Component - giống design Figma
 */
function DonutChart({ data }: { data: TeamAnalysis }) {
  const total = data.total;

  const safeTotal = total === 0 ? 1 : total;

  const size = 220;
  const strokeWidth = 45;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const segments = [
    { value: data.high, color: "#FF5F57", label: "High" },
    { value: data.medium, color: "#FEBC2F", label: "Medium" },
    { value: data.low, color: "#27C840", label: "Low" },
    { value: data.unfinished, color: "#90717E", label: "Unfinished" },
  ];

  let accumulatedPercentage = 0;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#F8F6F7"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.4}
          />

          <G rotation="-90" origin={`${center}, ${center}`}>
            {segments.map((segment, index) => {
              if (segment.value <= 0) return null;

              const percentage = segment.value / safeTotal;
              const rotation = accumulatedPercentage * 360;

              accumulatedPercentage += percentage;

              return (
                <Circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${percentage * circumference} ${circumference}`}
                  strokeDashoffset={0}
                  rotation={rotation}
                  origin={`${center}, ${center}`}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>
      </View>

      <View style={styles.legendContainer}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendColor, { backgroundColor: segment.color }]}
              />
              <Text style={styles.legendLabel}>{segment.label}</Text>
            </View>
            <Text style={styles.legendValue}>
              {total > 0
                ? `${((segment.value / total) * 100)
                    .toFixed(1)
                    .replace(".", ",")}%`
                : "0%"}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.totalText}>Total tasks: {total}</Text>
    </View>
  );
}

/**
 * Member Item Component
 */
function MemberItem({
  member,
  isSelected,
  onPress,
}: {
  member: TeamMemberTaskStatistic;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
      <View
        style={[styles.memberItem, isSelected && styles.memberItemSelected]}
      >
        {member.avatarUrl ? (
          <Image
            source={{ uri: member.avatarUrl }}
            style={styles.memberAvatar}
          />
        ) : (
          <View style={styles.memberAvatarPlaceholder}>
            <Text style={styles.memberAvatarText}>
              {member.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>
        )}

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberTasks}>
            has finished{" "}
            <Text style={styles.memberTaskCount}>
              {member.completedTaskCount}
            </Text>{" "}
            tasks
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const FORMAT = "YYYY-MM-DD HH:mm:ss";

function getDateRange(
  duration: Duration,
  customRange: { from: string; to: string } | null
) {
  if (duration === "custom" && customRange) {
    return {
      fromDate: customRange.from,
      toDate: customRange.to,
    };
  }

  const daysMap: Record<Exclude<Duration, "custom">, number> = {
    "1week": 7,
    "30days": 30,
    "60days": 60,
    "90days": 90,
  };

  const days = daysMap[duration as Exclude<Duration, "custom">] ?? 7;

  // Requirement:
  // toDate = hôm nay lúc 00:00:00
  // fromDate = X ngày trước lúc 00:00:00
  const today = dayjs().startOf("day");
  const pastDate = today.subtract(days, "day");

  return {
    fromDate: pastDate.format(FORMAT),
    toDate: today.format(FORMAT),
  };
}

/**
 * Statistic Screen
 */
export default function StatisticScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [duration, setDuration] = useState<Duration>("1week");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [analysis, setAnalysis] = useState<TeamAnalysis>({
    high: 0,
    medium: 0,
    low: 0,
    unfinished: 0,
    total: 0,
  });

  const [members, setMembers] = useState<TeamMemberTaskStatistic[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Selected member logic
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberAnalysis, setMemberAnalysis] = useState<TeamAnalysis | null>(
    null
  );
  const [loadingMemberStats, setLoadingMemberStats] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState("");

  // Custom date range state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customRange, setCustomRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const selectedMemberName = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find((m) => m.userId === selectedMemberId)?.name ?? "Member";
  }, [selectedMemberId, members]);

  // 1. Fetch Team Overall Statistics
  const fetchTeamAnalysis = useCallback(
    async (tId: string, from: string, to: string) => {
      try {
        const teamStats = await teamApi.getTaskStatistics(tId, from, to);
        console.log("TEAM ID:", tId);
        console.log("TEAM FROM:", from);

        console.log("TEAM to:", to);
        console.log("TEAM INFO:", teamStats);

        setAnalysis({
          high: teamStats.high || 0,
          medium: teamStats.medium || 0,
          low: teamStats.low || 0,
          unfinished: teamStats.unfinished || 0,
          total: teamStats.total || 0,
        });
      } catch (err: any) {
        console.log("fetchTeamAnalysis error:", err);
        setAnalysis({ high: 0, medium: 0, low: 0, unfinished: 0, total: 0 });
      }
    },
    []
  );

  // 2. Search/Fetch Members List
  const fetchMembers = useCallback(
    async (
      tId: string,
      from: string,
      to: string,
      keyword: string,
      showLoading = false
    ) => {
      if (showLoading) setLoadingMembers(true);
      try {
        const res = await teamApi.searchTeamTaskStatistics(tId, {
          fromDate: from,
          toDate: to,
          keyword: keyword,
          size: 50, // Fetch top 50 matches
        });
        console.log("FRIST ROUTE:", res);
        setMembers(res.statistics || []);
      } catch (err: any) {
        console.log("fetchMembers error:", err);
        // Don't clear members on error if we had some
      } finally {
        if (showLoading) setLoadingMembers(false);
      }
    },
    []
  );

  // 3. Fetch Specific Member Statistics
  const fetchMemberAnalysis = async (
    tId: string,
    memId: string,
    from: string,
    to: string
  ) => {
    setLoadingMemberStats(true);

    // ✅ log payload gửi đi
    console.log("[Statistic] member stats payload:", {
      teamId: tId,
      memberId: memId,
      fromDate: from,
      toDate: to,
    });

    try {
      const res = await teamApi.getTaskStatistics(tId, from, to, memId);

      // ✅ log response trả về
      console.log("[Statistic] member stats response:", res);

      setMemberAnalysis({
        high: res.high || 0,
        medium: res.medium || 0,
        low: res.low || 0,
        unfinished: res.unfinished || 0,
        total: res.total,
      });
    } catch (err: any) {
      console.log("[Statistic] member stats error:", err);
      console.log("[Statistic] member stats error.response:", err?.response);

      setMemberAnalysis(null);
      setErrorMessage("Failed to load member statistics");
      setErrorVisible(true);
    } finally {
      setLoadingMemberStats(false);
    }
  };

  const handleRefresh = async () => {
    if (!teamId) return;
    setRefreshing(true);
    const { fromDate, toDate } = getDateRange(duration, customRange);

    await Promise.all([
      fetchTeamAnalysis(teamId, fromDate, toDate),
      fetchMembers(teamId, fromDate, toDate, searchText, false),
    ]);

    if (selectedMemberId) {
      await fetchMemberAnalysis(teamId, selectedMemberId, fromDate, toDate);
    }

    setRefreshing(false);
  };

  // Initial load & Date change & Search
  useEffect(() => {
    if (!teamId) return;

    const { fromDate, toDate } = getDateRange(duration, customRange);

    const init = async () => {
      setLoading(true);
      // Fetch team stats
      await fetchTeamAnalysis(teamId, fromDate, toDate);

      // Fetch member list (search with empty keyword initially)
      await fetchMembers(teamId, fromDate, toDate, searchText, true);

      // If a member is already selected, re-fetch their stats with new date
      if (selectedMemberId) {
        await fetchMemberAnalysis(teamId, selectedMemberId, fromDate, toDate);
      }
      setLoading(false);
    };

    init();
  }, [teamId, duration, customRange]);

  useEffect(() => {
    if (!teamId) return;
    const { fromDate, toDate } = getDateRange(duration, customRange);

    const timer = setTimeout(() => {
      fetchMembers(teamId, fromDate, toDate, searchText, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const onSelectMember = async (memId: string) => {
    if (selectedMemberId === memId) {
      setSelectedMemberId(null);
      setMemberAnalysis(null);
    } else {
      // Select
      setSelectedMemberId(memId);
      if (teamId) {
        const { fromDate, toDate } = getDateRange(duration, customRange);
        await fetchMemberAnalysis(teamId, memId, fromDate, toDate);
      }
    }
  };

  const handleCustomAnalyze = (from: Date, to: Date) => {
    setCustomRange({
      from: dayjs(from).startOf("day").format(FORMAT),
      to: dayjs(to).endOf("day").format(FORMAT),
    });
    setDuration("custom");
  };

  const durations: { key: Duration; label: string }[] = [
    { key: "1week", label: "1 week" },
    { key: "30days", label: "30 days" },
    { key: "60days", label: "60 days" },
    { key: "90days", label: "90 days" },
  ];

  const chartData =
    selectedMemberId && memberAnalysis ? memberAnalysis : analysis;
  const isChartLoading = loading || loadingMemberStats;

  return (
    <View style={styles.container}>
      <DateRangeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAnalyze={handleCustomAnalyze}
      />

      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Statistic"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Duration */}
          <View style={styles.card}>
            <View style={styles.durationHeader}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <FontAwesome
                  name="calendar"
                  size={20}
                  color={duration === "custom" ? ACCENT : "#49454F"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.durationButtons}>
              {durations.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[
                    styles.durationBtn,
                    duration === d.key && styles.durationBtnActive,
                  ]}
                  onPress={() => setDuration(d.key)}
                >
                  <Text
                    style={[
                      styles.durationBtnText,
                      duration === d.key && styles.durationBtnTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Team / Member Analysis */}
          <View style={styles.card}>
            <View style={styles.analysisHeader}>
              <Text style={styles.sectionTitle}>
                {selectedMemberId ? "Member's analysis" : "Team's analysis"}
              </Text>

              <View style={styles.teamBadge}>
                <Text style={styles.teamBadgeText}>
                  {selectedMemberId ? selectedMemberName : "Team"}
                </Text>
              </View>
            </View>

            {isChartLoading ? (
              <View style={styles.chartLoadingContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
              </View>
            ) : (
              <DonutChart data={chartData} />
            )}
          </View>

          {/* Members + Search */}
          <View style={styles.card}>
            <View style={styles.membersHeader}>
              <FontAwesome name="filter" size={20} color="#444" />
              <Text style={styles.sectionTitle}>Members</Text>

              {/* Clear Selection Button */}
              {selectedMemberId ? (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMemberId(null);
                    setMemberAnalysis(null);
                  }}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearBtnText}>Clear Selection</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Search bar */}
            <View style={styles.searchBox}>
              <FontAwesome name="search" size={16} color="#777" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by member name"
                placeholderTextColor="#999"
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchText.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <FontAwesome name="times-circle" size={16} color="#777" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* List */}
            {loadingMembers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={ACCENT} />
              </View>
            ) : members.length > 0 ? (
              members.map((member) => {
                const isSelected = selectedMemberId === member.userId;
                return (
                  <MemberItem
                    key={member.userId}
                    member={member}
                    isSelected={isSelected}
                    onPress={() => onSelectMember(member.userId)}
                  />
                );
              })
            ) : (
              <Text style={{ textAlign: "center", color: "#888", padding: 20 }}>
                No members found
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F6F7" },
  scrollView: { flex: 1, padding: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0F0C0D" },

  // Duration
  durationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  durationButtons: { flexDirection: "row", gap: 8 },
  durationBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#F2EFF0",
  },
  durationBtnActive: { backgroundColor: ACCENT },
  durationBtnText: { fontSize: 14, color: "#0F0C0D", fontWeight: "600" },
  durationBtnTextActive: { color: "#fff", fontWeight: "600" },

  // Analysis
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  teamBadge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 180,
  },
  teamBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  chartLoadingContainer: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: { paddingVertical: 40, alignItems: "center" },

  // Chart
  chartContainer: { alignItems: "center" },
  chartWrapper: { alignItems: "center", justifyContent: "center" },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 24,
    paddingHorizontal: 8,
  },
  legendItem: { alignItems: "center" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendColor: { width: 18, height: 18 },
  legendLabel: { fontSize: 12, color: "#0F0C0D" },
  legendValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F0C0D",
    marginTop: 2,
  },
  totalText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
    fontSize: 12,
  },

  // Members
  membersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F2EFF0",
  },
  clearBtnText: { color: "#49454F", fontSize: 12, fontWeight: "600" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8F6F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F0C0D",
    paddingVertical: 0,
  },

  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F6F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  memberItemSelected: {
    borderColor: ACCENT,
    backgroundColor: "#F6EFF2",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B4EFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberAvatarText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: "600", color: "#0F0C0D" },
  memberTasks: { fontSize: 12, color: "#49454F" },
  memberTaskCount: { fontWeight: "600", color: ACCENT },
});
