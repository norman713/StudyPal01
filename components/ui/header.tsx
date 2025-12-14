import userApi, { UserSummary } from "@/api/userApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar, Drawer, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Item = { key: string; label: string; icon: string; badge?: number };

/**
 * Responsive
 */
const screenWidth = Dimensions.get("window").width;
const responsiveWidth = Math.min(screenWidth * 0.5, 320);

type Props = {
  // Header
  bg?: string; // background color
  tint?: string; // icon/text color
  avatarLabel?: string; // right circle text

  // Menu
  items: Item[];
  activeKey?: string;
  onSelect: (key: string) => void;
  drawerWidth?: number;
};

export default function Header({
  bg = "#90717E",
  tint = "#FFFFFF",
  avatarLabel = "A",

  items,
  activeKey,
  onSelect,
  drawerWidth = responsiveWidth,
}: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const tx = useRef(new Animated.Value(-drawerWidth)).current;

  const [user, setUser] = useState<UserSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fetchData = async () => {
        try {
          // Dùng summary để lấy info nhanh cho header (không cần parse token)
          const data = await userApi.getSummary();
          if (!cancelled) {
            setUser(data);
          }
        } catch (e) {
          // silent error
        }
      };
      fetchData();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  useEffect(() => {
    Animated.timing(tx, {
      toValue: open ? 0 : -drawerWidth,
      duration: 220,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [open, drawerWidth]);

  return (
    <View style={{ backgroundColor: bg, paddingTop: insets.top }}>
      {/* TOP BAR */}
      <View
        style={{
          height: 48,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* left: hamburger */}
        <Pressable onPress={() => setOpen(true)} hitSlop={10}>
          <Ionicons name="menu" size={22} color={tint} />
        </Pressable>

        {/* right: round avatar with letter */}
        <Pressable onPress={() => router.push("/(me)/profile")} hitSlop={10}>
          {user?.avatarUrl ? (
            <Avatar.Image size={32} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Text
              size={32}
              label={
                user?.name ? user.name.charAt(0).toUpperCase() : avatarLabel
              }
              style={{ backgroundColor: "#6B4EFF" }}
              labelStyle={{
                color: "#FFFFFF",
                fontWeight: "700",
                lineHeight: 18,
              }} // adjust lineHeight for center
            />
          )}
        </Pressable>
      </View>

      {/* SIDEBAR */}
      <Portal>
        {open && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.3)", flexDirection: "row" },
            ]}
          >
            {/* Drawer panel */}
            <Animated.View
              style={{
                width: drawerWidth,
                backgroundColor: "#F5EEF5",
                transform: [{ translateX: tx }],
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                paddingTop: insets.top + 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  paddingHorizontal: 16,
                  marginBottom: 12,
                }}
              >
                StudyPal
              </Text>

              <Text
                style={{
                  color: "#6A6A6A",
                  fontSize: 12,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                Mail
              </Text>

              <Drawer.Section style={{ backgroundColor: "transparent" }}>
                {items.map((it) => {
                  const active = activeKey === it.key;
                  return (
                    <Drawer.Item
                      key={it.key}
                      icon={() => (
                        <MaterialCommunityIcons
                          name={it.icon as any}
                          size={20}
                          color="#6A4E5A"
                        />
                      )}
                      label={it.label}
                      style={{
                        marginHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: active ? "#E8DDE4" : "transparent",
                      }}
                      onPress={() => {
                        setOpen(false);
                        onSelect(it.key);
                      }}
                      right={() =>
                        typeof it.badge === "number" ? (
                          <View
                            style={{
                              minWidth: 28,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: "#E8DDE4",
                              alignItems: "center",
                              justifyContent: "center",
                              paddingHorizontal: 8,
                              marginRight: 8,
                            }}
                          >
                            <Text
                              style={{ color: "#6A4E5A", fontWeight: "700" }}
                            >
                              {it.badge}
                            </Text>
                          </View>
                        ) : null
                      }
                    />
                  );
                })}
              </Drawer.Section>
            </Animated.View>

            {/* Overlay click to cancel */}
            <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          </View>
        )}
      </Portal>
    </View>
  );
}
