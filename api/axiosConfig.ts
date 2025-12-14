
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { clearTokens, expFromJwt, readTokens, REFRESH_KEY, saveTokens } from "./tokenStore";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// ---- Tạo 2 client ----
// - axiosInstance: client chính (có interceptor attach token, retry sau refresh)
// - refreshClient: client "sạch" dùng gọi /auth/refresh (tránh loop interceptor)
const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---- Các endpoint không cần Bearer ----
function isAuthPublic(url?: string | null) {
  const u = (url || "").toLowerCase();
  return (
    u.includes("/auth/cred") ||
    u.includes("/auth/register") ||
    u.includes("/auth/verify/register") ||
    u.includes("/auth/verify/reset") ||
    u.includes("/auth/reset") ||
    u.includes("/auth/validate") ||
    u.includes("/auth/code") ||
    u.includes("/auth/prov") ||
    u.includes("/auth/access")
  );
}

// ---- Singleton refresh để chống race ----
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

// ---- Request Interceptor: attach Bearer (nếu không phải public) ----
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!isAuthPublic(config.url)) {
      const { accessToken } = await readTokens();
      if (accessToken) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
      }
    } else if (config.headers && "Authorization" in config.headers) {
      delete (config.headers as Record<string, unknown>)["Authorization"];
    }

    // logging nhẹ
    // if (__DEV__) {
    //   console.log(
    //     "Request:",
    //     config.method?.toUpperCase(),
    //     (config.baseURL || "") + (config.url || ""),
    //     "Auth:",
    //     (config.headers as any)?.Authorization ? "Bearer..." : "none",
    //     "withCredentials:",
    //     config.withCredentials
    //   );
    // }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ---- Response Interceptor: auto refresh khi 401 và retry 1 lần ----
axiosInstance.interceptors.response.use(
  // Trả thẳng response.data như bạn đang dùng
  (response) => response.data,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { __retry?: boolean };

    // Không có response hoặc không phải 401 → trả lỗi luôn
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // 401 cho endpoint public thì cũng không retry
    if (isAuthPublic(original?.url)) {
      return Promise.reject(error);
    }

    // Tránh lặp vô hạn: chỉ retry 1 lần
    if (original.__retry) {
      // Lần thứ 2 vẫn 401 → clear tokens, reject
      await clearTokens();
      return Promise.reject(error);
    }
    original.__retry = true;

    // Nếu đang refresh → chờ refresh xong
    if (isRefreshing) {
      const newToken = await new Promise<string | null>((resolve) => pendingQueue.push(resolve));
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        // gọi lại bằng client chính → sẽ lại qua success interceptor (trả .data)
        return axiosInstance(original);
      } else {
        await clearTokens();
        return Promise.reject(error);
      }
    }

    // Chạy refresh
    try {
      isRefreshing = true;

      const [refreshToken] = await Promise.all([
        AsyncStorage.getItem(REFRESH_KEY),
      ]);

      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      // Gọi /auth/access bằng refreshClient (không interceptor)
      const res = await refreshClient.post("/auth/access", { refreshToken });

      // Chuẩn hoá data
      // API response: { accessToken: "..." }
      const payload = (res as any).data ?? res;
      const newAccess: string = payload.accessToken;

      if (!newAccess) {
        throw new Error("Refresh response missing accessToken");
      }

      // Tính expiresAt từ JWT (vì API này không trả expiresIn)
      const expAt = expFromJwt(newAccess) ?? Date.now() + 10 * 60 * 1000; // fallback 10 phút

      // Lưu lại token (giữ nguyên refreshToken cũ)
      await saveTokens({
        accessToken: newAccess,
        expiresAt: expAt,
      });

      // Báo cho queue
      resolveQueue(newAccess);

      // Gắn token mới rồi retry request cũ
      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = `Bearer ${newAccess}`;
      return axiosInstance(original);
    } catch (e) {
      // Refresh thất bại → clear token và reject
      await clearTokens();
      resolveQueue(null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
