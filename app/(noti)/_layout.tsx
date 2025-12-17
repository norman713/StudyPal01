import BottomBar from "@/components/ui/buttom";
import Header from "@/components/ui/header";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SegmentedButtons } from "react-native-paper";

export default function NotificationLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [activeTab, setActiveTab] = useState<"notification" | "invitation">(
    "notification"
  );

  useEffect(() => {
    const current = segments[segments.length - 1];
    if (current === "invite") setActiveTab("invitation");
    else setActiveTab("notification");
  }, [segments]);

  return (
    <View className="flex-1 bg-white">
      <Header
        avatarLabel="A"
        items={[
          { key: "inbox", label: "Inbox", icon: "inbox", badge: 24 },
          { key: "outbox", label: "Outbox", icon: "send" },
          { key: "favorites", label: "Favorites", icon: "heart-outline" },
          { key: "trash", label: "Trash", icon: "trash-can-outline" },
        ]}
        activeKey="inbox"
        onSelect={(k) => {
          switch (k) {
            case "inbox":
              router.push("/inbox");
              break;
            case "outbox":
              router.push("/outbox");
              break;
            default:
              router.push("/");
          }
        }}
      />

      <View className="px-4 pt-5">
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as "notification" | "invitation");
            if (value === "notification") router.push("/(noti)");
            if (value === "invitation") router.push("/(noti)/invite");
          }}
          density="regular"
          buttons={[
            {
              value: "notification",
              label: "NOTIFICATION",
              style: [
                {
                  borderRadius: 10,
                  borderWidth: 0,
                  marginLeft: 0,
                  elevation: 0,
                  backgroundColor:
                    activeTab === "notification" ? "#90717E" : "#E6DEE1",
                },
              ],
              labelStyle: {
                fontWeight: activeTab === "notification" ? "bold" : "200",
                fontSize: 12,
                color: activeTab === "notification" ? "#fff" : "#000",
              },
            },
            {
              value: "invitation",
              label: "INVITATION",
              style: [
                {
                  borderRadius: 10,
                  borderWidth: 0,
                  marginLeft: 3,
                  elevation: 0,
                  backgroundColor:
                    activeTab === "invitation" ? "#90717E" : "#E6DEE1",
                },
              ],
              labelStyle: {
                fontWeight: activeTab === "invitation" ? "bold" : "200",
                fontSize: 12,
                color: activeTab === "invitation" ? "#fff" : "#000",
              },
            },
          ]}
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#E6DEE1",
            borderRadius: 10,
            padding: 4,
          }}
        />
      </View>

      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      <BottomBar
        activeTab="notification"
        onTabPress={(tab) => {
          switch (tab) {
            case "team":
              router.push("/(team)/search");
              break;
            case "notification":
              router.push("/(noti)");
              break;
            case "me":
              router.push("/(me)");
              break;
            case "trash":
              router.push("/(trash)");
              break;
          }
        }}
      />
    </View>
  );
}
