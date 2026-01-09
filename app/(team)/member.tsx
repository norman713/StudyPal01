import memberApi from "@/api/memberApi";
import ErrorModal from "@/components/modal/error";
import QuestionModal from "@/components/modal/question";
import SuccessModal from "@/components/modal/success";
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
  if (currentRole === "OWNER") return true; // Owner can manage everyone
  if (currentRole === "ADMIN") return row.role === "MEMBER"; // Admin manages Members only
  return false; // Member manages no one
};

const getMenuItems = (
  row: User,
  closeMenu: () => void,
  onOpenUpdateRole: (user: User) => void,
  router: ReturnType<typeof useRouter>,
  currentRole: Role,
  onRemove: (userId: string) => void
) => {
  const handleViewProfile = () => {
    closeMenu();
    router.push({ pathname: "/(team)/profile/[id]", params: { id: row.id } });
  };

  const handleRemove = () => {
    closeMenu();
    // Call the passed onRemove handler
    onRemove(row.id);
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
        <Menu.Item
          title="Remove from team"
          onPress={handleRemove}
          titleStyle={{ color: "#FF5F57" }}
        />
      </>
    );
  }

  // Admin view (implied by usage logic: only sees menu for Members)
  return (
    <>
      <Menu.Item title="View profile" onPress={handleViewProfile} />
      <Menu.Item
        title="Remove from team"
        onPress={handleRemove}
        titleStyle={{ color: "#FF5F57" }}
      />
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
    onRemove,
  }: {
    item: User;
    openMenuForId: string | null;
    setOpenMenuForId: React.Dispatch<React.SetStateAction<string | null>>;
    router: ReturnType<typeof useRouter>;
    onOpenUpdateRole: (user: User) => void;
    currentRole: Role;
    onRemove: (userId: string) => void;
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
              style={{ backgroundColor: "#6B4EFF" }}
              color="#fff"
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
                currentRole,
                onRemove
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

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
    router.push(`/(team)/invite?teamId=${teamId}`);
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

  // const handleDeleteMember = async (userId: string) => {
  //   if (!teamId) return;

  //   // Optional: Add confirmation dialog here
  //   Alert.alert(
  //     "Remove Member",
  //     "Are you sure you want to remove this member?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Remove",
  //         style: "destructive",
  //         onPress: async () => {
  //           try {
  //             setLoading(true);
  //             await memberApi.removeMember(teamId, userId);
  //             setMembers((prev) => prev.filter((m) => m.id !== userId));
  //             Alert.alert("Success", "Member removed successfully");
  //           } catch (err: any) {
  //             console.error("Remove member error:", err);
  //             Alert.alert("Error", "Failed to remove member");
  //           } finally {
  //             setLoading(false);
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleDeleteMember = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmVisible(true);
  };

  const confirmRemoveMember = async () => {
    if (!teamId || !selectedUserId) return;

    try {
      setLoading(true);
      setConfirmVisible(false);

      await memberApi.removeMember(teamId, selectedUserId);

      setMembers((prev) => prev.filter((m) => m.id !== selectedUserId));
      setSuccessVisible(true);
    } catch (err: any) {
      console.error("Remove member error:", err);
      setErrorMessage(
        err?.response?.data?.message || "Failed to remove member"
      );
      setErrorVisible(true);
    } finally {
      setLoading(false);
      setSelectedUserId(null);
    }
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
        onRemove={handleDeleteMember}
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
            title={`Team members (${members.length})`}
            titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
          />

          {/* Add Member Icon: Show ONLY if role is ADMIN or OWNER */}
          {(currentRole === "ADMIN" || currentRole === "OWNER") && (
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

      <QuestionModal
        visible={confirmVisible}
        title="Remove member?"
        message="Are you sure you want to remove this member from the team?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          setConfirmVisible(false);
          setSelectedUserId(null);
        }}
      />
      <SuccessModal
        visible={successVisible}
        title="Success!"
        message="Member removed successfully."
        confirmText="OK"
        onConfirm={() => setSuccessVisible(false)}
      />
      <ErrorModal
        visible={errorVisible}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
