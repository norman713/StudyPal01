import inviteApi from "@/api/inviteApi";
import userApi from "@/api/userApi";
import QuestionModal from "@/components/modal/question";
import SuccessModal from "@/components/modal/success";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import {
  Appbar,
  Avatar,
  List,
  Searchbar,
  TouchableRipple,
} from "react-native-paper";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const ACCENT = "#90717E";

export default function InviteUserScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();

  // Try both
  const teamIdRaw = localParams.teamId || globalParams.teamId;
  const teamId = Array.isArray(teamIdRaw)
    ? teamIdRaw[0]
    : (teamIdRaw as string);

  console.log("InviteScreen LOCAL params:", JSON.stringify(localParams));
  console.log("InviteScreen GLOBAL params:", JSON.stringify(globalParams));
  console.log("InviteScreen Resolved teamId:", teamId);

  /* =======================
     Search state
  ======================= */
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     Invite flow state
  ======================= */
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    console.log("Invite screen teamId:", teamId);
  }, [teamId]);

  /* =========================================================
     🔍 SEARCH USERS (debounce 300ms)
  ========================================================= */
  useEffect(() => {
    const run = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const res = await userApi.searchUsers({
          keyword: query.trim(),
          size: 20,
        });
        setUsers(res.users ?? []);
      } catch (err) {
        console.error("[searchUsers] Error:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(run, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  /* =========================================================
     Invite handlers
  ========================================================= */
  const openConfirm = (user: User) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const handleConfirmInvite = async () => {
    // console.log("Confirm pressed");
    // Alert.alert("Debug", "Button Pressed"); // Uncomment if needed for extreme debugging

    console.log("[handleConfirmInvite] Selected user:", selectedUser);
    if (!selectedUser) return;

    console.log("[handleConfirmInvite] Team ID:", teamId);
    if (!teamId) {
      // DEBUG: Alert if teamId is missing
      Alert.alert("Error", "Team ID is missing. Cannot invite.");
      return;
    }

    try {
      // Don't close immediately, wait for API to ensure user knows something happened
      // setConfirmOpen(false);

      // Show loading indicator if possible, or just await
      const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
      console.log("[inviteUser] Inviting using teamId:", teamIdStr);

      if (!teamIdStr) {
        Alert.alert("Error", "Team ID invalid.");
        return;
      }

      await inviteApi.inviteUser({
        teamId: teamIdStr,
        inviteeId: selectedUser.id,
      });

      setConfirmOpen(false); // Close confirm modal only on success
      setTimeout(() => setSuccessOpen(true), 300); // Open success modal
    } catch (err: any) {
      console.error("[inviteUser] Error:", err);
      // Alert error to user
      Alert.alert(
        "Invitation Failed",
        err?.response?.data?.message || "Something went wrong."
      );
      setConfirmOpen(false); // Close anyway or keep open? keep open is better for retry, but maybe close for now.
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setSelectedUser(null);
  };

  /* =========================================================
     Render item
  ========================================================= */
  const renderItem = ({ item }: { item: User }) => (
    <TouchableRipple
      onPress={() => openConfirm(item)}
      rippleColor="rgba(0,0,0,0.06)"
    >
      <List.Item
        title={() => (
          <Text className="text-base font-bold text-[#0F0C0D]">
            {item.name}
          </Text>
        )}
        description={() => (
          <Text className="text-[13px] text-[#8A8F93]">{item.email}</Text>
        )}
        left={() =>
          item.avatarUrl ? (
            <Avatar.Image size={40} source={{ uri: item.avatarUrl }} />
          ) : (
            <Avatar.Text
              size={40}
              label={item.name?.[0]?.toUpperCase() || "U"}
              style={{ backgroundColor: "#E0E7FF" }}
              color="#334155"
            />
          )
        }
      />
    </TouchableRipple>
  );

  return (
    <View className="flex-1 bg-[#EFE7EA]">
      {/* =======================
          Header
      ======================= */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        {/* Back */}
        <Appbar.BackAction
          color="#fff"
          onPress={() => {
            if (showSearch) {
              setShowSearch(false);
              setQuery("");
              setUsers([]);
            } else {
              router.back();
            }
          }}
        />

        {/* Title OR Search */}
        {!showSearch ? (
          <Appbar.Content
            title="Invite user"
            titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
          />
        ) : (
          <Searchbar
            placeholder="Search by name or email"
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={{
              flex: 1,
              marginRight: 8,
              backgroundColor: "#fff",
              elevation: 0,
              borderRadius: 8,
            }}
            inputStyle={{ fontSize: 15 }}
            icon={() => null} // ❌ bỏ icon search
            clearIcon={() => null} // ❌ bỏ dấu X trong input
          />
        )}

        {/* Right action */}
        <Appbar.Action
          icon={showSearch ? "close" : "magnify"}
          color="#fff"
          onPress={() => {
            setShowSearch((v) => !v);
            if (showSearch) {
              setQuery("");
              setUsers([]);
            }
          }}
        />
      </Appbar.Header>

      {/* =======================
          Loading
      ======================= */}
      {loading && (
        <View className="pt-6 items-center">
          <Text className="text-[#6B7280]">Searching…</Text>
        </View>
      )}

      {/* =======================
          Result list
      ======================= */}
      {!loading && users.length > 0 && (
        <View className="m-3 bg-white rounded-lg">
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />
        </View>
      )}

      {/* =======================
          Empty search
      ======================= */}
      {!loading && query.trim() && users.length === 0 && (
        <View className="flex-1 items-center pt-6 px-6">
          <Text className="text-[#DF3B27] text-[15px] text-center">
            We couldn’t find anyone with the name{" "}
            <Text className="font-bold">“{query.trim()}”</Text>
          </Text>
        </View>
      )}

      {/* =======================
          Confirm modal
      ======================= */}
      <QuestionModal
        visible={confirmOpen}
        title="Invite user?"
        message={
          selectedUser
            ? `Do you want to invite ${selectedUser.name} (${selectedUser.email}) to your team?`
            : ""
        }
        cancelText="Cancel"
        confirmText="Confirm"
        onConfirm={handleConfirmInvite}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* =======================
          Success modal
      ======================= */}
      <SuccessModal
        visible={successOpen}
        title="Success"
        message={`You have successfully invited ${selectedUser?.name} to the team.`}
        confirmText="OK"
        onConfirm={handleSuccessClose}
      />
    </View>
  );
}
