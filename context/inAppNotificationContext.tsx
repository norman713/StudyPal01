import React, {
  createContext,
  useContext,
  useState,
} from 'react';

type InAppMessage = {
  title?: string;
  body?: string;
};

type InAppNotificationContextType = {
  message: InAppMessage | null;
  showMessage: (msg: InAppMessage) => void;
  clearMessage: () => void;
};

const InAppNotificationContext =
  createContext<InAppNotificationContextType>(null as any);

export function InAppNotificationProvider( {children,
}: {
  children: React.ReactNode;
}) {
  const [message, setMessage] = useState<InAppMessage | null>(null);

  function showMessage(msg: InAppMessage) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  function clearMessage() {
    setMessage(null);
  }

  return (
    <InAppNotificationContext.Provider value={{ message, showMessage, clearMessage }}>
      {children}
    </InAppNotificationContext.Provider>
  );
}

export function useInAppNotification() {
  const context = useContext(InAppNotificationContext);

  if (!context) {
    throw new Error(
      'useInAppNotification must be used within InAppNotificationProvider'
    );
  }

  return context;
}

