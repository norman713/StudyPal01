import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import messaging from '@react-native-firebase/messaging';

type NotificationContextType = {
  fcmToken: string | null;
  refreshFcmToken: () => Promise<string | null>;
  clearNotification: () => Promise<void>;
};

const NotificationContext =
  createContext<NotificationContextType>(null as any);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    getAndSaveToken();
  }, []);

  async function clearNotification() {
    try {
      await messaging().deleteToken();
    } catch (e) {
      console.log('Delete token error', e);
    }
    setFcmToken(null);
  }

  async function getAndSaveToken() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return null;

    const token = await messaging().getToken();
    setFcmToken(token);
    console.log(token);
    return token;
  }

  async function refreshFcmToken() {
    const token = await messaging().getToken();
    setFcmToken(token);
    return token;
  }

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(token => {
      setFcmToken(token);
    });

    return unsubscribe;
  }, []);

  return (
    <NotificationContext.Provider
      value={{ fcmToken, refreshFcmToken, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
