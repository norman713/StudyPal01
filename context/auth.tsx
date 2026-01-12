import { clearTokens, getUserIdFromToken, readTokens } from "@/api/tokenStore";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* =======================
   TYPES
======================= */

type AuthState = {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  accessToken: string | null;
  logout: () => Promise<void>;
  refreshFromStorage: () => Promise<void>;
};

/* =======================
   CONTEXT
======================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* =======================
   PROVIDER
======================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const lastTokenRef = useRef<string | null>(null);

  /* =======================
     LOAD TOKEN INIT
  ======================= */
  const refreshFromStorage = async () => {
    const { accessToken } = await readTokens();

    setAccessToken(accessToken ?? null);

    if (!accessToken) {
      setUserId(null);
      setIsAuthenticated(false);
      return;
    }

    const uid = getUserIdFromToken(accessToken);
    setUserId(uid);
    setIsAuthenticated(true);
  };

  /* =======================
     LOGOUT
  ======================= */
  const logout = async () => {
    await clearTokens();
    setUserId(null);
    setIsAuthenticated(false);
  };

  /* =======================
     INIT
  ======================= */
  useEffect(() => {
    (async () => {
      await refreshFromStorage();
      setIsLoading(false);
    })();
  }, []);

  /* =======================
     WATCH TOKEN CHANGE
     (polling nhẹ)
  ======================= */
  useEffect(() => {
    const interval = setInterval(async () => {
      const { accessToken } = await readTokens();
      setAccessToken(accessToken ?? null);

      if (lastTokenRef.current !== accessToken) {
        lastTokenRef.current = accessToken;

        if (!accessToken) {
          setUserId(null);
          setIsAuthenticated(false);
        } else {
          const uid = getUserIdFromToken(accessToken);
          setUserId(uid);
          setIsAuthenticated(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        isAuthenticated,
        isLoading,
        accessToken,
        logout,
        refreshFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   HOOK
======================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
