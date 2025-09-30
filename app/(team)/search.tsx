import Header from "@/components/ui/header";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Search() {
  const nav = useNavigation();

  return (
    <View>
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
              router.replace("/inbox");
              break;
            case "outbox":
              router.replace("/outbox");
              break;

            default:
              router.replace("/");
          }
        }}
      />
    </View>
  );
}
