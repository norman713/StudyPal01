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

import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import TeamNameModal from "./components/teamName";

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

  //State
  const [query, setQuery] = useState("");
  const [bottomTab, setBottomTab] = useState<
    "me" | "team" | "notification" | "trash"
  >("team");
  const [modalCreateVisible, setCreateModalVisible] = useState(false); // This is the boolean state
  const [teamName, setTeamName] = useState("");

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

  //Handlers
  const handleSave = (name: string) => {
    setTeamName(name);
    setCreateModalVisible(false); // Close modal after saving
  };

  const handleCancel = () => {
    setCreateModalVisible(false); // Close modal on cancel
  };

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
            {/* Toggle (left) */}
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
                  backgroundColor: INACTIVE, // Part of the background
                  borderRadius: 10,
                  padding: 5,
                  overflow: "hidden",
                }}
              />
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Actions */}
            <IconButton
              icon="qrcode-scan"
              mode="outlined"
              iconColor="#90717E"
              size={25}
              style={{ borderWidth: 0 }}
              onPress={() => router.push("/")}
            />
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

      {/* Bottom */}
      <BottomBar
        activeTab={bottomTab}
        onTabPress={setBottomTab}
        onCenterPress={() => setCreateModalVisible(true)} // Show modal when center button is pressed
      />

      {/* TeamNameModal should receive modalCreateVisible (not setCreateModalVisible) */}
      <TeamNameModal
        visible={modalCreateVisible} // Pass the state here (boolean)
        onSave={handleSave}
        onCancel={handleCancel}
        initialName={teamName}
      />
    </View>
  );
}
