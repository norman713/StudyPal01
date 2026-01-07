import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Text } from "react-native-paper";
import Svg, { Circle, G } from "react-native-svg";
import memberApi from "../../api/memberApi";
import teamApi from "../../api/teamApi";
import DateRangeModal from "./components/DateRangeModal";

const ACCENT = "#90717E";

type Duration = "1week" | "30days" | "60days" | "90days" | "custom";

interface MemberStat {
  id: string;
  name: string;
  avatarUrl?: string;
  finishedTasks: number;
}

interface TeamAnalysis {
  high: number;
  medium: number;
  low: number;
  unfinished: number;
}

/**
 * Donut Chart Component - giống design Figma
 */
function DonutChart({ data }: { data: TeamAnalysis }) {
  const total = data.high + data.medium + data.low + data.unfinished;

  // Use a small total to prevent division by zero and show empty ring if total is 0
  const safeTotal = total === 0 ? 1 : total;

  const size = 220;
  const strokeWidth = 45;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Segments với màu giống Figma
  const segments = [
    { value: data.high, color: "#FF5F57", label: "High" },
    { value: data.medium, color: "#FEBC2F", label: "Medium" },
    { value: data.low, color: "#27C840", label: "Low" },
    { value: data.unfinished, color: "#90717E", label: "Unfinished" },
  ];

  // Tính toán stroke-dasharray và stroke-dashoffset cho mỗi segment
  let accumulatedPercentage = 0;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#F8F6F7"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.4}
          />

          {/* Segments */}
          <G rotation="-90" origin={`${center}, ${center}`}>
            {segments.map((segment, index) => {
              if (segment.value <= 0) return null;

              const percentage = segment.value / safeTotal;
              const strokeDasharray = circumference;
              const strokeDashoffset = circumference * (1 - percentage);
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

      {/* Legend - 4 columns giống Figma */}
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
                ? `${((segment.value / total) * 100).toFixed(1).replace(".", ",")}%`
                : "0%"}
            </Text>
          </View>
        ))}
      </View>
      <Text
        style={{
          textAlign: "center",
          marginTop: 10,
          color: "#666",
          fontSize: 12,
        }}
      >
        Total tasks: {total}
      </Text>
    </View>
  );
}

/**
 * Member Item Component
 */
function MemberItem({ member }: { member: MemberStat }) {
  return (
    <View style={styles.memberItem}>
      {member.avatarUrl ? (
        <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
      ) : (
        <View style={styles.memberAvatarPlaceholder}>
          <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberTasks}>
          has finished{" "}
          <Text style={styles.memberTaskCount}>{member.finishedTasks}</Text>{" "}
          tasks
        </Text>
      </View>
    </View>
  );
}

/**
 * Statistic Screen
 */
export default function StatisticScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [duration, setDuration] = useState<Duration>("30days");
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<TeamAnalysis>({
    high: 0,
    medium: 0,
    low: 0,
    unfinished: 0,
  });
  const [members, setMembers] = useState<MemberStat[]>([]);

  // Custom date range state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customRange, setCustomRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const getDurationDays = (d: Duration) => {
    switch (d) {
      case "1week":
        return 7;
      case "30days":
        return 30;
      case "60days":
        return 60;
      case "90days":
        return 90;
      default:
        return 30;
    }
  };

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      let fromDate: string;
      let toDate: string;
      const FORMAT = "YYYY-MM-DD HH:mm:ss";

      if (duration === "custom" && customRange) {
        fromDate = customRange.from;
        toDate = customRange.to;
      } else {
        const days = getDurationDays(duration);
        toDate = dayjs().format(FORMAT);
        fromDate = dayjs().subtract(days, "day").format(FORMAT);
      }

      // 1. Fetch overall team stats
      const teamStats = await teamApi.getTaskStatistics(
        teamId,
        fromDate,
        toDate
      );
      setAnalysis({
        high: teamStats.high,
        medium: teamStats.medium,
        low: teamStats.low,
        unfinished: teamStats.unfinished,
      });

      // 2. Fetch members
      const membersRes = await memberApi.getAll(teamId, undefined, 50); // Fetch up to 50 members

      // 3. Fetch stats for each member
      const memberStatsPromises = membersRes.members.map(async (member) => {
        try {
          const stats = await teamApi.getTaskStatistics(
            teamId,
            fromDate,
            toDate,
            member.userId
          );
          const finishedTasks = (stats.total || 0) - (stats.unfinished || 0);
          return {
            id: member.userId,
            name: member.name,
            avatarUrl: member.avatarUrl,
            finishedTasks,
          } as MemberStat;
        } catch (e) {
          console.warn(`Failed to fetch stats for member ${member.userId}`, e);
          return {
            id: member.userId,
            name: member.name,
            avatarUrl: member.avatarUrl,
            finishedTasks: 0,
          } as MemberStat;
        }
      });

      const membersData = await Promise.all(memberStatsPromises);
      // Sort members by finished tasks desc
      membersData.sort((a, b) => b.finishedTasks - a.finishedTasks);

      setMembers(membersData);
    } catch (err) {
      console.error("Statistic API error", err);
    } finally {
      setLoading(false);
    }
  }, [teamId, duration, customRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleCustomAnalyze = (from: Date, to: Date) => {
    const FORMAT = "YYYY-MM-DD HH:mm:ss";
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

  return (
    <View style={styles.container}>
      <DateRangeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAnalyze={handleCustomAnalyze}
      />
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Statistic"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Duration Section */}
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

        {/* Team Analysis Section */}
        <View style={styles.card}>
          <View style={styles.analysisHeader}>
            <Text style={styles.sectionTitle}>Team's analysis</Text>
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>Team</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ACCENT} />
            </View>
          ) : (
            <DonutChart data={analysis} />
          )}
        </View>

        {/* Members Section */}
        <View style={styles.card}>
          <View style={styles.membersHeader}>
            <FontAwesome name="filter" size={16} color="#49454F" />
            <Text style={styles.sectionTitle}>Members</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={ACCENT} />
            </View>
          ) : members.length > 0 ? (
            members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))
          ) : (
            <Text style={{ textAlign: "center", color: "#888", padding: 20 }}>
              No members found
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F7",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  // Duration
  durationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  durationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2EFF0",
  },
  durationBtnActive: {
    backgroundColor: ACCENT,
  },
  durationBtnText: {
    fontSize: 14,
    color: "#0F0C0D",
    fontWeight: "600",
  },
  durationBtnTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
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
  },
  teamBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  // Chart
  chartContainer: {
    alignItems: "center",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 24,
    paddingHorizontal: 8,
  },
  legendItem: {
    alignItems: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 18,
    height: 18,
  },
  legendLabel: {
    fontSize: 12,
    color: "#0F0C0D",
  },
  legendValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F0C0D",
    marginTop: 2,
  },
  // Members
  membersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F6F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F0C0D",
  },
  memberTasks: {
    fontSize: 12,
    color: "#49454F",
  },
  memberTaskCount: {
    fontWeight: "600",
    color: ACCENT,
  },
});
