import QuestionModal from "@/components/modal/question";
import SuccessModal from "@/components/modal/success";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import {
  Appbar,
  Avatar,
  List,
  Searchbar,
  TouchableRipple,
} from "react-native-paper";

type User = { id: string; name: string; email: string; avatar?: string };

const ACCENT = "#90717E";

const MOCK_USERS: User[] = [
  { id: "1", name: "Sienna", email: "abc@gmail.com" },
  { id: "2", name: "John Carter", email: "john@acme.com" },
  { id: "3", name: "Jenny Doe", email: "jenny@hello.io" },
  { id: "4", name: "Sienna Park", email: "sienna@studio.dev" },
];

export default function InviteUserScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_USERS;
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [query]);

  const openConfirm = (user: User) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const handleConfirmInvite = async () => {
    if (selectedUser) {
      console.log("Invite user: ", selectedUser);
      setConfirmOpen(false); // Đóng QuestionModal
      setSuccessOpen(true); // Mở SuccessModal
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false); // Đóng SuccessModal
    setSelectedUser(null); // Reset selectedUser sau khi đóng SuccessModal
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableRipple
      onPress={() => openConfirm(item)}
      rippleColor="rgba(0,0,0,0.06)"
    >
      <List.Item
        title={() => (
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F0C0D" }}>
            {item.name}
          </Text>
        )}
        description={() => (
          <Text style={{ fontSize: 13, color: "#8A8F93" }}>{item.email}</Text>
        )}
        left={() =>
          item.avatar ? (
            <Avatar.Image size={40} source={{ uri: item.avatar }} />
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
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Invite user"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
        <Appbar.Action
          icon={showSearch ? "close" : "magnify"}
          color="#fff"
          onPress={() => {
            setShowSearch((v) => !v);
            if (showSearch) setQuery("");
          }}
        />
      </Appbar.Header>

      {/* Searchbar */}
      {showSearch && (
        <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
          <Searchbar
            placeholder="Search by name or email"
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={{
              backgroundColor: "#fff",
              elevation: 0,
              borderRadius: 8,
            }}
            inputStyle={{ fontSize: 15 }}
            iconColor="#6B7280"
            clearIcon="close"
          />
        </View>
      )}

      {/* Content */}
      {filtered.length > 0 ? (
        <View style={{ margin: 12, backgroundColor: "#fff" }}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />
        </View>
      ) : (
        // Empty state
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: 24,
          }}
        >
          <Text style={{ color: "#DF3B27", fontSize: 15, textAlign: "center" }}>
            We couldn’t find anyone with the name{" "}
            <Text style={{ fontWeight: "700" }}>
              &quot;{query.trim()}&quot;
            </Text>
            …
          </Text>
        </View>
      )}

      {/* Question Modal for confirming invitation */}
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

      {/* Success Modal */}
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
