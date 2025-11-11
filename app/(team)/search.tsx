import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import React, { useEffect, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  Avatar,
  IconButton,
  Searchbar,
  SegmentedButtons,
  Text,
} from "react-native-paper";

import teamApi, { Team } from "@/api/teamApi";
import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateModal from "./components/createTeam";
import JoinTeamModal from "./components/joinTeam";

/* ======================================================= */
export default function Search() {
  const router = useRouter();

  //CONST
  const insets = useSafeAreaInsets();
  const BAR_H = 80;
  const EXTRA = 16;

  const ACTIVE = "#90717E";
  const INACTIVE = "#E3DBDF";
  const LABEL_SIZE = 11;
  const nav = useNavigation();

  //State
  const [query, setQuery] = useState("");
  const [bottomTab, setBottomTab] = useState<
    "me" | "team" | "notification" | "trash"
  >("team");
  const [modalCreateVisible, setCreateModalVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [tab, setTab] = useState<"joined" | "owned">("joined");

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching teams for tab:", tab);
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await teamApi.getAll(tab === "joined" ? "JOINED" : "OWNED");
        console.log("Response:", res);
        setTeams(res.teams ?? []);
      } catch (err) {
        console.error("[fetchTeams] Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [tab]);

  //Handlers
  const handleSave = async (name: string, description: string) => {
    try {
      setLoading(true);
      const newTeam = await teamApi.create(name, description);
      console.log("Created:", newTeam);
      setCreateModalVisible(false);

      // Reload team list
      const res = await teamApi.getAll(tab === "joined" ? "JOINED" : "OWNED");
      setTeams(res.teams ?? []);
    } catch (err) {
      console.error("[handleSave] Failed to create team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCreateModalVisible(false);
  };

  const handleJoin = () => {
    console.log("Joined team!");
  };
  /* ==========================================================
     🔍 SEARCH (debounce 300ms)
  ========================================================== */
  useEffect(() => {
    if (query.trim().length === 0) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await teamApi.search(
          tab === "joined" ? "JOINED" : "OWNED",
          query.trim()
        );
        setTeams(res.teams ?? []);
      } catch (err) {
        console.error("[searchTeams] Error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, tab]);

  return (
    <View className="flex-1 bg-[#F2EFF0] ">
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
      <View className="flex-1 bg-white mx-3 my-3 mb-60">
        {/* Content */}
        <View className="flex-1 px-4 my-2">
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
            contentContainerStyle={{ marginBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(team)/teamInfo",
                    params: { id: item.id },
                  })
                }
                className="flex-row items-center justify-between px-4 py-3"
              >
                {/* Avatar + Name */}
                <View className="flex-row items-center">
                  {item.avatarUrl ? (
                    <Avatar.Image size={40} source={{ uri: item.avatarUrl }} />
                  ) : (
                    <Avatar.Text size={40} label={item.name.charAt(0)} />
                  )}

                  <Text className="ml-3 text-xl font-semibold text-black ">
                    {item.name}
                  </Text>
                </View>

                {/* Icon owner */}
                {item.owner && (
                  <FontAwesome5 name="key" size={20} color="#90717E" />
                )}
              </Pressable>
            )}
          />
        </View>
      </View>

      {/* Bottom */}
      <BottomBar
        activeTab={bottomTab}
        onTabPress={(tab) => {
          setBottomTab(tab);

          switch (tab) {
            case "me":
              router.push("/");
              break;

            case "team":
              router.push("/(team)/search");
              break;

            case "notification":
              router.push("/(noti)");
              break;

            case "trash":
              router.push("/");
              break;

            default:
              break;
          }
        }}
        onCenterPress={() => setCreateModalVisible(true)}
      />

      {/* TeamNameModal should receive modalCreateVisible (not setCreateModalVisible) */}
      <CreateModal
        visible={modalCreateVisible}
        onSave={handleSave}
        onCancel={handleCancel}
        initialName={teamName}
        initialDescription={teamDescription}
      />

      <JoinTeamModal
        visible={joinVisible}
        avatar="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
        teamName="This is team name"
        description="This is team information ahihi"
        ownerName="Nguyetlun115"
        ownerAvatar="https://i.pravatar.cc/100?img=5"
        membersCount={30}
        onJoin={() => {
          console.log("Joined team!");
          setJoinVisible(false);
        }}
        onClose={() => setJoinVisible(false)}
      />
    </View>
  );
}
