// src/api/tokenStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

// Sync với key bạn đang dùng
export const ACCESS_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";
export const EXP_KEY = "accessExpiresAt"; // epoch ms (string)

export async function saveTokens(params: {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number | null; // epoch ms. Nếu backend không trả expiresIn, có thể decode từ JWT
}) {
  const { accessToken, refreshToken, expiresAt } = params;
  await AsyncStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
  if (typeof expiresAt === "number") {
    await AsyncStorage.setItem(EXP_KEY, String(expiresAt));
  }
}

export async function readTokens() {
  const [accessToken, refreshToken, expStr] = await Promise.all([
    AsyncStorage.getItem(ACCESS_KEY),
    AsyncStorage.getItem(REFRESH_KEY),
    AsyncStorage.getItem(EXP_KEY),
  ]);
  const expiresAt = expStr ? Number(expStr) : 0;
  return { accessToken, refreshToken, expiresAt };
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, EXP_KEY]);
}

export function isAccessValid(expiresAt: number, skewMs = 1000) {
  if (!expiresAt) return false;
  return Date.now() + skewMs < expiresAt;
}

// Nếu backend KHÔNG trả expiresIn, bạn có thể tính expiresAt từ JWT exp
export function expFromJwt(accessToken?: string | null): number | null {
  if (!accessToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
    if (payload?.exp) return payload.exp * 1000;
  } catch { }
  return null;
}

export function getUserIdFromToken(accessToken?: string | null): string | null {
  if (!accessToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
    return payload?.sub || null;
  } catch { }
  return null;
}
