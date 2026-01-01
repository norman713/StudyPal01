import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import chatbotApi, { ChatbotMessage } from "../../../api/chatbotApi";
import { sendChatbotSSE } from "../../../api/chatbotSSE";

type UIMessage = {
  id: string;
  role: "bot" | "user";
  content: string;
};

export default function ChatbotScreen() {
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList<UIMessage>>(null);

  const mapToUIMessage = (m: ChatbotMessage): UIMessage => ({
    id: m.id,
    role: m.sender === "USER" ? "user" : "bot",
    content: m.message,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await chatbotApi.getMessages();
      const uiMessages = res.messages.map(mapToUIMessage);
      setMessages(uiMessages);
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const idempotencyKey = Crypto.randomUUID();
    const prompt = input;

    const userId = `${idempotencyKey}-user`;
    const botId = `${idempotencyKey}-bot`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: prompt },
      { id: botId, role: "bot", content: "" },
    ]);

    setInput("");

    // 2️⃣ SSE ONLY — KHÔNG fetch lại
    sendChatbotSSE({
      payload: { prompt },
      idempotencyKey,

      onChunk: (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: m.content + chunk } : m
          )
        );
      },

      onError: () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: "❌ Bot error" } : m
          )
        );
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      {/* HEADER */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        {/* Back */}
        <Appbar.BackAction onPress={() => router.back()} color="white" />

        {/* Logo */}
        <Image
          source={require("../../../assets/images/ChatbotLogo.png")}
          className="w-10 h-10 mx-2"
          resizeMode="contain"
        />

        {/* Title */}
        <Appbar.Content
          title="StudyPal's chatbot"
          titleStyle={{ color: "white", fontSize: 16 }}
        />
      </Appbar.Header>

      {/* CHAT */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            className={`flex-row mb-3 ${
              item.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {item.role === "bot" && (
              <Image
                source={require("../../../assets/images/ChatbotLogo.png")}
                className="w-7 h-7 mr-2"
              />
            )}

            <View
              className={`px-3 py-2 rounded-2xl max-w-[75%] ${
                item.role === "user"
                  ? "bg-[#9B7A86] rounded-tr-sm"
                  : "bg-white rounded-tl-sm"
              }`}
            >
              <Text
                className={`${
                  item.role === "user" ? "text-white" : "text-black"
                } text-lg`}
              >
                {item.content}
              </Text>
            </View>
          </View>
        )}
      />

      {/* USAGE */}
      <Text className="text-center text-lg text-neutral-500 mb-2">
        You have used 30% of bot data today.
      </Text>

      {/* CONTEXT */}
      <View className="flex-row items-center px-2 space-x-2 mb-2">
        <TouchableOpacity className="bg-neutral-200 px-3 py-1.5 rounded-full">
          <Text className="text-xl">＋ Add context</Text>
        </TouchableOpacity>

        <View className="bg-neutral-200 px-3 py-1.5 rounded-full">
          <Text className="text-xl">TSK-00001</Text>
        </View>

        <View className="bg-neutral-200 px-3 py-1.5 rounded-full">
          <Text className="text-xl">file.txt</Text>
        </View>
      </View>

      {/* INPUT */}
      <View className="flex-row items-center bg-white mx-3 mb-3 px-4 py-2 rounded-full">
        <TextInput
          placeholder="Ask anything"
          className="flex-1 text-xl"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={22} color="#8B5D6A" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
