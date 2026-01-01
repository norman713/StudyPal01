import axios from "axios";
import { Platform } from "react-native";
import axiosInstance from "./axiosConfig";
/* ===============================
   📦 Types
=============================== */

/**
 * Sender of message
 */
export type ChatbotSender = "USER" | "BOT";

/**
 * Context attached to message (ví dụ PLAN)
 */
export interface ChatbotContext {
  id: string;
  code: string;
  type: "PLAN" | string;
}

/**
 * Attachment info
 */
export interface ChatbotAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
}

/**
 * Message item returned from backend
 */
export interface ChatbotMessage {
  id: string;
  sender: ChatbotSender;
  message: string;
  createdAt: string;
  context?: ChatbotContext | null;
  attachments?: ChatbotAttachment[];
}

/**
 * GET /api/chatbot/messages response
 */
export interface ChatbotMessageListResponse {
  messages: ChatbotMessage[];
  total: number;
  nextCursor?: string | null;
}

/**
 * POST /api/chatbot/messages request payload
 */
export interface SendChatbotMessageRequest {
  prompt: string;
  contextId?: string;
  contextType?: "PLAN" | string;
}

/**
 * POST /api/chatbot/messages response
 * Swagger trả [{}] vì response thực tế là stream
 * → FE không dùng response body
 */
export type SendChatbotMessageResponse = Record<string, any>;

/* ===============================
   📡 API
=============================== */

const chatbotApi = {
  /**
   * Get chatbot messages (cursor pagination)
   */
  async awakeBot() {
    return axios.get("https://studypal-ai-e2sp.onrender.com/awake");
  },

  async getMessages(
    cursor?: string,
    size: number = 10
  ): Promise<ChatbotMessageListResponse> {
    const url = "/chatbot/messages";
    const params = { cursor, size };

    const res = (await axiosInstance.get(url, {
      params,
    })) as ChatbotMessageListResponse;

    return res;
  },

  /**
   * Send message to chatbot
   * - multipart/form-data
   * - required Idempotency-Key header
   * - response is streamed (ignore response body)
   */
  async sendMessage(
    payload: SendChatbotMessageRequest,
    idempotencyKey: string,
    files?: any[]
  ) {
    const formData = new FormData();

    // request field
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

    // attachments (optional)
    if (files?.length) {
      files.forEach((file) => {
        formData.append("files", file as any);
      });
    }

    return axiosInstance.post("/chatbot/messages", formData, {
      headers: {
        "Idempotency-Key": idempotencyKey,
        Accept: "text/event-stream",
      },
      responseType: "text", // ⚠️ luôn là text
    });
  },
};

export default chatbotApi;
