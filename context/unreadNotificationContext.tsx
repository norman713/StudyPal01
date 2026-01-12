import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { readTokens } from "@/api/tokenStore";
import { NotificationItem } from "@/api/notiApi";
import notificationApi from "@/api/notiApi";
import { useAuth } from "./auth";

interface UnreadNotificationContextValue {
  unreadNotificationCount: number;
  addNotification: () => void;
  clearUnread: (marked: number) => void,   
}

const UnreadNotificationContext = createContext<UnreadNotificationContextValue>({
  unreadNotificationCount: 0,
  addNotification: () => {},
  clearUnread: (_: number) => {},
});

export function UnreadNotificationProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadNotificationList, setUnreadNotificationList] = useState<NotificationItem[]>([]);
  const { accessToken } = useAuth();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const addNotification = () => {
    setUnreadNotificationCount(c => c+1);
  }

  const clearUnread = (marked: number) => {
    setUnreadNotificationCount(c => Math.max(0, c-marked));
  };

  useEffect(() => {
    const init = async () => {
      const res = await notificationApi.getUnreadCount();
      setUnreadNotificationCount(res.count);
    };
    init();
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    console.log("WS effect run, accessToken =", accessToken);

    const connect = async () => {
      if (!accessToken) return;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      ws = new WebSocket(
        `ws://103.211.201.112:8080/ws/notification?access_token=${accessToken}`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Unread notification WS connected");
      };

      ws.onmessage = (e) => {
        addNotification();
      };

      ws.onerror = (e) => {
        console.error("WS error", e);
      };

      ws.onclose = () => {
        console.log("Unread notification WS closed");
      };
    };

    connect();

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, [accessToken]);

  return (
    <UnreadNotificationContext.Provider value={{ unreadNotificationCount,
                                                 addNotification,
                                                 clearUnread}}>
      {children}
    </UnreadNotificationContext.Provider>
  );
}

export const useUnreadNotification = () => useContext(UnreadNotificationContext);
