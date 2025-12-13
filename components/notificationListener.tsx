// components/NotificationListener.tsx
import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { useInAppNotification } from "@/context/inAppNotificationContext";

export function NotificationListener() {
  const { showMessage } = useInAppNotification();

  useEffect(() => {
    const unsubscribe = messaging().onMessage(msg => {
      showMessage({
        title: msg.notification?.title,
        body: msg.notification?.body,
      });
    });

    return unsubscribe;
  }, []);

  return null;
}
