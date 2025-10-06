import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";

const ACCENT = "#90717E";
const STORAGE_KEY = "team:description";
const MAX_LEN = 2000;
const DEFAULT_TEXT =
  "This is where you write your team description and using textarea";

export default function DescriptionScreen() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [initial, setInitial] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && saved.trim().length > 0) {
          setValue(saved);
          setInitial(saved);
        } else {
          setValue(DEFAULT_TEXT);
          setInitial(DEFAULT_TEXT);
          await AsyncStorage.setItem(STORAGE_KEY, DEFAULT_TEXT);
        }
      } finally {
        setLoading(false);
        setTimeout(() => {
          const len = (inputRef.current?.props?.value || "").length;
          inputRef.current?.setNativeProps?.({
            selection: { start: len, end: len },
          });
        }, 0);
      }
    })();
  }, []);

  const dirty = useMemo(() => value !== initial, [value, initial]);
  const canSave = dirty && !saving && !loading && value.length <= MAX_LEN;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const trimmed = value.replace(/\s+$/g, "");
      await AsyncStorage.setItem(STORAGE_KEY, trimmed);
      setInitial(trimmed);
      router.back();
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
