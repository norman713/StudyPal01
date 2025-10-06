import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
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
type Role = "Owner" | "Admin" | "Member";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
};

// ================== CONSTANTS ==================
const ACCENT = "#90717E";

const USERS: User[] = [
  {
    id: "1",
    name: "Sienna",
    email: "sienna@studio.dev",
    avatar:
      "https://vn.portal-pokemon.com/play/resources/pokedex/img/pm/c0cb468a31cb0b1cd34b6ad4c6c4c02de1d4c595.png",
    role: "Owner",
  },
  {
    id: "2",
    name: "Liam",
    email: "admin@studio.dev",
    avatar:
      "https://www.pngplay.com/wp-content/uploads/12/Pikachu-Meme-Transparent-Free-PNG.png",
    role: "Admin",
  },
  {
    id: "3",
    name: "Emma",
    email: "mem1@studio.dev",
    avatar:
      "https://cdn.pixabay.com/photo/2021/12/26/17/31/pokemon-6895600_640.png",
    role: "Member",
  },
  {
    id: "4",
    name: "Noah",
    email: "mem2@studio.dev",
    avatar:
      "https://www.pngplay.com/wp-content/uploads/12/Pikachu-Meme-Transparent-Free-PNG.png",
    role: "Member",
  },
  {
    id: "5",
    name: "Olivia",
    email: "mem3@studio.dev",
    avatar:
      "https://vn.portal-pokemon.com/play/resources/pokedex/img/pm/8bb97c22409c5c6d259c29bd36af86911b112716.png",
    role: "Member",
  },
  {
    id: "6",
    name: "Ava",
    email: "mem4@studio.dev",
    avatar:
      "https://www.pngplay.com/wp-content/uploads/12/Pikachu-Meme-Transparent-Free-PNG.png",
    role: "Member",
  },
];

const CURRENT_USER_ROLE = "Owner" as Role;

// ================== SUB COMPONENTS ==================
const RoleBadge = React.memo(({ role }: { role: Role }) => (
  <Text style={{ fontSize: 14, marginTop: 2, color: "#92AAA5" }}>{role}</Text>
));

// Check show menu
const canShowKebab = (row: User): boolean => {
  if (CURRENT_USER_ROLE === "Owner") return true;
  if (CURRENT_USER_ROLE === "Admin") return row.role === "Member";
  return false;
};

const getMenuItems = (
  row: User,
  closeMenu: () => void,
  onOpenUpdateRole: (user: User) => void,
  router: ReturnType<typeof useRouter>
) => {
  const handleViewProfile = () => {
    closeMenu();
    router.push("/");
  };

  const handleRemove = () => {
    closeMenu();
    console.log("Remove", row.id);
  };

  const handleUpdateRole = () => {
    closeMenu();
    onOpenUpdateRole(row);
  };

  if (CURRENT_USER_ROLE === "Owner") {
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
  }: {
    item: User;
    openMenuForId: string | null;
    setOpenMenuForId: React.Dispatch<React.SetStateAction<string | null>>;
    router: ReturnType<typeof useRouter>;
    onOpenUpdateRole: (user: User) => void;
  }) => {
    const showDots = canShowKebab(item);
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
              {getMenuItems(item, handleDismiss, onOpenUpdateRole, router)}
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
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleSearch = useCallback(() => {
    setShowSearch((v) => !v);
    if (showSearch) setQuery("");
  }, [showSearch]);

  const handleInvite = () => {
    router.push("/(team)/invite");
  };

  const onOpenUpdateRole = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleSaveRole = (newRole: Role) => {
    console.log("Updated role:", selectedUser?.name, "→", newRole);
    setShowRoleModal(false);
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
      />
    ),
    [openMenuForId, router]
  );

  return (
    <View className="flex-1 bg-[#EFE7EA]">
      {/* App bar */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title={`Team members (${USERS.length})`}
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
        {CURRENT_USER_ROLE !== "Member" && (
          <Appbar.Action
            icon="account-plus"
            color="#fff"
            onPress={handleInvite}
          />
        )}
        <Appbar.Action
          icon={showSearch ? "close" : "magnify"}
          color="#fff"
          onPress={toggleSearch}
        />
      </Appbar.Header>

      {showSearch && (
        <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
          <Searchbar
            placeholder="Search members"
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
          data={members}
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
