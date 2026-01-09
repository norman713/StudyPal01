import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";

import { chatApi, Message } from "../../api/chatApi";
import memberApi, { Member } from "../../api/memberApi";
import teamApi, { TeamInfoResponse } from "../../api/teamApi";
import { getUserIdFromToken, readTokens } from "../../api/tokenStore";

const ACCENT = "#90717E";

// Default avatars just in case
const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12";

export default function TeamChatScreen() {
  const router = useRouter();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState<TeamInfoResponse | null>(null);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const ws = useRef<WebSocket | null>(null);
  const latestMessageId = messages[0]?.id;
  const shouldShowReadBy = (item: Message): boolean => {
    if (!currentUserId) return false;
    if (item.id !== messages[0]?.id) return false;
    if (!item.readBy || item.readBy.length === 0) return false;

    // 🔥 chỉ cần có ÍT NHẤT 1 user khác
    const others = item.readBy.filter((u) => u.id !== currentUserId);

    return others.length > 0;
  };

  // Initial Data Fetch
  useEffect(() => {
    console.log("TeamChatScreen mounted. TeamID:", teamId);
    if (!teamId) {
      console.log("No teamId found, aborting init");
      return;
    }

    const init = async () => {
      try {
        console.log("Starting chat init...");
        setLoading(true);

        // 1. Get Tokens & User ID
        const tokens = await readTokens();
        console.log(
          "Tokens read:",
          tokens.accessToken ? "Token exists" : "No token"
        );
        const myId = getUserIdFromToken(tokens.accessToken);
        console.log("My User ID:", myId);
        setCurrentUserId(myId);

        // 2. Fetch Team Info
        console.log("Fetching team info for:", teamId);
        const info = await teamApi.getInfo(teamId);
        // Handle varying response structures (some projects wrap in data, some don't)
        const teamData = (info as any).data || info;
        console.log("Team Info received:", teamData);
        setTeamInfo(teamData);

        // 3. Fetch Members (to map names)
        console.log("Fetching members...");
        const membersRes = await memberApi.getAll(teamId, undefined, 100);
        console.log("Members count:", membersRes.members.length);
        const memMap: Record<string, Member> = {};
        membersRes.members.forEach((m) => {
          memMap[m.userId] = m;
        });
        setMembers(memMap);

        // 4. Fetch History
        console.log("Fetching message history...");
        const msgs = await chatApi.getMessages(teamId, 50);
        console.log("History received. Count:", msgs.messages?.length);
        // Ensure messages are valid array
        setMessages(msgs.messages || []);

        console.log("[INIT] latest message readBy:", {
          messageId: msgs.messages?.[0]?.id,
          readBy: msgs.messages?.[0]?.readBy?.map((u) => u.id),
          currentUserId: myId,
        });

        // 6. Mark latest message as read if it's not from me
        if (msgs.messages && msgs.messages.length > 0) {
          const latestMsg = msgs.messages[0];
          // "Sender thì không mark, receiver đang active trong chat thì phải mark"
          if (latestMsg.user?.id !== myId) {
            console.log("Marking latest message as read:", latestMsg.id);
            chatApi
              .markMessageRead(latestMsg.id)
              .catch((err) => console.log("Mark read failed", err));
          }
          if (latestMsg.user?.id !== myId) {
            console.log("[MARK READ] calling API for:", latestMsg.id);
            chatApi.markMessageRead(latestMsg.id).then(() => {
              console.log("[MARK READ] done for:", latestMsg.id);
            });
          }
        }

        // 5. Connect WebSocket
        if (tokens.accessToken) {
          console.log("Connecting WebSocket...");
          connectWebSocket(tokens.accessToken, teamId, myId);
        } else {
          console.log("No access token for WS");
        }
      } catch (error) {
        console.error("Chat init error details:", error);
        Alert.alert("Error", "Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [teamId]);

  const connectWebSocket = (
    token: string,
    tId: string,
    myUserId: string | null
  ) => {
    // ws://103.211.201.112:8080/ws/chat?access_token={token}&team_id={teamId}
    const wsUrl = `ws://103.211.201.112:8080/ws/chat?access_token=${token}&team_id=${tId}`;
    console.log("WS URL:", wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WS Connected OPEN");
    };

    ws.current.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);

        // Expect structure: { type: "SEND", data: { ... } }
        if (parsed.type === "SEND" && parsed.data) {
          const msgData = parsed.data;
          // The backend sends the full message object now, which matches our new interface
          const newMsg: Message = msgData;

          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [newMsg, ...prev];
          });

          // Mark as read if from someone else
          if (newMsg.id && newMsg.user?.id !== myUserId) {
            console.log("WS: Mark read", newMsg.id);
            chatApi.markMessageRead(newMsg.id).catch(() => {});
          }
        }
      } catch (err) {
        console.log("WS Parse error", err);
      }
    };

    ws.current.onerror = (e) => {
      console.log("WS Error:", e);
    };

    ws.current.onclose = (e) => {
      console.log("WS Closed:", e.reason);
    };
  };

  const handleSend = async () => {
    console.log("Handle Send Triggered. Text:", newMessage);
    if (!newMessage.trim() || !teamId) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      console.log("Sending message via API...");
      await chatApi.sendMessage(teamId, content);
      console.log("Message sent successfully via API");

      // 🔥 REFRESH MESSAGE LIST
      const refreshed = await chatApi.getMessages(teamId, 50);
      console.log("[REFETCH AFTER SEND] messages:", refreshed.messages?.length);

      setMessages(refreshed.messages || []);
    } catch (error) {
      console.error("Send error details:", error);
      Alert.alert("Error", "Failed to send message.");
      setNewMessage(content);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log("Image picked:", asset);
      if (!teamId) return;

      try {
        const fileName = asset.fileName || "photo.jpg";
        const fileType = asset.mimeType || "image/jpeg";
        const file = {
          uri: asset.uri,
          name: fileName,
          type: fileType,
        };

        console.log("Uploading file:", file);
        await chatApi.sendMessage(teamId, "", file);
        console.log("File uploaded successfully");
      } catch (error) {
        console.error("Upload error details:", error);
        Alert.alert("Error", "Failed to upload image.");
      }
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    // Fallback if user object is missing (shouldn't happen with new API)
    const senderId = item.user?.id || "";
    const isMe = senderId === currentUserId;

    // Direct user info from message
    const avatarUrl = item.user?.avatarUrl || DEFAULT_AVATAR;
    const senderName = item.user?.name || "Unknown";

    const date = new Date(item.createdAt);
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View className={`mb-3 flex-col ${isMe ? "items-end" : "items-start"}`}>
        <View className={`flex-row ${isMe ? "justify-end" : "justify-start"}`}>
          {!isMe && (
            <Image
              source={{ uri: avatarUrl }}
              className="w-10 h-10 rounded-full mr-2"
            />
          )}

          <View
            className={`max-w-[75%] px-3 py-2 shadow-sm ${
              isMe
                ? "bg-[#90717E] rounded-2xl rounded-tr-sm"
                : "bg-white rounded-2xl rounded-tl-sm border border-gray-100"
            }`}
          >
            {!isMe && (
              <Text className="text-[12px] font-bold text-[#1D1B20] mb-1">
                {senderName}
              </Text>
            )}

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <View className="mb-1">
                {item.attachments.map((att) => {
                  if (att.type === "IMAGE") {
                    return (
                      <Image
                        key={att.id}
                        source={{ uri: att.url }}
                        className="w-[200px] h-[140px] rounded-lg mb-1 bg-gray-200"
                        resizeMode="cover"
                      />
                    );
                  }
                  return null;
                })}
              </View>
            )}

            {/* Text Content */}
            {item.content ? (
              <Text
                className={`text-[15px] leading-5 ${
                  isMe ? "text-white" : "text-[#1D1B20]"
                }`}
              >
                {item.content}
              </Text>
            ) : null}

            {/* Timestamp */}
            <Text
              className={`text-[10px] mt-1 self-end font-normal ${
                isMe ? "text-white/80" : "text-gray-400"
              }`}
            >
              {timeStr}
            </Text>
          </View>
        </View>

        {/* Read Receipts */}
        {shouldShowReadBy(item) && (
          <View className="flex-row mt-1 mr-1 justify-end">
            {item
              .readBy!.filter((u) => u.id !== currentUserId)
              .map((u, index) => (
                <Image
                  key={u.id}
                  source={{ uri: u.avatarUrl || DEFAULT_AVATAR }}
                  className="w-6 h-6 rounded-full border border-white -ml-1"
                  style={{ zIndex: index }}
                />
              ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F5F5F5]">
      {/* ===== HEADER ===== */}
      <View className="flex-row items-center gap-3 bg-[#90717E] px-4 py-3 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {teamInfo?.avatarUrl ? (
          <Image
            source={{ uri: teamInfo.avatarUrl }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Text className="text-white font-bold">
              {teamInfo?.name?.[0] || "?"}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text
            className="text-white text-[16px] font-semibold"
            numberOfLines={1}
          >
            {teamInfo?.name || "Loading..."}
          </Text>
          <Text className="text-white/80 text-[12px]">
            {teamInfo ? `${teamInfo.totalMembers} members` : ""}
          </Text>
        </View>
      </View>

      {/* ===== CHAT LIST ===== */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={{ flex: 1 }}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingVertical: 16,
            }}
            inverted
          />
        )}

        {/* ===== INPUT ===== */}
        <View className="flex-row items-center gap-3 bg-white px-3 py-2 pb-4">
          <TouchableOpacity onPress={handlePickImage}>
            <Ionicons name="attach" size={22} color="#B8B8B8" />
          </TouchableOpacity>

          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Ask anything"
            placeholderTextColor="#B8B8B8"
            className="flex-1 bg-[#F2F2F2] rounded-full px-4 py-2 text-[14px]"
            multiline
          />

          <TouchableOpacity onPress={handleSend}>
            <Ionicons name="send" size={22} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
