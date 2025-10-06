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
  { id: "1", name: "Sienna", email: "sienna@studio.dev", role: "Owner" },
  { id: "2", name: "Sienna", email: "admin@studio.dev", role: "Admin" },
  { id: "3", name: "Sienna", email: "mem1@studio.dev", role: "Member" },
  { id: "4", name: "Sienna", email: "mem2@studio.dev", role: "Member" },
  { id: "5", name: "Sienna", email: "mem3@studio.dev", role: "Member" },
  { id: "6", name: "Sienna", email: "mem4@studio.dev", role: "Member" },
];

const CURRENT_USER_ROLE = "Admin" as Role;

// ================== SUB COMPONENTS ==================
const RoleBadge = React.memo(({ role }: { role: Role }) => (
  <Text style={{ fontSize: 14, marginTop: 2, color: "#92AAA5" }}>{role}</Text>
));

// Check show menu "..."
const canShowKebab = (row: User): boolean => {
  if (CURRENT_USER_ROLE === "Owner") return true;
  if (CURRENT_USER_ROLE === "Admin") return row.role === "Member";
  return false;
};

const getMenuItems = (
  row: User,
  closeMenu: () => void,
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
    console.log("Update role", row.id);
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
  }: {
    item: User;
    openMenuForId: string | null;
    setOpenMenuForId: React.Dispatch<React.SetStateAction<string | null>>;
    router: ReturnType<typeof useRouter>;
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
              {getMenuItems(item, handleDismiss, router)}
            </Menu>
          ) : null
        }
        description={undefined}
        onPress={() => {}}
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

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <MemberRow
        item={item}
        openMenuForId={openMenuForId}
        setOpenMenuForId={setOpenMenuForId}
        router={router}
      />
    ),
    [openMenuForId, router]
  );

  const handleInvite = () => {
    router.push("/(team)/invite");
  };
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
    </View>
  );
}
