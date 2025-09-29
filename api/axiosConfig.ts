import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiUrl,            
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = (config.url || "").toLowerCase();

    // endpoint for auth public (no Bearer)
    const isAuthPublic =
      url.includes("/auth/cred") ||
      url.includes("/auth/register") ||
      url.includes("/auth/verify/register") ||
      url.includes("/auth/verify/reset") ||
      url.includes("/auth/reset") ||
      url.includes("/auth/validate") ||
      url.includes("/auth/code") ||
      url.includes("/auth/prov");

    if (!isAuthPublic) {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
      }
    } else {

      if (config.headers && "Authorization" in config.headers) {
        delete (config.headers as Record<string, unknown>)["Authorization"];
      }
    }

    console.log(
      "Request:",
      config.method?.toUpperCase(),
      (config.baseURL || "") + (config.url || ""),
      "Auth:",
      (config.headers as any)?.Authorization ? "Bearer..." : "none",
      "withCredentials:",
      config.withCredentials
    );

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// return data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => Promise.reject(error)
);

export default axiosInstance;