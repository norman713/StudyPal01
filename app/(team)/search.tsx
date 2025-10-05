import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import {
  Avatar,
  IconButton,
  List,
  Searchbar,
  SegmentedButtons,
  Text,
} from "react-native-paper";

import Header from "@/components/ui/header";

/* ---------- Types & mock data (swap with API) ---------- */
type TeamRole = "owner" | "member";
type Team = { id: string; name: string; role: TeamRole; avatar?: string };

const MOCK_TEAMS: Team[] = [
  { id: "1", name: "Sienna’s team", role: "owner" },
  { id: "2", name: "Frontend Guild", role: "member" },
  { id: "3", name: "Mobile Squad", role: "member" },
  { id: "4", name: "DevOps Ninjas", role: "owner" },
  { id: "5", name: "UI/UX Studio", role: "member" },
];

/* ======================================================= */
export default function Search() {
  //CONST
  const ACTIVE = "#90717E";
  const INACTIVE = "#E3DBDF";
  const LABEL_SIZE = 11;
  const nav = useNavigation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"joined" | "owned">("joined");

  const teams = useMemo(() => {
    const base =
      tab === "owned"
        ? MOCK_TEAMS.filter((t) => t.role === "owner")
        : MOCK_TEAMS;
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase();
    return base.filter((t) => t.name.toLowerCase().includes(q));
  }, [query, tab]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header
        avatarLabel="A"
        items={[
          { key: "inbox", label: "Inbox", icon: "inbox", badge: 24 },
          { key: "outbox", label: "Outbox", icon: "send" },
          { key: "favorites", label: "Favorites", icon: "heart-outline" },
          { key: "trash", label: "Trash", icon: "trash-can-outline" },
        ]}
        activeKey="inbox"
        onSelect={(k) => {
          switch (k) {
            case "inbox":
              router.push("/inbox");
              break;
            case "outbox":
              router.push("/outbox");
              break;
            default:
              router.push("/");
          }
        }}
      />

      {/* Content */}
      <View className="flex-1 px-4">
        {/* Search */}
        <View className="pt-3">
          <Searchbar
            placeholder="Search by team name"
            value={query}
            onChangeText={setQuery}
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Toggle + Actions  */}
        <View className="pt-3">
          <View className="flex-row items-center">
            {/* Toggle (trái) */}
            <View style={{ maxWidth: "70%", flexShrink: 1 }}>
              <SegmentedButtons
                value={tab}
                onValueChange={(v) => setTab(v as "joined" | "owned")}
                density="regular"
                buttons={[
                  {
                    value: "joined",
                    label: "JOINED",
                    style: [
                      {
                        borderRadius: 10,
                        borderWidth: 0,
                        marginLeft: 0,
                        elevation: 0,
                      },
                      tab === "joined" && { backgroundColor: ACTIVE },
                    ],
                    labelStyle: {
                      fontSize: LABEL_SIZE,
                      fontWeight: "700",
                      color: tab === "joined" ? "#fff" : "#000",
                    },
                  },
                  {
                    value: "owned",
                    label: "OWNED",
                    style: [
                      {
                        borderRadius: 10,
                        borderWidth: 0,
                        marginLeft: 3,
                        marginRight: 0,
                        elevation: 0,
                      },
                      tab === "owned" && { backgroundColor: ACTIVE },
                    ],
                    labelStyle: {
                      fontSize: LABEL_SIZE,
                      fontWeight: "700",
                      color: tab === "owned" ? "#fff" : "#000",
                    },
                  },
                ]}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: INACTIVE, // phần nền lộ ra ở giữa
                  borderRadius: 10,
                  padding: 5,
                  overflow: "hidden",
                }}
              />
            </View>

            {/* spacer giữa */}
            <View className="flex-1" />

            {/* actions (phải) */}
            <View className="flex-row items-center gap-2">
              <IconButton
                icon="qrcode-scan"
                mode="outlined"
                iconColor="#90717E"
                size={25}
                style={{ borderWidth: 0 }}
                onPress={() => router.push("/")}
              />
              <IconButton
                icon="plus"
                mode="contained"
                iconColor="#fff"
                size={25}
                style={{ borderRadius: 12, backgroundColor: "#90717E" }}
                onPress={() => router.push("/")}
              />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text className="px-4 mt-2 text-base font-bold">
          Team List ({teams.length})
        </Text>

        {/* List */}
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className="h-[1px] bg-black/5" />}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              onPress={() => router.push("/(team)/teamInfo")}
              left={() =>
                item.avatar ? (
                  <Avatar.Image size={40} source={{ uri: item.avatar }} />
                ) : (
                  <Avatar.Text size={40} label={item.name.charAt(0)} />
                )
              }
              right={() =>
                item.role === "owner" ? (
                  <IconButton
                    icon="key-outline"
                    iconColor="#90717E"
                    accessibilityLabel="Owner"
                    onPress={() => router.push("/")}
                  />
                ) : null
              }
              style={{ backgroundColor: "transparent" }}
            />
          )}
        />
      </View>
    </View>
  );
}
