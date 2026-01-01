import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function ChatBotSection() {
  const goToChatbot = () => {
    router.push("/(me)/ChatbotScreen");
  };

  return (
    <Pressable onPress={goToChatbot}>
      {/* pointerEvents="none" để click xuyên qua TextInput */}
      <View style={styles.container} pointerEvents="none">
        <TextInput
          placeholder="🤖 Hi! How can I assist you today?"
          style={styles.input}
          editable={false}
        />
        <TextInput
          placeholder="Ask me something..."
          style={styles.input}
          editable={false}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
  },
});
