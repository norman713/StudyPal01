import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

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
  return (
    <View style={styles.wrapper}>
      <View style={StyleSheet.absoluteFill}>
        <Svg
          width="100%"
          height="80"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
        >
          <Path
            d="M0,0 H100 V80 H0 V0 Z M50,0 C45,0 42,20 35,20 C42,20 45,0 50,0 Z"
            fill="#F8F7F8"
          />
        </Svg>
      </View>

      {/* Các tab */}
      <View style={styles.container}>
        {/* Me */}
        <TouchableOpacity style={styles.tab} onPress={() => onTabPress("me")}>
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

        {/* Team */}
        <TouchableOpacity style={styles.tab} onPress={() => onTabPress("team")}>
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

        {/* Center Button */}
        <TouchableOpacity style={styles.centerButton} onPress={onCenterPress}>
          <LinearGradient
            colors={["#90717E", "#8C8C8C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <MaterialCommunityIcons name="plus" size={30} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Notification */}
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
              { color: activeTab === "notification" ? "#90717E" : "#7E9181" },
            ]}
          >
            Notification
          </Text>
        </TouchableOpacity>

        {/* Trash */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  centerButton: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    transform: [{ translateY: 10 }],
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
