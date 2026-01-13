import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import clsx from 'clsx';
import { chatApi, Message } from "../../api/chatApi";
import memberApi, { Member } from "../../api/memberApi";
import teamApi, { TeamInfoResponse } from "../../api/teamApi";
import { getUserIdFromToken, readTokens } from "../../api/tokenStore";
import planApi from "@/api/planApi";
import taskApi from "@/api/taskApi";

const ACCENT = "#90717E";
type Role = "MEMBER" | "ADMIN" | "OWNER";
// Default avatars just in case
const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12";

export default function TeamChatScreen() {
  const router = useRouter();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { role } = useLocalSearchParams<{role: Role}>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState<TeamInfoResponse | null>(null);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const nameIdMap = useRef<Map<string, string>>(new Map());

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

  const hasExactMention = (content: string, name: string) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`@${escaped}\\b`, "i");
    return regex.test(content);
  };

  const sendMessage = async(teamId: string, content: string, file?: any | null) => {
    let mentionType: "ALL" | "CUSTOM" | undefined;

    console.log(nameIdMap);

    if (!content && !file) return;

    const map = nameIdMap.current;

    for (const name of  Array.from(map.keys())) {
      if (!hasExactMention(content, name)) {
        map.delete(name);
      }
    }

    mentionType = /@ALL\b/i.test(content) ? "ALL" : "CUSTOM";

    await chatApi.sendMessage(teamId, content, {mentionType: mentionType, memberIds: Array.from(map.values())}, file ?? undefined);
    map.clear();
  }

  const textChangeRecommendation = (value: string) => {
    setNewMessage(value);
    const lastLine = value.split("\n").pop() ?? "";
    const match = lastLine.match(/@([^\s@]*)$/);

    if(match){
      setMentionQuery(match[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }

  const memberList = useMemo(
    () => Object.values(members),
    [members]
  );

  const filteredMembers = useMemo(() => {
    if (!mentionQuery) return memberList;

    return memberList.filter(m =>
      m.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );
  }, [mentionQuery, memberList]);

  const insertMention = (member: Member) => {
    setNewMessage(prev =>
      prev.replace(/@([^\s@]*)$/, `@${member.name} `)
    );
    nameIdMap.current.set(member.name, member.userId);
    console.log(nameIdMap);
    setShowMentions(false);
  };

  const USER_REGEX = /^@[a-zA-Z0-9_]+$/;
  const PLAN_REGEX = /^@PLN-[0-9]+$/;

  const getPlanByPlanCode = async(planCode: string) => {
    const data = await planApi.searchPlans(teamId, {keyword: planCode, size: 1});
    const num:string  = data.plans[0].id;
    return num;
  }

  const handlePressPlan = async (planCode: string) => {
    const planId = await getPlanByPlanCode(planCode);

    if (!planId) return;

    router.push({
      pathname: "/(team)/plan/planDetail",
      params: {
        teamId,
        planId,
        role,
      },
    });
  };

  const manageChatBubble = (content: string, isMe: boolean, onPlanPress: (planCode: string) => void) => {
    const parts = content.split(/(\s+)/);

    return parts.map((part, index) => {
      if (PLAN_REGEX.test(part)) {
        return (
          <Text
            key={index}
            className="text-[#FF8A00] font-semibold"
            onPress={() => onPlanPress(part.substring(1))}
          >
            {part}
          </Text>
        );
      }

      if (USER_REGEX.test(part)) {
        return (
          <Text
            key={index}
            className="text-[#92AAA5] font-semibold"
          >
            {part}
          </Text>
        );
      }
      
      return (
        <Text
          key={index}
          className={`${
            isMe ? "text-white" : "text-[#1D1B20]"
          }`}
        >
          {part}
        </Text>
      )
    })
  }

  // Initial Data Fetch
  useEffect(() => {
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

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WS Connected OPEN");
    };

    ws.current.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);

        if(parsed.data){
          const msgData = parsed.data;
          const newMsg: Message = msgData;
          setMessages((prev) => {
            switch (parsed.type) {
              case "SEND":
                if (prev.find((m) => m.id === newMsg.id)) return prev;
                return [newMsg, ...prev];

              case "DELETE":
                return prev.map((m) =>
                  m.id === newMsg.id ? { ...m, isDeleted: true } : m
                );

              case "EDIT":
                return prev.map((m) =>
                  m.id === newMsg.id 
                    ? { ...m, content: newMsg.content, updatedAt: newMsg.updatedAt } 
                    : m
                );

              default:
                return prev;
            }
          });

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
      await sendMessage(teamId, content, null);
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
      allowsMultipleSelection: true, // ✅ QUAN TRỌNG
      quality: 0.8,
      selectionLimit: 10, // optional (iOS)
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    if (!teamId) return;

    try {
      for (const asset of result.assets) {
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
        const fileType = asset.mimeType || "image/jpeg";

        const file = {
          uri: asset.uri,
          name: fileName,
          type: fileType,
        };

        await sendMessage(teamId, "", file);
      }

      // 🔥 Sau khi gửi xong → reload messages
      const refreshed = await chatApi.getMessages(teamId, 50);
      setMessages(refreshed.messages || []);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload images.");
    }
  };
  const handleTakePhoto = async () => {
    setShowAttachModal(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Camera access is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length || !teamId) return;

    const asset = result.assets[0];

    const file = {
      uri: asset.uri,
      name: asset.fileName || `camera_${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    };

    await sendMessage(teamId, "", file);

    const refreshed = await chatApi.getMessages(teamId, 50);
    setMessages(refreshed.messages || []);
  };
  const handlePickFromLibrary = async () => {
    setShowAttachModal(false);
    await handlePickImage();
  };

  const renderImageGrid = (attachments: any[]) => {
    const images = attachments.filter((a) => a.type === "IMAGE");
    const count = images.length;

    if (count === 0) return null;

    // 👉 1 ảnh
    if (count === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPreviewImage(images[0].url)}
        >
          <Image
            source={{ uri: images[0].url }}
            className="w-[220px] h-[160px] rounded-xl bg-gray-200"
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    // 👉 nhiều ảnh (grid)
    return (
      <View className="flex-row flex-wrap gap-1 max-w-[220px]">
        {images.slice(0, 4).map((img, index) => {
          const isLast = index === 3 && count > 4;

          return (
            <TouchableOpacity
              key={img.id}
              activeOpacity={0.9}
              onPress={() => setPreviewImage(img.url)}
            >
              <View className="relative">
                <Image
                  source={{ uri: img.url }}
                  className="w-[108px] h-[108px] rounded-lg bg-gray-200"
                  resizeMode="cover"
                />

                {/* +N overlay */}
                {isLast && (
                  <View className="absolute inset-0 bg-black/40 rounded-lg items-center justify-center">
                    <Text className="text-white text-xl font-bold">
                      +{count - 4}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Message }) => {
    // Fallback if user object is missing (shouldn't happen with new API)
    const senderId = item.user?.id || "";
    const isMe = senderId === currentUserId;

    // Direct user info from message
    const avatarUrl = item.user?.avatarUrl;
    const senderName = item.user?.name || "Unknown";

    const date = new Date(item.createdAt);
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const bubbleClass = clsx("rounded-2xl max-w-[75%] px-3 py-2 shadow-sm", {
      "bg-transparent border-2 border-dashed rounded-tr-sm": item.isDeleted && isMe,
      "bg-transparent border-2 border-dashed rounded-tl-sm": item.isDeleted && !isMe,
      "bg-[#90717E] rounded-tr-sm": !item.isDeleted && isMe,
      "bg-white rounded-tl-sm border border-gray-100": !item.isDeleted && !isMe,
    });

    return (
      <View className={`mb-3 flex-col ${isMe ? "items-end" : "items-start"}`}>
        <View className={`flex-row ${isMe ? "justify-end" : "justify-start"}`}>
          {!isMe &&
            (avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-10 h-10 rounded-full mr-2"
              />
            ) : (
              <View className="w-10 h-10 rounded-full mr-2 items-center justify-center bg-[#6B4EFF]">
                <Text className="text-white font-semibold">
                  {senderName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}

          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full ${isMe ? "items-end" : "items-start"}`}
            onLongPress={() => {
              if (!isMe || item.isDeleted) return; // ❗ chỉ cho phép message của mình
              setSelectedMessage(item);
              setMenuVisible(true);
            }}
          >
            {item.createdAt != item.updatedAt && !item.isDeleted && <Text className="text-[12px]">Edited</Text>}
            <View
              className={bubbleClass}
            >
              {!isMe && !item.isDeleted && (
                <Text className="text-[12px] font-bold text-[#1D1B20] mb-1">
                  {senderName}
                </Text>
              )}

              {/* Attachments */}
              {item.attachments && item.attachments.length > 0 && !item.isDeleted && (
                <View className="mb-1">
                  {renderImageGrid(item.attachments)}
                </View>
              )}

              {/* Text Content */}
              {item.content ? (
                item.isDeleted ? (
                  <Text className="text-[15px] font-normal leading-5 text-[#1D1B20] italic">
                    Message was deleted.
                  </Text>
                ) : (<Text
                    className={`text-[15px] font-semibold leading-5`}
                  >
                    {manageChatBubble(
                        item.content,
                        isMe,
                        (planCode) => {
                          handlePressPlan(planCode);
                        }
                      )}
                  </Text>)
              ): null}

              {/* Timestamp */}
              {!item.isDeleted && 
                <Text
                className={`text-[10px] mt-1 self-end font-normal ${
                    isMe ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {timeStr}
                </Text>
              }
            </View>
          </TouchableOpacity>
        </View>

        {/* Read Receipts */}
        {shouldShowReadBy(item) && (
          <View className="flex-row mt-1 mr-1 justify-end">
            {item
              .readBy!.filter((u) => u.id !== currentUserId)
              .map((u, index) =>
                u.avatarUrl ? (
                  <Image
                    key={u.id}
                    source={{ uri: avatarUrl }}
                    className="w-6 h-6 rounded-full border border-white -ml-1"
                    style={{ zIndex: index }}
                  />
                ) : (
                  <View className="w-6 h-6 rounded-full mr-2 items-center justify-center bg-[#6B4EFF]">
                    <Text className="text-white text-xs font-semibold s">
                      {u.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )
              )}
          </View>
        )}
      </View>
    );
  };
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    setMenuVisible(false);

    try {
      await chatApi.deleteMessage(selectedMessage.id);
    } catch (err) {
      Alert.alert("Error", "Failed to delete message");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessage) return;

    try {
      await chatApi.editMessage(editingMessage.id, editText);
      setEditingMessage(null);
    } catch (err) {
      Alert.alert("Error", "Failed to edit message");
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* ===== HEADER ===== */}
      <View className="  flex-row items-center gap-3 bg-[#90717E] px-4 p-6 ">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {teamInfo?.avatarUrl ? (
          <Image
            source={{ uri: teamInfo.avatarUrl }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-[#6B4EFF] items-center justify-center">
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

        <View className="relative bg-white">
        {showMentions && filteredMembers.length > 0 && (
          <View className="absolute bottom-full ml-12 mb-2 w-[70%] bg-white rounded-xl shadow">
            {filteredMembers.map(member => (
              <TouchableOpacity
                key={member.userId}
                onPress={() => insertMention(member)}
                className="flex-row items-center px-4 py-3 border-b border-gray-100"
              >
                {member.avatarUrl ? (
                  <Image
                    source={{ uri: member.avatarUrl }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  ) : (
                    <View className="w-8 h-8 rounded-full mr-2 items-center justify-center bg-[#6B4EFF]">
                      <Text className="text-white font-semibold">
                        {member.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                <View>
                  <Text className="font-medium">{member.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ===== INPUT ===== */}
        <View className="flex-row items-center gap-3 bg-white px-3 py-2 pb-4">
          <TouchableOpacity onPress={() => setShowAttachModal(true)}>
            <Ionicons name="attach" size={22} color="#B8B8B8" />
          </TouchableOpacity>

          <TextInput
            value={newMessage}
            onChangeText={textChangeRecommendation}
            placeholder="Ask anything"
            placeholderTextColor="#B8B8B8"
            className="flex-1 bg-[#F2F2F2] rounded-full px-4 py-2 text-[14px]"
            multiline
          />

          <TouchableOpacity onPress={handleSend}>
            <Ionicons name="send" size={22} color={ACCENT} />
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>

      {previewImage && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <View className="flex-1 bg-black justify-center items-center">
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              style={{ position: "absolute", top: 50, right: 20, zIndex: 10 }}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Full image */}
            <Image
              source={{ uri: previewImage }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

      {showAttachModal && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setShowAttachModal(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/40 justify-end"
            activeOpacity={1}
            onPress={() => setShowAttachModal(false)}
          >
            <View className="bg-white rounded-t-xl pb-4">
              <AttachItem
                icon="camera-outline"
                label="Capture new image"
                onPress={handleTakePhoto}
              />

              <AttachItem
                icon="images-outline"
                label="Take from library"
                onPress={handlePickFromLibrary}
              />

              <AttachItem
                icon="attach-outline"
                label="Attach file"
                onPress={() => {
                  setShowAttachModal(false);
                  Alert.alert("Coming soon");
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-center items-center"
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white rounded-xl w-[220px] overflow-hidden">
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => {
                setMenuVisible(false);
                setEditingMessage(selectedMessage);
                setEditText(selectedMessage?.content || "");
              }}
            >
              <Text className="text-[16px] font-semibold">Edit message</Text>
            </TouchableOpacity>

            <View className="h-[1px] bg-gray-200" />

            <TouchableOpacity
              className="px-4 py-3"
              onPress={handleDeleteMessage}
            >
              <Text className="text-[16px] font-semibold">Delete message</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {editingMessage && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className="bg-white rounded-xl w-[85%] p-4">
              {/* <Text className="font-semibold mb-2">Edit message</Text> */}

              <TextInput
                value={editText}
                onChangeText={setEditText}
                className="border border-gray-300 rounded-lg px-3 py-2"
                multiline
              />

              <View className="flex-row justify-end mt-4 gap-10">
                <TouchableOpacity onPress={() => setEditingMessage(null)}>
                  <Text className="text-gray-500 font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSaveEdit}>
                  <Text className="text-[#90717E] font-semibold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function AttachItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-4 px-5 py-4"
    >
      <Ionicons name={icon} size={22} color="#1D1B20" />
      <Text className="text-[16px] text-[#1D1B20]">{label}</Text>
    </TouchableOpacity>
  );
}
