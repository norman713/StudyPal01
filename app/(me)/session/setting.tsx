import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { TextInput } from "react-native-paper";

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

const AVAILABLE_MUSICS: MusicItemType[] = [
  {
    id: "rain",
    title: "🌧 Rain sound",
    url: "rain.mp3",
  },
  {
    id: "forest",
    title: "🌲 Forest ambience",
    url: "forest.mp3",
  },
  {
    id: "lofi",
    title: "🎧 Lofi chill",
    url: "lofi.mp3",
  },
];
const NO_MUSIC_OPTION: MusicItemType = {
  id: "none",
  title: "🔇 No background music",
  url: "",
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
  const now = dayjs();
  const nextHour = now.add(1, "hour");
  const [totalTime, setTotalTime] = useState(now.format("HH:mm"));
  const [focusTime, setFocusTime] = useState(now.format("HH:mm"));
  const [breakTime, setBreakTime] = useState(now.format("HH:mm"));
  const [selectedMusic, setSelectedMusic] = useState<MusicItemType | null>(
    null
  );

  const [musicLink, setMusicLink] = useState("");
  const [musics, setMusics] = useState<MusicItemType[]>([]);
  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      // Initialize selectedMusic from musics array
      if (initialData.musics && initialData.musics.length > 0) {
        setSelectedMusic(initialData.musics[0]);
      } else {
        setSelectedMusic(null);
      }
    }
  }, [visible]);
  const stages = calcStages(totalTime, focusTime, breakTime);

  /* =======================
     HANDLERS
  ======================= */

  const handleSave = () => {
    // Construct musics array from selectedMusic
    const currentMusics = selectedMusic ? [selectedMusic] : [];

    onSave({
      totalTime,
      focusTime,
      breakTime,
      musics: currentMusics,
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
          <TimePickerRow
            label="Session total time:"
            value={totalTime}
            onChange={setTotalTime}
          />

          <TimePickerRow
            label="Focus time:"
            value={focusTime}
            onChange={setFocusTime}
          />

          <TimePickerRow
            label="Break time:"
            value={breakTime}
            onChange={setBreakTime}
          />

          <Text className="text-center text-[13px] text-gray-500 mb-4">
            Your session will have <Text className="font-bold">{stages}</Text>{" "}
            stages.
          </Text>

          {/* MUSIC INPUT */}
          <Pressable
            onPress={() => setDropdownOpen((prev) => !prev)}
            className="border border-gray-300 rounded-xl px-3 py-3 mb-2 flex-row items-center justify-between"
          >
            <Text className="text-[14px] font-semibold text-gray-700">
              {selectedMusic ? selectedMusic.title : "No background music"}
            </Text>

            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#90717E"
            />
          </Pressable>

          {dropdownOpen && (
            <View className="border border-gray-300 rounded-xl mb-3 overflow-hidden">
              {[NO_MUSIC_OPTION, ...AVAILABLE_MUSICS].map((item) => {
                const selected = selectedMusic?.id === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedMusic(item.id === "none" ? null : item);
                      setDropdownOpen(false);
                    }}
                    className={`px-3 py-3 font-normal ${
                      selected ? "bg-[#F2EFF0]" : "bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[14px] ${
                        selected ? "font-bold text-[#90717E]" : "text-gray-800"
                      }`}
                    >
                      {item.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

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
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function calcStages(
  totalTime: string,
  focusTime: string,
  breakTime: string
): number {
  const total = timeToMinutes(totalTime);
  const focus = timeToMinutes(focusTime);
  const rest = timeToMinutes(breakTime);

  const cycle = focus + rest;
  if (cycle <= 0) return 0;

  return Math.ceil(total / cycle);
}

function TimePickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string; // "HH:mm"
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-[14px] font-medium text-gray-700">{label}</Text>

      <TextInput
        mode="outlined"
        value={value}
        editable={false}
        style={{ width: 150 }}
        right={
          <TextInput.Icon
            icon={() => (
              <Ionicons name="time-outline" size={22} color="#49454F" />
            )}
            onPress={() => setOpen(true)}
          />
        }
      />

      {open && (
        <DateTimePicker
          value={dayjs()
            .hour(Number(value.split(":")[0]))
            .minute(Number(value.split(":")[1]))
            .toDate()}
          mode="time"
          is24Hour
          display="spinner"
          onChange={(e, selected) => {
            setOpen(false);
            if (selected) {
              onChange(dayjs(selected).format("HH:mm"));
            }
          }}
        />
      )}
    </View>
  );
}
