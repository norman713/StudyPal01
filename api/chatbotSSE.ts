// src/api/chatbotSSE.ts
import {
    expFromJwt,
    isAccessValid,
    readTokens,
    saveTokens,
} from "@/api/tokenStore";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/* ===============================
   Types
================================ */
export type OnChunk = (chunk: string) => void;
export type OnDone = () => void;
export type OnError = (error: any) => void;

interface SendSSEOptions {
  payload: {
    prompt: string;
    contextId?: string;
    contextType?: string;
  };
  idempotencyKey: string;
  onChunk: OnChunk;
  onDone?: OnDone;
  onError?: OnError;
}

/* ===============================
   MAIN
================================ */
export async function sendChatbotSSE({
  payload,
  idempotencyKey,
  onChunk,
  onDone,
  onError,
}: SendSSEOptions) {
  let accessToken: string | null = null;

  try {
    // ===============================
    // 🔐 ENSURE VALID ACCESS TOKEN
    // ===============================
const tokens = await readTokens();

if (!tokens.accessToken) {
  throw new Error("Unauthorized");
}

let accessToken = tokens.accessToken;

// fallback: decode exp nếu chưa có
let expiresAt = tokens.expiresAt;
if (!expiresAt) {
  const exp = expFromJwt(accessToken);
  if (exp) {
    expiresAt = exp;
    await saveTokens({ accessToken, expiresAt });
  }
}

// ❌ KHÔNG refresh trong SSE
if (!isAccessValid(expiresAt)) {
  throw new Error("Access token expired");
}

    // ===============================
    // 📦 multipart/form-data
    // ===============================
    const formData = new FormData();

    if (Platform.OS === "web") {
      formData.append(
        "request",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        })
      );
    } else {
      formData.append("request", JSON.stringify(payload));
    }

    // ===============================
    // 🌐 FETCH SSE
    // ===============================
    const res = await fetch(`${BASE_URL}/chatbot/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
        "Idempotency-Key": idempotencyKey,
      },
      body: formData,
    });

    if (!res.ok || !res.body) {
      throw new Error(`SSE failed: ${res.status}`);
    }

    // ===============================
    // 🔁 STREAM PARSER
    // ===============================
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const raw of events) {
        let event = "";
        let data = "";

        for (const line of raw.split("\n")) {
          if (line.startsWith("event:")) {
            event = line.replace("event:", "").trim();
          }
          if (line.startsWith("data:")) {
            data += line.replace("data:", "").trim();
          }
        }

        if (event === "message" && data) {
          try {
            const json = JSON.parse(data);
            const chunk = json?.reply ?? "";
            if (chunk) onChunk(chunk);
          } catch {
            // ignore malformed chunk
          }
        }

        if (data === "[DONE]") {
          onDone?.();
          return;
        }
      }
    }

    onDone?.();
  } catch (err: any) {
    const msg = String(err?.message || err);

    // ⚠️ browser SSE close bug → ignore
    if (
      msg.includes("ERR_INCOMPLETE_CHUNKED_ENCODING") ||
      msg.includes("network error")
    ) {
      onDone?.();
      return;
    }

    console.error("❌ SSE error:", err);
    onError?.(err);
  }
}
