import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Appbar, Divider, RadioButton, Text } from "react-native-paper";

type NotifyChannel = "plan" | "team" | "chat";

const STORAGE_KEY = "notification:defaultChannel";
const ACCENT = "#90717E";

const OPTIONS: Array<{
  key: NotifyChannel;
  title: string;
  description: string;
}> = [
  {
    key: "plan",
    title: "Plan",
    description: "Notifications for your assigned plans.",
  },
  {
    key: "team",
    title: "Team",
    description: "Notifications for team changes.",
  },
  {
    key: "chat",
    title: "Chat",
    description: "Notification for team chat.",
  },
];

export default function NotiScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<NotifyChannel>("plan");
  const [loading, setLoading] = useState(true);

  // Load saved channel
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "plan" || saved === "team" || saved === "chat") {
          setSelected(saved);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Persist when changed
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, selected).catch(() => {});
  }, [selected, loading]);

  return (
    <View className="flex-1 bg-[#EFE7EA]">
      {/* Top Appbar */}
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          color="#fff"
          title="Notification settings"
          titleStyle={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "500",
            letterSpacing: 0.2,
          }}
        />
      </Appbar.Header>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingVertical: 12 }}
        className="flex-1 bg-[#EFE7EA]"
      >
        <View className="mx-3 bg-white">
          {OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.key;
            return (
              <View key={opt.key}>
                <Pressable
                  android_ripple={{ color: "#eee" }}
                  onPress={() => setSelected(opt.key)}
                  className="px-4 py-4 flex-row items-center"
                >
                  {/* Texts */}
                  <View className="flex-1 pr-3">
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#0F0C0D",
                      }}
                    >
                      {opt.title}
                    </Text>

                    <Text
                      style={{
                        fontSize: 16,
                        color: "#92AAA5",
                        fontWeight: "400",
                        marginTop: 2,
                      }}
                    >
                      {opt.description}
                    </Text>
                  </View>

                  {/* Radio at right */}
                  <RadioButton
                    value={opt.key}
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() => setSelected(opt.key)}
                    color={ACCENT}
                    uncheckedColor="#C9C2C5"
                  />
                </Pressable>

                {idx < OPTIONS.length - 1 && (
                  <Divider style={{ marginLeft: 16, opacity: 0.5 }} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
