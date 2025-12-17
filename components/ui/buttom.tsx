import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const bottomBg = require("../../assets/images/BottomNavbar.png");
const addButtonImg = require("../../assets/images/Addbutton.png");

type Tab = "me" | "team" | "notification" | "trash";

interface BottomBarProps {
  activeTab: Tab;
  onTabPress: (tab: Tab) => void;
  onCenterPress?: () => void;
}

export default function BottomBar({
  activeTab,
  onTabPress,
  onCenterPress,
}: BottomBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  /* =======================
     RESPONSIVE CALC
  ======================= */
  const isSmallScreen = width < 360;

  const TAB_BAR_HEIGHT = isSmallScreen ? 62 : 70;

  // ⭐ Smaller center button
  const CENTER_BUTTON_SIZE = isSmallScreen ? 44 : 55;

  // ⭐ Space between button & notch
  const GAP_FROM_NOTCH = isSmallScreen ? 8 : 16;

  // How much the button floats up
  const CENTER_OFFSET = CENTER_BUTTON_SIZE / 2 + GAP_FROM_NOTCH;

  const ICON_COLOR_ACTIVE = "#90717E";
  const ICON_COLOR_INACTIVE = "#7E9181";

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        zIndex: 10,
      }}
    >
      <ImageBackground
        source={bottomBg}
        resizeMode="stretch"
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: width * 0.08,
            paddingBottom: 10,
          }}
        >
          {/* LEFT GROUP */}
          <View style={{ flexDirection: "row", gap: width * 0.08 }}>
            <TabItem
              icon="account-outline"
              label="Me"
              active={activeTab === "me"}
              onPress={() => onTabPress("me")}
              activeColor={ICON_COLOR_ACTIVE}
              inactiveColor={ICON_COLOR_INACTIVE}
            />

            <TabItem
              icon="account-group-outline"
              label="Team"
              active={activeTab === "team"}
              onPress={() => onTabPress("team")}
              activeColor={ICON_COLOR_ACTIVE}
              inactiveColor={ICON_COLOR_INACTIVE}
            />
          </View>

          {/* RIGHT GROUP */}
          <View style={{ flexDirection: "row", gap: width * 0.08 }}>
            <TabItem
              icon="bell-outline"
              label="Notification"
              active={activeTab === "notification"}
              onPress={() => onTabPress("notification")}
              activeColor={ICON_COLOR_ACTIVE}
              inactiveColor={ICON_COLOR_INACTIVE}
            />

            <TabItem
              icon="trash-can-outline"
              label="Trash"
              active={activeTab === "trash"}
              onPress={() => onTabPress("trash")}
              activeColor={ICON_COLOR_ACTIVE}
              inactiveColor={ICON_COLOR_INACTIVE}
            />
          </View>

          {/* ⭐ CENTER BUTTON */}
          <TouchableOpacity
            onPress={onCenterPress}
            activeOpacity={0.85}
            style={{
              position: "absolute",
              top: -CENTER_OFFSET,
              left: width / 2 - CENTER_BUTTON_SIZE / 2,
              width: CENTER_BUTTON_SIZE,
              height: CENTER_BUTTON_SIZE,
              borderRadius: CENTER_BUTTON_SIZE / 2,
              zIndex: 20,
            }}
          >
            <Image
              source={addButtonImg}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

/* =======================
   TAB ITEM
======================= */
function TabItem({
  icon,
  label,
  active,
  onPress,
  activeColor,
  inactiveColor,
}: {
  icon: any;
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: "center" }}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={active ? activeColor : inactiveColor}
      />
      <Text
        style={{
          fontSize: 12,
          marginTop: 2,
          fontFamily: "Poppins-Regular",
          color: active ? activeColor : inactiveColor,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
