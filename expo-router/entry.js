import messaging from "@react-native-firebase/messaging";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("🌙 Background message:", remoteMessage);
});

import "expo-router/entry";
