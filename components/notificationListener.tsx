import { useInAppNotification } from "@/context/inAppNotificationContext";
import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";

export function NotificationListener() {
  const { showMessage } = useInAppNotification();

  useEffect(() => {
    const unsubscribe = messaging().onMessage((msg) => {
      showMessage({
        title: msg.notification?.title,
        body: msg.notification?.body,
      });
    });

    return unsubscribe;
  }, []);

  return null;
}
