import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#90717E";
const CURRENT_USER = "Ditto";

type Message = {
  id: string;
  text: string;
  time: string;
  user: string;
  image?: string;
};

const messages: Message[] = [
  {
    id: "1",
    text: "Hi I’m Pikachu!",
    time: "12:12 12-12-12",
    user: "Pikachu",
  },
  {
    id: "2",
    text: "Alright Pikachu get me orange juice.",
    time: "12:12 12-12-12",
    user: "Ditto",
  },
  {
    id: "3",
    text: "i dong wana go work",
    time: "12:12 12-12-12",
    user: "Ditto",
    image: "https://images.unsplash.com/photo-1583511655826-05700442b31b?w=500",
  },
  {
    id: "4",
    text: "Oh! Doubleganger!",
    time: "12:12 12-12-12",
    user: "Pikachu",
  },
];

export default function TeamChatScreen() {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setNewMessage("");
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* ===== HEADER ===== */}
      <View className="flex-row items-center gap-3 bg-[#90717E] px-4 pt-12 pb-3">
        <Ionicons name="arrow-back" size={24} color="#fff" />

        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          className="w-10 h-10 rounded-full"
        />

        <View className="flex-1">
          <Text className="text-white text-[16px] font-semibold">
            This is pokemon world
          </Text>
          <Text className="text-white/80 text-[12px]">8 members</Text>
        </View>
      </View>

      {/* ===== CHAT ===== */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-3 pt-4"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => {
          const isMe = msg.user === CURRENT_USER;

          return (
            <View
              key={msg.id}
              className={`mb-3 flex-row ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=1" }}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}

              <View
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  isMe ? "bg-[#90717E] rounded-tr-md" : "bg-white rounded-tl-md"
                }`}
              >
                {!isMe && (
                  <Text className="text-[12px] font-semibold text-[#1D1B20] mb-1">
                    {msg.user}
                  </Text>
                )}

                {msg.image && (
                  <Image
                    source={{ uri: msg.image }}
                    className="w-[200px] h-[140px] rounded-xl mb-2"
                  />
                )}

                <Text
                  className={`text-[14px] ${
                    isMe ? "text-white" : "text-[#1D1B20]"
                  }`}
                >
                  {msg.text}
                </Text>

                <Text
                  className={`text-[10px] mt-1 self-end ${
                    isMe ? "text-white/70" : "text-[#9E9E9E]"
                  }`}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ===== INPUT ===== */}
      <View className="flex-row items-center gap-3 bg-white px-3 py-2">
        <Ionicons name="attach" size={22} color="#B8B8B8" />

        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Ask anything"
          placeholderTextColor="#B8B8B8"
          className="flex-1 bg-[#F2F2F2] rounded-full px-4 py-2 text-[14px]"
        />

        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={22} color={ACCENT} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
