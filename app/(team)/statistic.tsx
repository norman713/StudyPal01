import { FontAwesome } from "@expo/vector-icons";
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

const ACCENT = "#90717E";

type Duration = "1week" | "30days" | "60days" | "90days";

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
  if (total === 0) return null;

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
              if (segment.value === 0) return null;

              const percentage = segment.value / total;
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

  const [duration, setDuration] = useState<Duration>("1week");
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<TeamAnalysis>({
    high: 40,
    medium: 20,
    low: 15,
    unfinished: 15,
  });
  const [members, setMembers] = useState<MemberStat[]>([]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Call actual API when available
      // const res = await statisticApi.getTeamStats(teamId, duration);

      // Mock data for demo
      setTimeout(() => {
        setAnalysis({
          high: 40,
          medium: 20,
          low: 15,
          unfinished: 15,
        });
        setMembers([
          {
            id: "1",
            name: "Nguyetlun115",
            avatarUrl: "https://i.pravatar.cc/50?img=1",
            finishedTasks: 10,
          },
          {
            id: "2",
            name: "Nguyetmanggiayde10cm",
            avatarUrl: "https://i.pravatar.cc/50?img=2",
            finishedTasks: 5,
          },
          {
            id: "3",
            name: "Nguyetkhongcao",
            avatarUrl: "https://i.pravatar.cc/50?img=3",
            finishedTasks: 3,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.warn("Statistic API not available");
      setLoading(false);
    }
  }, [teamId, duration]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const durations: { key: Duration; label: string }[] = [
    { key: "1week", label: "1 week" },
    { key: "30days", label: "30 days" },
    { key: "60days", label: "60 days" },
    { key: "90days", label: "90 days" },
  ];

  return (
    <View style={styles.container}>
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
            <TouchableOpacity>
              <FontAwesome name="calendar" size={20} color="#49454F" />
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
          ) : (
            members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))
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
