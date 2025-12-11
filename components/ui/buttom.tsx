import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const bottomBg = require("../../assets/images/BottomNavbar.png");
const addButtonImg = require("../../assets/images/Addbutton.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Tab = "me" | "team" | "notification" | "trash";

interface BottomBarProps {
  activeTab: Tab;
  onTabPress: (tab: Tab) => void;
  onCenterPress?: () => void;
}

const CENTER_BUTTON_SIZE = 60;
const CENTER_OFFSET = 45;

export default function BottomBar({
  activeTab,
  onTabPress,
  onCenterPress,
}: BottomBarProps) {
  return (
    <View style={styles.wrapper}>
      <ImageBackground source={bottomBg} style={styles.bg} resizeMode="stretch">
        <View style={styles.container}>
          <View style={styles.group}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => onTabPress("me")}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={activeTab === "me" ? "#90717E" : "#7E9181"}
              />
              <Text
                style={[
                  styles.label,
                  { color: activeTab === "me" ? "#90717E" : "#7E9181" },
                ]}
              >
                Me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => onTabPress("team")}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color={activeTab === "team" ? "#90717E" : "#7E9181"}
              />
              <Text
                style={[
                  styles.label,
                  { color: activeTab === "team" ? "#90717E" : "#7E9181" },
                ]}
              >
                Team
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.group}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => onTabPress("notification")}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={activeTab === "notification" ? "#90717E" : "#7E9181"}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: activeTab === "notification" ? "#90717E" : "#7E9181",
                  },
                ]}
              >
                Notification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => onTabPress("trash")}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color={activeTab === "trash" ? "#90717E" : "#7E9181"}
              />
              <Text
                style={[
                  styles.label,
                  { color: activeTab === "trash" ? "#90717E" : "#7E9181" },
                ]}
              >
                Trash
              </Text>
            </TouchableOpacity>
          </View>

          {/* ⭐ Responsive Center Button */}
          <TouchableOpacity style={styles.centerButton} onPress={onCenterPress}>
            <Image
              source={addButtonImg}
              style={styles.centerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 10,
  },
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 14,
  },
  group: {
    flexDirection: "row",
    gap: 35,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },

  centerButton: {
    position: "absolute",
    top: -CENTER_OFFSET,
    left: SCREEN_WIDTH / 2 - CENTER_BUTTON_SIZE / 2,
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    zIndex: 20,
  },

  centerImage: {
    width: "100%",
    height: "100%",
  },
});
