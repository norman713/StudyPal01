import teamApi from "@/api/teamApi";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Appbar, Avatar, Button, Text, TextInput } from "react-native-paper";

const PAGE_SIZE = 20;

export default function SearchTeamStatisticScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  /* =======================
     STATE
  ======================= */
  const [query, setQuery] = useState("");

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [data, setData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const formatDateDisplay = (date: Date) => dayjs(date).format("DD/MM/YYYY");

  const isDateValid =
    !!fromDate && !!toDate && !dayjs(toDate).isBefore(dayjs(fromDate));

  /* =======================
     FETCH API
  ======================= */
  const fetchData = async (isLoadMore = false) => {
    if (!teamId) return;
    if (isLoadMore && loading) return;

    // 🚫 BẮT BUỘC date hợp lệ
    if (!isDateValid) return;

    setLoading(true);
    try {
      const res = await teamApi.searchTeamTaskStatistics(teamId, {
        keyword: query.trim() || undefined,
        fromDate: dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        toDate: dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"),

        cursor: isLoadMore ? cursor : undefined,
        size: PAGE_SIZE,
      });

      console.log("[SearchTeamStatistic API RESPONSE]", res);

      setData((prev) =>
        isLoadMore ? [...prev, ...res.statistics] : res.statistics
      );
      setCursor(res.nextCursor ?? undefined);
    } catch (err: any) {
      console.error(
        "[SearchTeamStatistic API ERROR]",
        err?.response?.data || err
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <View className="flex-1 bg-[#fff]">
      {/* Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Statistic"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      {/* Keyword */}
      <View className="p-3">
        <TextInput
          label="Search by keyword(optional)"
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          theme={{
            roundness: 99,
            colors: { background: "#FFFFFF" },
          }}
        />
      </View>

      {/* Date range */}
      <View className=" flex-row  gap-2 p-3">
        {/* From */}
        <View className="flex-1 ">
          <TextInput
            mode="outlined"
            dense
            label="From date *"
            value={fromDate ? formatDateDisplay(fromDate) : ""}
            editable={false}
            theme={{ roundness: 99, colors: { background: "#FFFFFF" } }}
            right={
              <TextInput.Icon
                icon={() => (
                  <FontAwesome name="calendar" size={20} color="#555" />
                )}
                onPress={() => setShowFromPicker(true)}
              />
            }
          />

          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowFromPicker(false);
                if (event.type === "set" && selectedDate) {
                  setFromDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* To */}
        <View className="flex-1">
          <TextInput
            mode="outlined"
            dense
            label="To date *"
            value={toDate ? formatDateDisplay(toDate) : ""}
            editable={false}
            theme={{ roundness: 99, colors: { background: "#FFFFFF" } }}
            right={
              <TextInput.Icon
                icon={() => (
                  <FontAwesome name="calendar" size={20} color="#555" />
                )}
                onPress={() => setShowToPicker(true)}
              />
            }
          />

          {showToPicker && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowToPicker(false);
                if (event.type === "set" && selectedDate) {
                  setToDate(selectedDate);
                }
              }}
            />
          )}
        </View>
      </View>

      {/* Search button */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Button
          mode="contained"
          buttonColor="#90717E"
          onPress={() => {
            setCursor(undefined);
            fetchData(false);
          }}
          loading={loading}
          disabled={!isDateValid || loading} // ✅ disable nếu thiếu date
        >
          Search
        </Button>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        onEndReached={() => {
          if (cursor) fetchData(true);
        }}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
              No data found
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {item.avatarUrl ? (
              <Avatar.Image size={40} source={{ uri: item.avatarUrl }} />
            ) : (
              <Avatar.Text
                size={40}
                label={item.name?.charAt(0)?.toUpperCase() ?? "U"}
                style={{ backgroundColor: "#6B4EFF" }}
                color="#fff"
              />
            )}

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text style={{ color: "#90717E", marginTop: 2 }}>
                Completed tasks: {item.completedTaskCount}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
