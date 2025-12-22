import userApi, { UserSummary } from "@/api/userApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* =======================
   TYPES
======================= */

type Scope = "me" | "team";
type MenuKey = "task" | "document" | "session" | "statistic";

/* =======================
   CONSTANT
======================= */

const screenWidth = Dimensions.get("window").width;
const drawerWidth = Math.min(screenWidth * 0.5, 320);

/* =======================
   COMPONENT
======================= */

export default function Header({ scope = "me" }: { scope?: Scope }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserSummary | null>(null);

  /* =======================
     FETCH USER
  ======================= */

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchUser = async () => {
        try {
          const data = await userApi.getSummary();
          if (!cancelled) setUser(data);
        } catch {}
      };

      fetchUser();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  /* =======================
     ACTIVE CHECK
  ======================= */

  const isActive = (key: MenuKey) => {
    // ===== TASK =====
    if (key === "task") {
      if (scope === "me") {
        return pathname === "/";
      }
      return pathname === "/team/task";
    }

    // ===== SESSION (LUÔN DÙNG ME) =====
    if (key === "session") {
      return pathname === "/session" || pathname.startsWith("/session/");
    }

    // ===== DOCUMENT & STATISTIC (THEO SCOPE) =====
    if (key === "document" || key === "statistic") {
      if (scope === "me") {
        return pathname === `/${key}` || pathname.startsWith(`/${key}/`);
      }

      // team
      return (
        pathname === `/team/${key}` || pathname.startsWith(`/team/${key}/`)
      );
    }

    return false;
  };

  /* =======================
     ROUTE
  ======================= */

  const go = (key: MenuKey) => {
    setOpen(false);

    if (scope === "me") {
      if (key === "task") router.push("/(me)");
      if (key === "document") router.push("/(me)/document");
      if (key === "session") router.push("/(me)/session");
      if (key === "statistic") router.push("/(me)/statistic");
    } else {
      if (key === "task") router.push("/(team)/task");
      if (key === "document") router.push("/(team)/document");
      if (key === "session") router.push("/(me)/session");
      if (key === "statistic") router.push("/(team)/statistic");
    }
  };

  /* =======================
     MENU ITEM
  ======================= */

  const MenuItem = ({
    label,
    icon,
    active,
    onPress,
  }: {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.item, active && styles.itemActive]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={active ? "#2E2E2E" : "#6A6A6A"}
      />

      {/* 👇 QUAN TRỌNG */}
      <Text
        style={[styles.label, active && styles.labelActive]}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ backgroundColor: "#90717E", paddingTop: insets.top }}>
      {/* ================= TOP BAR ================= */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setOpen(true)} hitSlop={10}>
          <Ionicons name="menu" size={22} color="#FFF" />
        </Pressable>

        {/* Avatar */}
        <Pressable onPress={() => router.push("/(me)/profile")} hitSlop={10}>
          {user?.avatarUrl ? (
            <Avatar.Image size={32} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Text
              size={32}
              label={user?.name?.charAt(0)?.toUpperCase() ?? "A"}
              style={{ backgroundColor: "#6B4EFF" }}
              labelStyle={{ color: "#FFF", fontWeight: "700" }}
            />
          )}
        </Pressable>
      </View>

      {/* ================= SIDE MENU ================= */}
      <Portal>
        {open && (
          <View style={styles.overlay}>
            <View style={[styles.drawer, { paddingTop: insets.top + 12 }]}>
              <Text style={styles.title}>StudyPal</Text>

              <MenuItem
                label="Task"
                icon="target"
                active={isActive("task")}
                onPress={() => go("task")}
              />

              <MenuItem
                label="Document"
                icon="file-document-outline"
                active={isActive("document")}
                onPress={() => go("document")}
              />

              <MenuItem
                label="Session"
                icon="clock-outline"
                active={isActive("session")}
                onPress={() => go("session")}
              />

              <MenuItem
                label="Statistic"
                icon="chart-bar"
                active={isActive("statistic")}
                onPress={() => go("statistic")}
              />
            </View>

            {/* click outside to close */}
            <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          </View>
        )}
      </Portal>
    </View>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  topBar: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    width: drawerWidth,
    backgroundColor: "#F5EEF5",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  itemActive: {
    backgroundColor: "#E6E3E7",
  },
  label: {
    fontSize: 14,
    color: "#6A6A6A",
    flex: 1,
  },
  labelActive: {
    fontWeight: "700",
    color: "#2E2E2E",
  },
});
