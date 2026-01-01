// src/api/chatbotSSE.ts
import {
  clearTokens,
  expFromJwt,
  isAccessValid,
  readTokens,
  saveTokens,
} from "@/api/tokenStore";
import axios from "axios";
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
   TOKEN REFRESH HELPER
================================ */
async function refreshAccessToken(): Promise<string> {
  console.log("[ChatbotSSE] Starting token refresh...");
  // 1. Read refresh token directly
  const { refreshToken } = await readTokens();
  if (!refreshToken) {
    const err = new Error("No refresh token available");
    console.error("[ChatbotSSE] Refresh failed:", err.message);
    throw err;
  }

  // 2. Call refresh endpoint separate from main axios instance to avoid cycles
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/access`,
      { refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const data = res.data;
    const newAccess = data?.accessToken;

    if (!newAccess) {
      throw new Error("Refresh failed: No access token returned");
    }

    console.log("[ChatbotSSE] Token refresh successful.");

    // 3. Save new token
    const expAt = expFromJwt(newAccess) ?? Date.now() + 10 * 60 * 1000;
    await saveTokens({
      accessToken: newAccess,
      expiresAt: expAt,
      // Keep existing refresh token unless server rotated it
      refreshToken: data.refreshToken ?? refreshToken,
    });

    return newAccess;
  } catch (error: any) {
    console.error(
      "[ChatbotSSE] Token refresh network/server error:",
      error?.message || error
    );
    await clearTokens();
    throw error;
  }
}

async function getValidAccessToken(): Promise<string> {
  const tokens = await readTokens();
  let accessToken = tokens.accessToken;

  // If no token or expired, try refresh
  if (!accessToken || !isAccessValid(tokens.expiresAt || 0)) {
    console.log("[ChatbotSSE] Token expired or missing, attempting refresh...");
    accessToken = await refreshAccessToken();
  }

  return accessToken;
}

/* ===============================
   MAIN
================================ */
export async function sendChatbotSSE(options: SendSSEOptions) {
  try {
    const token = await getValidAccessToken();
    await connectSSE(options, token);
  } catch (error: any) {
    console.error(
      "[ChatbotSSE] sendChatbotSSE error:",
      error?.message || error
    );

    // 🚫 KHÔNG retry refresh cho SSE
    options.onError?.(error);
  }
}

/**
 * Internal function that handles the actual connection/request logic
 */
async function connectSSE(
  { payload, idempotencyKey, onChunk, onDone, onError }: SendSSEOptions,
  accessToken: string
) {
  // ===============================
  // 📦 FORM DATA SETUP
  // ===============================
  let body: FormData | string;
  const jsonString = JSON.stringify(payload);

  if (Platform.OS === "web") {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob([jsonString], { type: "application/json" })
    );
    body = formData;
  } else {
    // ✅ MOBILE: gửi JSON thuần
    body = jsonString;
  }

  // ===============================
  // 🌐 EXECUTION
  // ===============================
  if (Platform.OS === "web") {
    await streamWeb({
      url: `${BASE_URL}/chatbot/messages`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
        "Idempotency-Key": idempotencyKey,
      },
      body: body as FormData,
      onChunk,
      onDone,
      onError,
    });
  } else {
    await streamNative({
      url: `${BASE_URL}/chatbot/messages`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
        "Idempotency-Key": idempotencyKey,
      },
      body: body as string,
      onChunk,
      onDone,
      onError,
    });
  }
}

/* ===============================
   WEB IMPLEMENTATION
   (Standard fetch + ReadableStream)
================================ */
async function streamWeb({
  url,
  headers,
  body,
  onChunk,
  onDone,
  onError,
}: {
  url: string;
  headers: any;
  body: FormData;
  onChunk: OnChunk;
  onDone?: OnDone;
  onError?: OnError;
}) {
  let finished = false; // 🔑 đánh dấu stream đã DONE nghiệp vụ hay chưa

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (res.status === 401) {
      throw { status: 401, message: "Unauthorized" };
    }

    if (!res.ok) {
      throw new Error(`SSE failed: ${res.status}`);
    }

    if (!res.body) {
      throw new Error("No response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    // ✅ wrapper để đảm bảo onDone chỉ chạy 1 lần
    const markDone = () => {
      if (!finished) {
        finished = true;
        onDone?.();
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = processEvents(buffer, onChunk, markDone);
    }

    // 🛟 nếu server đóng stream mà không gửi [DONE]
    if (!finished) {
      markDone();
    }
  } catch (err: any) {
    // 🔥 QUAN TRỌNG: ignore network error sau khi stream đã DONE
    if (finished && err?.name === "TypeError") {
      console.log("[ChatbotSSE] Stream closed normally after DONE");
      return;
    }

    console.error("[ChatbotSSE] Web stream error:", err);
    onError?.(err);
  }
}

/* ===============================
   NATIVE IMPLEMENTATION
   (XMLHttpRequest for Partial Response)
================================ */
function streamNative({
  url,
  headers,
  body,
  onChunk,
  onDone,
  onError,
}: {
  url: string;
  headers: any;
  body: string;
  onChunk: OnChunk;
  onDone?: OnDone;
  onError?: OnError;
}) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    // Set headers
    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });

    let seenBytes = 0;
    let pendingBuffer = "";
    let isFinished = false;

    // Safety wrappers
    const safeOnDone = () => {
      if (!isFinished) {
        console.log("[ChatbotSSE] Native stream completing (SAFE DONE).");
        isFinished = true;
        onDone?.();
        resolve(); // <--- Resolve the main Promise here
      }
    };

    const safeOnError = (err: any) => {
      if (!isFinished) {
        console.error(
          "[ChatbotSSE] Native stream error (SAFE ERROR):",
          err.message
        );
        isFinished = true;
        onError?.(err);
        reject(err); // <--- Reject the main Promise
      }
    };

    // Helper to read any new data from responseText safely
    const readLatest = () => {
      try {
        const newData = xhr.responseText.substring(seenBytes);
        if (newData.length > 0) {
          seenBytes = xhr.responseText.length;
          pendingBuffer += newData;
        }
      } catch (e) {
        // ignore access errors on some states/engines
      }
    };

    // Helper to flush remaining buffer
    const tryFlush = () => {
      readLatest(); // Ensure we have the latest bits from responseText

      if (!isFinished && pendingBuffer.trim()) {
        console.log("[ChatbotSSE] flushing remaining buffer (tryFlush)...");
        // Force process potential final chunk
        processEvents(pendingBuffer + "\n\n", onChunk, safeOnDone);
      }
    };

    xhr.onreadystatechange = () => {
      try {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          if (isFinished) return;

          // Accessing status in state 3 might throw on some engines
          let status = 0;
          try {
            status = xhr.status;
          } catch (e) {
            // ignore
          }
          if (status === 401) {
            if (isFinished) {
              // 🟢 expected behavior after stream cleanup
              console.log(
                "[ChatbotSSE] Native stream 401 after DONE (ignored)"
              );
              return;
            }
            // 🔴 401 TRƯỚC DONE = lỗi thật
            console.error("[ChatbotSSE] Native stream 401 Unauthorized");
            xhr.abort();
            isFinished = true;
            reject({ status: 401, message: "Unauthorized" });
            return;
          }

          // Just allow 200 or 0 (loading)
          if (status !== 200 && status !== 0) {
            // For state 3, we just skip parsing if status looks weird
            if (xhr.readyState === 4 && status !== 0) {
              // Let the state 4 logic handle error reporting
            } else {
              return; // Ignore weird status updates in state 3
            }
          }

          // Normal processing
          readLatest();
          if (pendingBuffer) {
            pendingBuffer = processEvents(pendingBuffer, onChunk, safeOnDone);
          }
        }

        if (xhr.readyState === 4) {
          if (isFinished) return;

          let status = 0;
          try {
            status = xhr.status;
          } catch (e) {}

          // Try to flush whatever we have first, regardless of status
          // This rescues cases where status=0 but we got the final data
          tryFlush();

          if (isFinished) return; // If flush triggered DONE, stop.

          if (status >= 200 && status < 300) {
            // If we haven't seen [DONE] yet, but request finished successfully, assume done.
            safeOnDone();
          } else if (status === 0) {
            // ⚠️ Mobile: status 0 = server closed stream
            console.log(
              "[ChatbotSSE] Native stream closed with status 0 (treated as DONE)"
            );
            safeOnDone();
          } else if (status !== 401) {
            safeOnError(new Error(`Request finished with status ${status}`));
          }
        }
      } catch (err: any) {
        console.error("[ChatbotSSE] onreadystatechange crashed:", err);
        safeOnError(err);
      }
    };

    xhr.onerror = () => {
      if (!isFinished) {
        // Attempt flush here too
        tryFlush();
        if (!isFinished) {
          console.error("[ChatbotSSE] xhr.onerror fired");
          safeOnError(new Error("Network Error (xhr.onerror)"));
        }
      }
    };

    xhr.send(body);
  });
}

/* ===============================
   EVENT PARSER
================================ */
function processEvents(
  buffer: string,
  onChunk: OnChunk,
  onDone?: OnDone
): string {
  // Normalize CRLF to LF to handle \r\n from some servers
  const normalized = buffer.replace(/\r\n/g, "\n");

  const events = normalized.split("\n\n");
  const remainder = events.pop() || "";

  for (const raw of events) {
    if (!raw.trim()) continue;

    let event = "";
    let data = "";

    const lines = raw.split("\n");
    for (const line of lines) {
      if (line.startsWith("event:")) {
        event = line.replace("event:", "").trim();
      }
      if (line.startsWith("data:")) {
        data += line.replace("data:", "").trim();
      }
    }

    if (data === "[DONE]") {
      console.log("[ChatbotSSE] [DONE] signal detected.");
      onDone?.();
      continue;
    }

    if (event === "message" || (!event && data)) {
      try {
        const json = JSON.parse(data);

        // 🛠 Fix: Per user spec, reply === "" means stream finished
        if (json?.reply === "") {
          console.log("[ChatbotSSE] Empty reply detected -> Stream DONE.");
          onDone?.(); // Trigger success
          continue; // Skip processing this empty chunk
        }

        const chunk = json?.reply ?? "";
        if (chunk) {
          // Guard user callback
          try {
            onChunk(chunk);
          } catch (cbErr) {
            console.error("[ChatbotSSE] User onChunk callback crashed:", cbErr);
          }
        }
      } catch (e) {
        // Only warn if it looks like there was data to parse
        if (data.trim() && data !== "[DONE]") {
          console.warn(
            "[ChatbotSSE] JSON Parse error on chunk:",
            data.slice(0, 50),
            e
          );
        }
      }
    }
  }

  return remainder;
}
