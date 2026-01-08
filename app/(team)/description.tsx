import teamApi from "@/api/teamApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";

const ACCENT = "#90717E";
const STORAGE_KEY = "team:description";
const MAX_LEN = 2000;
const DEFAULT_TEXT = "";

export default function DescriptionScreen() {
  const router = useRouter();
  const { teamId, description } = useLocalSearchParams<{
    teamId?: string;
    description?: string;
  }>();

  const [value, setValue] = useState("");
  const [initial, setInitial] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        // Ưu tiên: description được truyền từ trang trước
        const desc =
          (description && description.trim().length > 0
            ? description
            : saved) || DEFAULT_TEXT;

        setValue(desc);
        setInitial(desc);

        // Lưu lại local để dùng cho lần sau
        await AsyncStorage.setItem(STORAGE_KEY, desc);
      } catch (err) {
        console.error("Failed to load saved description:", err);
      } finally {
        setLoading(false);

        // Đặt con trỏ cuối text input
        setTimeout(() => {
          const len = (inputRef.current?.props?.value || "").length;
          inputRef.current?.setNativeProps?.({
            selection: { start: len, end: len },
          });
        }, 0);
      }
    })();
  }, [description]);

  const dirty = useMemo(() => value !== initial, [value, initial]);
  const canSave = dirty && !saving && !loading && value.length <= MAX_LEN;

  const handleSave = async () => {
    if (!canSave || !teamId) return;
    setSaving(true);
    try {
      const trimmed = value.trim();

      await teamApi.update(teamId as string, { description: trimmed });

      // lưu local nếu cần
      await AsyncStorage.setItem(STORAGE_KEY, trimmed);
      setInitial(trimmed);

      // quay lại
      router.back();
    } catch (error) {
      console.error("Failed to update description:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#EFE7EA]">
      <Appbar.Header mode="small" style={{ backgroundColor: ACCENT }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content
          title="Description"
          titleStyle={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
        />
      </Appbar.Header>

      <View
        style={{
          flex: 1,
          margin: 12,
          backgroundColor: "#fff",
          padding: 12,
        }}
      >
        <TextInput
          ref={inputRef}
          mode="flat"
          multiline
          value={value}
          onChangeText={setValue}
          style={{
            flex: 1,
            textAlignVertical: "top",
            fontSize: 15,
            paddingHorizontal: 0,
            backgroundColor: "transparent",
          }}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{
            colors: {
              surfaceVariant: "#fff",
              onSurfaceVariant: "#0F0C0D",
              outline: "transparent",
            },
          }}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={!canSave}
          contentStyle={{ height: 46 }}
          style={{
            marginTop: 12,
            borderRadius: 999,
            backgroundColor: ACCENT,
          }}
          labelStyle={{ color: "#fff", fontWeight: "600", letterSpacing: 0.2 }}
        >
          Save
        </Button>
      </View>
    </View>
  );
}
