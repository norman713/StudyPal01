import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Appbar, Divider, RadioButton, Text } from "react-native-paper";

type NotifyChannel = "plan" | "team" | "chat";

const STORAGE_KEY = "notification:selectedChannels";
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
    description: "Notifications for team chat.",
  },
];

export default function NotiScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<NotifyChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved selection
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSelected(JSON.parse(saved));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Save when changed
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selected)).catch(() => {});
  }, [selected, loading]);

  const toggle = (key: NotifyChannel) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <View className="flex-1 bg-[#EFE7EA]">
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

      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        <View className="mx-3 bg-white rounded-lg">
          {OPTIONS.map((opt, idx) => {
            const isChecked = selected.includes(opt.key);
            return (
              <View key={opt.key}>
                <Pressable
                  android_ripple={{ color: "#eee" }}
                  onPress={() => toggle(opt.key)}
                  className="px-4 py-4 flex-row items-center"
                >
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

                  <RadioButton
                    value={opt.key}
                    status={isChecked ? "checked" : "unchecked"}
                    onPress={() => toggle(opt.key)}
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
