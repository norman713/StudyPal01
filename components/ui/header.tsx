import { useUser } from "@/context/userContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Drawer, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "react-native";


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
  onAvatarPress?: () => void;

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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const tx = useRef(new Animated.Value(-drawerWidth)).current;
  const { user } = useUser();

  useEffect(() => {
    Animated.timing(tx, {
      toValue: open ? 0 : -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [open, drawerWidth]);

  const handleProfile = () => {
    router.push("/(team)/profile/profile");
    console.log(user);
  }

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
        <Pressable
          onPress={() => handleProfile()}
          hitSlop={10}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            backgroundColor: "#6750A4",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
              {user?.name?.[0] ?? "?"}
            </Text>
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
