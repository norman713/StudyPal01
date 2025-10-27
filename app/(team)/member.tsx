import memberApi from "@/api/memberApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";
import {
  Appbar,
  Avatar,
  IconButton,
  List,
  Menu,
  Searchbar,
  Text,
} from "react-native-paper";
import UpdateRoleModal from "./components/updateRole";

// ================== TYPES ==================
type Role = "OWNER" | "ADMIN" | "MEMBER";

type User = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: Role;
};

// ================== CONSTANTS ==================
const ACCENT = "#90717E";

// ================== SUB COMPONENTS ==================
const RoleBadge = React.memo(({ role }: { role: Role }) => (
  <Text style={{ fontSize: 14, marginTop: 2, color: "#92AAA5" }}>{role}</Text>
));

const canShowKebab = (row: User, currentRole: Role): boolean => {
  if (currentRole === "OWNER") return true;
  if (currentRole === "ADMIN") return row.role === "MEMBER";
  return false;
};

const getMenuItems = (
  row: User,
  closeMenu: () => void,
  onOpenUpdateRole: (user: User) => void,
  router: ReturnType<typeof useRouter>,
  currentRole: Role
) => {
  const handleViewProfile = () => {
    closeMenu();
    router.push({ pathname: "/(team)/profile/[id]", params: { id: row.id } });
  };

  const handleRemove = () => {
    closeMenu();
    console.log("Remove", row.id);
  };

  const handleUpdateRole = () => {
    closeMenu();
    onOpenUpdateRole(row);
  };

  if (currentRole === "OWNER") {
    return (
      <>
        <Menu.Item title="View profile" onPress={handleViewProfile} />
        <Menu.Item title="Update role" onPress={handleUpdateRole} />
        <Menu.Item title="Remove" onPress={handleRemove} />
      </>
    );
  }

  return (
    <>
      <Menu.Item title="View profile" onPress={handleViewProfile} />
      <Menu.Item title="Remove" onPress={handleRemove} />
    </>
  );
};

const MemberRow = React.memo(
  ({
    item,
    openMenuForId,
    setOpenMenuForId,
    router,
    onOpenUpdateRole,
    currentRole,
  }: {
    item: User;
    openMenuForId: string | null;
    setOpenMenuForId: React.Dispatch<React.SetStateAction<string | null>>;
    router: ReturnType<typeof useRouter>;
    onOpenUpdateRole: (user: User) => void;
    currentRole: Role;
  }) => {
    const showDots = canShowKebab(item, currentRole);
    const isMenuOpen = openMenuForId === item.id;

    const handleToggleMenu = useCallback(() => {
      setOpenMenuForId((v) => (v === item.id ? null : item.id));
    }, [item.id, setOpenMenuForId]);

    const handleDismiss = useCallback(() => {
      setOpenMenuForId(null);
    }, [setOpenMenuForId]);

    return (
      <List.Item
        style={{ paddingRight: 8 }}
        left={() =>
          item.avatar ? (
            <Avatar.Image size={40} source={{ uri: item.avatar }} />
          ) : (
            <Avatar.Text
              size={40}
              label={item.name[0]?.toUpperCase() ?? "U"}
              style={{ backgroundColor: "#D3E7E1" }}
              color="#0F0C0D"
            />
          )
        }
        title={() => (
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F0C0D" }}>
              {item.name}
            </Text>
            <RoleBadge role={item.role} />
          </View>
        )}
        right={() =>
          showDots ? (
            <Menu
              visible={isMenuOpen}
              onDismiss={handleDismiss}
              anchor={
                <IconButton icon="dots-horizontal" onPress={handleToggleMenu} />
              }
            >
              {getMenuItems(
                item,
                handleDismiss,
                onOpenUpdateRole,
                router,
                currentRole
              )}
            </Menu>
          ) : null
        }
        description={undefined}
      />
    );
  }
);

