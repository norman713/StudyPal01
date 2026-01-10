import teamApi, { TeamNotificationSetting } from "@/api/teamApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Appbar, Divider, RadioButton, Text } from "react-native-paper";

type NotifyChannel = "plan" | "team" | "chat";

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
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  // Store the fetched settings (source of truth)
  const [originalSetting, setOriginalSetting] =
    useState<TeamNotificationSetting | null>(null);
  // Store local changes
  const [setting, setSetting] = useState<TeamNotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    fetchSettings();
  }, [teamId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await teamApi.getSetting(teamId);
      setOriginalSetting(data);
      setSetting(data);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!setting || !originalSetting) return;

    try {
      setSaving(true);
      // Construct partial update with only changed fields or send all
      // Here sending all modified fields for simplicity as the API takes Partial
      const updateData: Partial<TeamNotificationSetting> = {
        teamNotification: setting.teamNotification,
        teamPlanReminder: setting.teamPlanReminder,
        chatNotification: setting.chatNotification,
      };

      await teamApi.updateNotificationSetting(setting.id, updateData);
      setOriginalSetting(setting);
    } catch (error) {
      console.error("Failed to save settings", error);
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: NotifyChannel) => {
    if (!setting) return;

    setSetting((prev) => {
      if (!prev) return null;
      let newValue = false;
      const next = { ...prev };

      if (key === "plan") {
        newValue = !prev.teamPlanReminder;
        next.teamPlanReminder = newValue;
      } else if (key === "team") {
        newValue = !prev.teamNotification;
        next.teamNotification = newValue;
      } else if (key === "chat") {
        newValue = !prev.chatNotification;
        next.chatNotification = newValue;
      }
      return next;
    });
  };

  const isChecked = (key: NotifyChannel) => {
    if (!setting) return false;
    if (key === "plan") return setting.teamPlanReminder;
    if (key === "team") return setting.teamNotification;
    if (key === "chat") return setting.chatNotification;
    return false;
  };

  const hasChanges =
    JSON.stringify(originalSetting) !== JSON.stringify(setting);

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
        <Appbar.Action
          icon="content-save"
          color="#fff"
          onPress={handleSave}
          disabled={!hasChanges || saving}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        <View className="mx-3 bg-white rounded-lg">
          {OPTIONS.map((opt, idx) => {
            const checked = isChecked(opt.key);
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
                    status={checked ? "checked" : "unchecked"}
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
