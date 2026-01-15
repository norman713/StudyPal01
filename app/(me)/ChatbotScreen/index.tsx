import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
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
  context?: {
    id: string;
    type: string;
    title: string;
  };
  attachments?: {
    name: string;
    url: string;
  }[];
};

type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

export default function ChatbotScreen() {
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams<{
    teamId?: string;
    contextId?: string;
    contextType?: "TASK" | "PLAN";
    contextTitle?: string;
  }>();

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList<UIMessage>>(null);
  const [quotaUsage, setQuotaUsage] = useState<{
    usedQuota: number;
    dailyQuota: number;
  } | null>(null); // Store quota data

  const [attachedFiles, setAttachedFiles] = useState<PickedFile[]>([]);

  // Context State
  const [context, setContext] = useState<{
    id: string;
    type: string;
    title?: string;
  } | null>(null);

  useEffect(() => {
    if (params.contextId && params.contextType) {
      console.log("[ChatbotScreen] Received context:", params);
      setContext({
        id: params.contextId,
        type: params.contextType,
        title: params.contextTitle || params.contextId,
      });
    }
  }, [params.contextId, params.contextType, params.contextTitle]);

  const mapToUIMessage = (m: ChatbotMessage): UIMessage => ({
    id: m.id,
    role: m.sender === "USER" ? "user" : "bot",
    content: m.message,
    context:
      m.context && m.context.id
        ? {
            id: m.context.id,
            type: m.context.type,
            title: m.context.code,
          }
        : undefined,
    attachments: m.attachments?.map((a) => ({
      name: a.name,
      url: a.url,
    })),
  });

  useEffect(() => {
    fetchMessages();
    fetchQuotaUsage();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await chatbotApi.getMessages();
      const uiMessages = res.messages.map(mapToUIMessage);
      setMessages(uiMessages);
    } catch (e) {
      console.error("Failed to load messages mobile", e);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled) return;

    const files: PickedFile[] = result.assets.map((file) => ({
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
    }));

    console.log("[ChatbotScreen] Picked files:", files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  // Fetch the quota usage and calculate the percentage
  const fetchQuotaUsage = async () => {
    try {
      const res = await chatbotApi.getUserQuotaUsage();
      setQuotaUsage(res);
    } catch (e) {
      console.error("Failed to fetch quota usage", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isStreaming) return;

    setIsStreaming(true);

    const idempotencyKey = Crypto.randomUUID();
    const prompt = input.trim();

    const userId = `${idempotencyKey}-user`;
    const botId = `${idempotencyKey}-bot`;

    setMessages((prev) => [
      { id: botId, role: "bot", content: "" },
      {
        id: userId,
        role: "user",
        content: prompt,
        attachments: attachedFiles.map((f) => ({
          name: f.name,
          url: f.uri,
        })),
        context: context
          ? {
              id: context.id,
              type: context.type,
              title: context.title || context.id,
            }
          : undefined,
      },
      ...prev,
    ]);

    const payload = {
      prompt,
      contextId: context?.id,
      contextType: context?.type,
    };

    console.log("[ChatbotScreen] Sending message. Payload:", payload);
    console.log(
      "[ChatbotScreen] Attachments:",
      attachedFiles.map((f) => f.name)
    );

    const attachments =
      attachedFiles.length > 0
        ? attachedFiles.map((file) => ({
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
          }))
        : undefined;

    setInput("");
    setAttachedFiles([]);

    sendChatbotSSE({
      payload,
      attachments,
      idempotencyKey,

      onChunk: (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: m.content + chunk } : m
          )
        );
      },

      onError: async () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: "❌ Bot error" } : m
          )
        );
        await fetchQuotaUsage();
        setIsStreaming(false);
        Alert.alert("Error", "Failed to send message. Please try again.");
      },

      onDone: async () => {
        await new Promise((r) => setTimeout(r, 300));
        await fetchQuotaUsage();
        setIsStreaming(false);
      },
    });
  };

  const calculateQuotaPercentage = () => {
    if (!quotaUsage || quotaUsage.dailyQuota === 0) return 0;
    const percentage = (quotaUsage.usedQuota / quotaUsage.dailyQuota) * 100;
    return Math.round(percentage);
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
        inverted
        data={messages}
        ref={flatListRef}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        // onContentSizeChange={() =>
        //   flatListRef.current?.scrollToEnd({ animated: true })
        // }
        renderItem={({ item }) => (
          <View
            className={`flex-row mb-3 ${
              item.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {item.role === "bot" && (
              <Image
                source={require("../../../assets/images/ChatbotLogo.png")}
                className="w-7 h-7 mr-2 self-end mb-1"
              />
            )}

            <View
              className={`px-3 py-2 rounded-2xl max-w-[75%] ${
                item.role === "user"
                  ? "bg-[#9B7A86] rounded-tr-sm"
                  : "bg-white rounded-tl-sm"
              }`}
            >
              {item.context && (
                <View className="self-start bg-white/20 px-2 py-0.5 rounded-md mb-1">
                  <Text className="text-white text-xs font-medium">
                    {item.context.title}
                  </Text>
                </View>
              )}

              {/* Attachments */}
              {item.attachments && item.attachments.length > 0 && (
                <View className="mb-2">
                  {item.attachments.map((att, index) => (
                    <View
                      key={index}
                      className="bg-black/10 rounded px-2 py-1 mb-1"
                    >
                      <Text
                        className={`${
                          item.role === "user" ? "text-white" : "text-black"
                        } text-xs`}
                        numberOfLines={1}
                      >
                        📎 {att.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text
                className={`${
                  item.role === "user" ? "text-white" : "text-black"
                } text-lg font-normal`}
              >
                {item.content}
              </Text>
            </View>
          </View>
        )}
      />

      {/* USAGE */}

      <Text className="text-center font-medium text-lg text-neutral-500 mb-2">
        You have used{" "}
        <Text className="text-[#90717E]">
          {quotaUsage ? Math.round(calculateQuotaPercentage()) : 0}%
        </Text>{" "}
        of bot today
      </Text>

      {/* CONTEXT */}
      <View className="flex-row p-2 items-center mb-2">
        <TouchableOpacity
          className="bg-[#90717E] px-3 py-1.5 rounded-full"
          onPress={() => {
            if (params.teamId) {
              // Team Context: Search Plan
              router.push({
                pathname: "/(team)/plan/searchPlan",
                params: {
                  teamId: params.teamId,
                  isSelectionMode: "true",
                  returnTo: "/(me)/ChatbotScreen", // Simplified return path
                },
              });
            } else {
              // Personal Context: Search Task
              router.push({
                pathname: "/(me)/task/components/SearchTask",
                params: {
                  isSelectionMode: "true",
                  returnTo: "/(me)/ChatbotScreen",
                },
              });
            }
          }}
        >
          <Text className="text-xl font-normal text-white ">
            ＋ Add context
          </Text>
        </TouchableOpacity>

        {context && (
          <View className="bg-neutral-200 mx-2 px-3 py-1.5 rounded-full flex-row items-center">
            <Text className="text-xl mr-2" numberOfLines={1}>
              {context.title || context.id}
            </Text>
            <TouchableOpacity onPress={() => setContext(null)}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {attachedFiles.map((file, index) => (
        <View
          key={`${file.uri}-${index}`}
          className="flex-row items-center mx-3 mb-1 px-3 py-1 bg-neutral-100 rounded-lg"
        >
          <Text className="flex-1 text-sm" numberOfLines={1}>
            📎 {file.name}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
            }
          >
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      ))}

      {/* INPUT */}
      <View className="flex-row items-center bg-white mx-3 mb-3 px-4 py-2 rounded-full">
        {/* ATTACH FILE */}
        <TouchableOpacity onPress={pickFile} disabled={isStreaming}>
          <Ionicons name="attach" size={22} color="#8B5D6A" />
        </TouchableOpacity>

        <TextInput
          placeholder="Ask anything"
          className="flex-1 text-xl ml-2"
          value={input}
          editable={!isStreaming}
          onChangeText={setInput}
        />

        <TouchableOpacity onPress={handleSend} disabled={isStreaming}>
          <Ionicons
            name="send"
            size={22}
            color={isStreaming ? "#B0B0B0" : "#8B5D6A"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
