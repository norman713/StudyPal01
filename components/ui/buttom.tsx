import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import addButtonImg from "../../assets/images/Addbutton.png";

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
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#ccc",
          }}
        />
      </View>

      {/* Các tab */}
      <View style={styles.container}>
        {/* Me */}
        <View style={styles.group}>
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

        {/* left group */}
        <View style={styles.group}>
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
        {/* Center Button */}
        <TouchableOpacity style={styles.centerButton} onPress={onCenterPress}>
          <Image
            source={addButtonImg}
            style={styles.centerImage}
            resizeMode="contain"
          />
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
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
    paddingHorizontal: 24,
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
    top: -30,
    left: "45%",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
    overflow: "visible",
  },
  centerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
});
