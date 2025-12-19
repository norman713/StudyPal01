import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

/* =======================
   TYPES
======================= */

export type MusicItemType = {
  id: string;
  title: string;
  url: string;
};

export type SessionSettingData = {
  totalTime: string;
  focusTime: string;
  breakTime: string;
  musics: MusicItemType[];
};

type Props = {
  visible: boolean;
  initialData?: SessionSettingData;
  onClose: () => void;
  onSave: (data: SessionSettingData) => void;
};

/* =======================
   COMPONENT
======================= */

export default function SessionSettingsModal({
  visible,
  initialData,
  onClose,
  onSave,
}: Props) {
  const [totalTime, setTotalTime] = useState("03:00:00");
  const [focusTime, setFocusTime] = useState("00:30:00");
  const [breakTime, setBreakTime] = useState("00:10:00");

  const [musicLink, setMusicLink] = useState("");
  const [musics, setMusics] = useState<MusicItemType[]>([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     INIT DATA
  ======================= */

  useEffect(() => {
    if (!visible) return;

    if (initialData) {
      setTotalTime(initialData.totalTime);
      setFocusTime(initialData.focusTime);
      setBreakTime(initialData.breakTime);
      setMusics(initialData.musics);
    }
  }, [visible]);

  /* =======================
     HANDLERS
  ======================= */

  const handleAddMusic = async () => {
    if (!musicLink.trim()) return;

    // tránh add trùng
    if (musics.some((m) => m.url === musicLink)) {
      setMusicLink("");
      return;
    }

    setLoading(true);

    const title = await fetchYoutubeTitle(musicLink);

    const newMusic: MusicItemType = {
      id: Date.now().toString(),
      url: musicLink,
      title,
    };

    setMusics((prev) => [...prev, newMusic]);
    setMusicLink("");
    setLoading(false);
  };

  const handleRemoveMusic = (id: string) => {
    setMusics((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    onSave({
      totalTime,
      focusTime,
      breakTime,
      musics,
    });
  };

  /* =======================
     UI
  ======================= */

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View className="w-full max-w-[360px] bg-white rounded-[28px] px-6 py-6">
          {/* CLOSE */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="absolute right-4 top-4"
          >
            <Ionicons name="close" size={22} color="#90717E" />
          </Pressable>

          {/* TITLE */}
          <Text className="text-[18px] font-extrabold text-center mb-6">
            Session settings
          </Text>

          {/* TIME INPUTS */}
          <TimeRow
            label="Session total time:"
            value={totalTime}
            onChange={setTotalTime}
          />
          <TimeRow
            label="Focus time:"
            value={focusTime}
            onChange={setFocusTime}
          />
          <TimeRow
            label="Break time:"
            value={breakTime}
            onChange={setBreakTime}
          />

          <Text className="text-center text-[13px] text-gray-500 mb-4">
            Your session will have <Text className="font-bold">4</Text> stages.
          </Text>

          {/* MUSIC INPUT */}
          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2 mb-3">
            <TextInput
              value={musicLink}
              onChangeText={setMusicLink}
              placeholder="Enter Youtube link"
              placeholderTextColor="#777"
              className="flex-1 text-[14px]"
              autoCapitalize="none"
            />
            <Pressable hitSlop={10} onPress={handleAddMusic}>
              <MaterialIcons name="add" size={20} color="#90717E" />
            </Pressable>
          </View>

          {/* MUSIC LIST */}
          <View className="mb-4">
            {musics.map((item) => (
              <MusicItem
                key={item.id}
                title={item.title}
                onRemove={() => handleRemoveMusic(item.id)}
              />
            ))}

            {loading && (
              <Text className="text-center text-xs text-gray-400">
                Fetching title…
              </Text>
            )}
          </View>

          {/* SAVE */}
          <Pressable
            onPress={handleSave}
            className="bg-[#90717E] rounded-full py-3 items-center"
          >
            <Text className="text-white font-bold text-[15px]">Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* =======================
   SUB COMPONENTS
======================= */

function TimeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-[14px] text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        className="border border-gray-300 rounded-lg px-3 py-1.5 w-[110px] text-center text-[14px]"
      />
    </View>
  );
}

function MusicItem({
  title,
  onRemove,
}: {
  title: string;
  onRemove: () => void;
}) {
  return (
    <View className="flex-row items-center mb-2">
      <Ionicons name="musical-notes" size={16} color="#000" />
      <Text className="ml-2 text-[13px] text-gray-800 flex-1" numberOfLines={1}>
        {title}
      </Text>
      <Pressable hitSlop={10} onPress={onRemove}>
        <MaterialIcons name="remove-circle-outline" size={18} color="#90717E" />
      </Pressable>
    </View>
  );
}

/* =======================
   HELPERS
======================= */

async function fetchYoutubeTitle(url: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    const data = await res.json();
    return data?.title ?? "Youtube track";
  } catch {
    return "Youtube track";
  }
}
