import planApi, { Plan } from "@/api/planApi";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import PlanItem from "./components/PlanItem";

const addButtonImg = require("../../../assets/images/Addbutton.png");
const ACCENT = "#90717E";
function formatDateString(date: Date): string {
  return date.toLocaleDateString("en-GB");
}

type Role = "OWNER" | "ADMIN" | "MEMBER";
const today = new Date();

/**
 * Search Plan Screen
 */
export default function PlanScreen() {
  const { teamId, role: roleParam } = useLocalSearchParams<{
    teamId: string;
    role: Role;
  }>();

  // Role permissions
  const role: Role = (roleParam as Role) || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  // States
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false); // Default false, only load on search? Or true if auto-load.
  // Let's keep auto-load.
  const [query, setQuery] = useState("");

  // Use Date objects for state to manage formatting easily
  const [fromDate, setFromDate] = useState<Date>(today);
  const [toDate, setToDate] = useState<Date>(today);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Fetch plans
  // Fetch plans
  const fetchPlans = useCallback(async () => {
    if (!teamId) return;

    // Requirement: Must have keyword, fromDate, toDate, size.
    if (!query.trim()) {
      // If no keyword, do not fetch.
      // "If not query then list empty"
      setPlans([]);
      return;
    }

    if (dayjs(toDate).isBefore(dayjs(fromDate))) {
      alert("To date must be after From date");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        keyword: query.trim(),
        fromDate: dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        toDate: dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        size: 10,
      };

      const res = await planApi.searchPlans(teamId, payload);
      setPlans(res.plans || []);
    } catch (err: any) {
      console.warn("Search API failed", err);
      // No mock data allowed
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, query, fromDate, toDate]);

  // Handlers
  const handleSearch = () => {
    fetchPlans();
  };

  const handleCreatePlan = () => {
    if (!teamId) return;
    router.push({
      pathname: "/(team)/plan/planCreate",
      params: { teamId, role, mode: "create" },
    });
  };

  const handlePlanPress = (plan: Plan) => {
    router.push({
      pathname: "/(team)/plan/planDetail",
      params: {
        teamId,
        planId: plan.id,
        role,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER - giống SearchTask */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Search plan"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Search input */}
        <TextInput
          label="Search by plan name"
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          outlineStyle={{ borderRadius: 30 }}
          style={styles.searchInput}
        />

        {/* Date Row */}
        <View style={styles.dateRow}>
          {/* From date */}
          <View style={styles.dateField}>
            <TextInput
              mode="outlined"
              label="From date"
              value={formatDateString(fromDate)}
              editable={false}
              textColor="#000000"
              theme={{
                roundness: 30,
                colors: {
                  background: "#FFFFFF",
                },
              }}
              right={
                <TextInput.Icon
                  icon={() => (
                    <FontAwesome name="calendar" size={20} color="#555" />
                  )}
                  onPress={() => setShowFromPicker(!showFromPicker)}
                />
              }
            />

            {showFromPicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setFromDate(selectedDate);
                  }
                  setShowFromPicker(false);
                }}
              />
            )}
          </View>

          {/* To date */}
          <View style={styles.dateField}>
            <TextInput
              mode="outlined"
              label="To date"
              value={formatDateString(toDate)}
              editable={false}
              textColor="#000000"
              theme={{
                roundness: 30,
                colors: {
                  background: "#FFFFFF",
                },
              }}
              outlineStyle={{ borderRadius: 999 }}
              right={
                <TextInput.Icon
                  icon={() => (
                    <FontAwesome name="calendar" size={20} color="#555" />
                  )}
                  onPress={() => setShowToPicker(!showToPicker)}
                />
              }
            />

            {showToPicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setToDate(selectedDate);
                  }
                  setShowToPicker(false);
                }}
              />
            )}
          </View>
        </View>

        {/* Search button */}
        <Button
          mode="contained"
          buttonColor="#90717E"
          contentStyle={{ height: 44 }}
          labelStyle={{
            fontSize: 16,
            fontFamily: "PoppinsRegular",
            color: "#fff",
          }}
          style={styles.searchButton}
          onPress={handleSearch}
        >
          Search
        </Button>

        {/* Filter label */}
        <View style={styles.filterRow}>
          <FontAwesome name="filter" size={20} color="#444" />
          <Text style={styles.filterText}>Plan</Text>
        </View>

        {/* Plan list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : (
          <View style={styles.planList}>
            {plans.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color="#E3DBDF"
                />
                <Text style={styles.emptyText}>No plans found</Text>
              </View>
            ) : (
              plans.map((plan) => (
                <PlanItem
                  key={plan.id}
                  plan={plan}
                  onPress={() => handlePlanPress(plan)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* add button only show for admin/ owner */}
      {canManage && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity onPress={handleCreatePlan} activeOpacity={0.7}>
            <Image
              source={addButtonImg}
              style={{ width: 70, height: 70 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.addButtonText}>Add new plan</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    marginBottom: 16,
    marginTop: 16,
    gap: 8,
  },
  dateField: {
    flex: 1,
  },
  searchButton: {
    borderRadius: 100,
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  planList: {
    marginBottom: 100,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#79747E",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#90717E",
    marginTop: 8,
    fontSize: 16,
  },
});
