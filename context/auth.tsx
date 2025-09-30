import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { useState } from "react";

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  email_verified?: boolean;
};

type Ctx = {
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
  error: Error | null;
};

const AuthContext = React.createContext<Ctx | null>(null);

const ANDROID_CLIENT_ID =
  "1067957663886-sk4rkd325o5ld38hvevbl91tujkn146a.apps.googleusercontent.com";
const IOS_CLIENT_ID = "";
const WEB_CLIENT_ID =
  "1067957663886-rqiovfuaqpsdeb8d42jmu104sri96her.apps.googleusercontent.com";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";
const ACCESS_KEY = "google_access_token";
const IDTOKEN_KEY = "google_id_token";
const REFRESH_KEY = "google_refresh_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // KHÔNG set redirectUri — provider sẽ tự dùng URI hợp lệ cho Android
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: ANDROID_CLIENT_ID, // Web Client ID từ Google Console
    scopes: ["profile", "email"],
  });

  const dump = (label: string, data: any) =>
    console.log(`${label}:`, JSON.stringify(data, null, 2));

  // Xử lý phản hồi
  React.useEffect(() => {
    const exchangeCodeForToken = async (code: string) => {
      try {
        const body = {
          code,
          client_id: ANDROID_CLIENT_ID,
          grant_type: "authorization_code",
          redirect_uri: request?.redirectUri,
          code_verifier: request?.codeVerifier,
        };
        const res = await fetch(TOKEN_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: Object.entries(body)
            .map(
              ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`
            )
            .join("&"),
        });
        const tokenData = await res.json();
        dump("Token response", tokenData);
        if (!tokenData.access_token)
          throw new Error("Không lấy được access_token");

        // Lưu token vào SecureStore
        await SecureStore.setItemAsync(ACCESS_KEY, tokenData.access_token);
        if (tokenData.id_token)
          await SecureStore.setItemAsync(IDTOKEN_KEY, tokenData.id_token);
        if (tokenData.refresh_token)
          await SecureStore.setItemAsync(REFRESH_KEY, tokenData.refresh_token);

        // Lấy thông tin user
        const userRes = await fetch(USERINFO_ENDPOINT, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userRes.json();
        dump("UserInfo", userInfo);
        setUser({
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          email_verified: userInfo.email_verified,
        });
      } catch (err: any) {
        setError(err);
        console.error("Lỗi khi trao đổi code lấy token/user:", err);
      }
    };

    if (!response) return;
    if (response.type === "success") {
      const { code } = response.params as any;
      if (code) {
        exchangeCodeForToken(code);
      } else {
        dump("Auth success nhưng thiếu code", response.params);
      }
    } else if (response.type === "error") {
      setError(response.error as Error);
      dump("AuthSession error params", (response as any).params);
    } else {
      dump("AuthSession raw response", response);
    }
  }, [response]);

  const signIn = async () => {
    try {
      if (!request) {
        console.warn("no request yet");
        return;
      }
      console.log("redirectUri app:", request.redirectUri);
      dump("PKCE", { codeVerifier: request.codeVerifier });

      const result = await promptAsync(); // mở trình duyệt hệ thống
      if (result.type === "error") {
        console.error("promptAsync error:", result.error);
        dump("promptAsync error params", (result as any).params);
      } else if (result.type !== "success") {
        console.warn("promptAsync finished with:", result.type);
        dump("promptAsync result", result);
      }
    } catch (e: any) {
      // Exception runtime (network, activity, v.v.)
      console.error("Exception trong signIn:", e?.message || e);
      dump("Exception object", e);
      setError(e);
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(IDTOKEN_KEY);
    setUser(null);
  };

  const fetchWithAuth = async (url: string, options?: RequestInit) => {
    const token = await SecureStore.getItemAsync(ACCESS_KEY);
    const headers = new Headers(options?.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, fetchWithAuth, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
