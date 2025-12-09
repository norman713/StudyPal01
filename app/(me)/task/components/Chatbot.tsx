import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function ChatBotSection() {
  return (
    <View style={styles.container}>
      {/* <Image
        source={require("../../../assets/bot.png")}
        style={styles.avatar}
      /> */}
      <TextInput
        placeholder="🤖 Hi! How can I assist you today?"
        style={styles.input}
      />
      <TextInput placeholder="Ask me something..." style={styles.input} />
    </View>
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
  avatar: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
});
