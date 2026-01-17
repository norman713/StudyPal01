import { useInAppNotification } from "@/context/inAppNotificationContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function NotificationBanner() {
  const { message } = useInAppNotification();
  const router = useRouter();

  if (!message) return null;
  console.log("MEEEEEEE TYPE:", message);

  // Function to handle redirection based on notification type
  const handleRedirect = () => {
    if (message.type === "INVITATION") {
      router.push("/(noti)/invite");
    } else if (message.type === "TEAM") {
      router.push({
        pathname: "/(team)/teamInfo",
        params: { id: message.id },
      });
    } else if (message.type === "CHAT") {
      router.push({
        pathname: "/(team)/chat",
        params: { id: message.id },
      });
    } else if (message.type === "TASK") {
      router.push({
        pathname: "/(me)",
        params: { id: message.id },
      });
    } else if (message.type === "PLAN") {
      router.push({
        pathname: "/(team)/plan/planDetail",
        params: { id: message.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleRedirect}>
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.body}>{message.body}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 30,
    left: 0,
    width: "100%",
    backgroundColor: "#F8F6F7",
    borderRadius: 10,
    padding: 12,
    zIndex: 999,
    elevation: 6,
  },
  title: {
    color: "#0F0C0D",
    fontWeight: "600",
  },
  body: {
    color: "#0F0C0D",
    marginTop: 2,
  },
});
