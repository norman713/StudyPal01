import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#90717E";

type Message = {
  id: string;
  text: string;
  time: string;
  user: string;
  image?: string; // Optional image for the message
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
    image: "https://i.pravatar.cc/150?img=7", // Example image for Ditto's message
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

  const handleSend = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage(""); // Clear the input field after sending
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.teamTitle}>This is pokemon world</Text>
        <View style={styles.membersCount}>
          <Text style={styles.membersText}>8 members</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.chatArea}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.user === "Pikachu"
                ? styles.pikachuMessage
                : styles.dittoMessage,
            ]}
          >
            <View style={styles.messageHeader}>
              <Image
                source={{
                  uri: message.image || "https://i.pravatar.cc/150?img=1",
                }}
                style={styles.avatar}
              />
              <Text style={styles.messageTime}>{message.time}</Text>
            </View>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.textInput}
          placeholder="Ask anything"
          placeholderTextColor="#B8B8B8"
        />
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={24} color={ACCENT} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: ACCENT,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  membersCount: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  membersText: { color: "#000", fontSize: 12 },

  chatArea: { flex: 1, padding: 10 },

  message: {
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  pikachuMessage: { backgroundColor: "#E9C8D3" },
  dittoMessage: { backgroundColor: "#D3E9E3" },

  messageHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  messageTime: { fontSize: 10, color: "#B8B8B8" },

  messageText: { color: "#000", fontSize: 14 },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    fontSize: 14,
  },
});