// ================== MAIN COMPONENT ==================
export default function TeamMembersScreen() {
  const router = useRouter();
  const { teamId, number, role } = useLocalSearchParams<{
    teamId: string;
    number: string;
    role: Role;
  }>();

  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false); // 🔹 dùng biến này thay vì showSearch
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const currentRole = role as Role;

  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;
      try {
        setLoading(true);
        const res = await memberApi.getAll(teamId);
        setMembers(
          res.members.map((m) => ({
            id: m.userId,
            name: m.name,
            avatar: m.avatarUrl,
            email: "",
            role: m.role,
          }))
        );
      } catch (err) {
        console.error("❌ Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [teamId]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
    );
  }, [members, query]);

  const handleInvite = () => {
    router.push("/(team)/invite");
  };

  const onOpenUpdateRole = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleSaveRole = async (newRole: Role) => {
    if (!teamId || !selectedUser) {
      console.warn("⚠️ Missing teamId or selectedUser", {
        teamId,
        selectedUser,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await memberApi.updateRole(
        String(teamId),
        String(selectedUser.id),
        newRole
      );

      // ✅ Update UI ngay
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedUser.id ? { ...m, role: newRole } : m
        )
      );

      Alert.alert("Success", `Role updated to ${newRole}`);
    } catch (err: any) {
      let message = "Failed to update role. Please try again later.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }

      Alert.alert("Error", message);

      // 🔸 Đóng modal luôn khi có lỗi
      setShowRoleModal(false);
    } finally {
      setLoading(false);
      // 🔸 Đảm bảo modal đóng sau khi xử lý xong
      setShowRoleModal(false);
    }
  };

  const handleCancel = () => {
    setShowRoleModal(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <MemberRow
        item={item}
        openMenuForId={openMenuForId}
        setOpenMenuForId={setOpenMenuForId}
        router={router}
        onOpenUpdateRole={onOpenUpdateRole}
        currentRole={currentRole}
      />
    ),
    [openMenuForId, router, currentRole]
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EFE7EA]">
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={{ color: "#555", marginTop: 8 }}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#EFE7EA]">
      {searchMode ? (
        <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Searchbar
              placeholder="Input text"
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 5,
              }}
              inputStyle={{
                fontSize: 15,
                paddingVertical: 0,
                textAlignVertical: "center",
              }}
              iconColor="#6B7280"
              clearIcon="close"
              onIconPress={() => setQuery("")}
              right={() => (
                <IconButton
                  icon="close"
                  size={20}
                  iconColor="#6B7280"
                  style={{ marginRight: 4 }}
                  onPress={() => {
                    setSearchMode(false);
                    setQuery("");
                  }}
                />
              )}
            />
          </View>
        </Appbar.Header>
      ) : (
        // 🔹 Mặc định hiển thị AppBar
        <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
          <Appbar.BackAction color="#fff" onPress={() => router.back()} />
          <Appbar.Content
            title={`Team members (${number})`}
            titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
          />
          {currentRole !== "MEMBER" && (
            <Appbar.Action
              icon="account-plus"
              color="#fff"
              onPress={handleInvite}
            />
          )}
          <Appbar.Action
            icon="magnify"
            color="#fff"
            onPress={() => setSearchMode(true)}
          />
        </Appbar.Header>
      )}

      {/* Danh sách thành viên */}
      <View style={{ margin: 12, padding: 10, backgroundColor: "#fff" }}>
        <Text
          style={{
            paddingVertical: 8,
            color: "#0F0C0D",
            fontSize: 18,
            fontFamily: "PoppinsSemiBold",
          }}
        >
          Member List
        </Text>

        <FlatList
          data={filteredMembers}
          keyExtractor={(u) => u.id}
          renderItem={renderItem}
        />
      </View>

      {/* Update Role Modal */}
      {selectedUser && (
        <UpdateRoleModal
          visible={showRoleModal}
          userName={selectedUser.name}
          userAvatar={selectedUser.avatar}
          currentRole={selectedUser.role}
          onSave={handleSaveRole}
          onCancel={handleCancel}
        />
      )}
    </View>
  );
}
