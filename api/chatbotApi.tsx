import axios from "axios";
import { Platform } from "react-native";
import axiosInstance from "./axiosConfig";

/* ===============================
   📦 Types
=============================== */

export type ChatbotSender = "USER" | "BOT";

export interface ChatbotContext {
  id: string;
  code: string;
  type: "PLAN" | string;
}

export interface ChatbotAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface ChatbotMessage {
  id: string;
  sender: ChatbotSender;
  message: string;
  createdAt: string;
  context?: ChatbotContext | null;
  attachments?: ChatbotAttachment[];
}

export interface ChatbotMessageListResponse {
  messages: ChatbotMessage[];
  total: number;
  nextCursor?: string | null;
}

export interface SendChatbotMessageRequest {
  prompt: string;
  contextId?: string;
  contextType?: "PLAN" | string;
}

/* ===============================
   📡 API (REST ONLY)
=============================== */

const chatbotApi = {
  /**
   * Wake up bot (health check)
   */
  async awakeBot() {
    return axios.get("https://studypal-ai-e2sp.onrender.com/awake");
  },

  /**
   * Get chat history
   */
  async getMessages(
    cursor?: string,
    size: number = 10
  ): Promise<ChatbotMessageListResponse> {
    const res = await axiosInstance.get("/chatbot/messages", {
      params: { cursor, size },
    });

    return res as unknown as ChatbotMessageListResponse;
  },

  /**
   * 🔔 Trigger send message (NO STREAM)
   * - dùng cho BE log / persist / idempotency
   * - KHÔNG đọc response
   */
  async sendMessage(
    payload: SendChatbotMessageRequest,
    idempotencyKey: string,
    files?: any[]
  ): Promise<void> {
    const formData = new FormData();
    const requestBody = JSON.stringify(payload);

    if (Platform.OS === "web") {
      formData.append(
        "request",
        new Blob([requestBody], {
          type: "application/json",
        })
      );
    } else {
      // React Native: Use the specific object format like in chatApi.ts
      formData.append("request", {
        string: requestBody,
        type: "application/json",
      } as any);
    }

    if (files?.length) {
      files.forEach((file) => {
        // Ensure file has necessary properties for RN if needed,
        // relying on caller passing correct file objects for now but appending directly
        formData.append("files", file as any);
      });
    }

    await axiosInstance.post("/chatbot/messages", formData, {
      headers: {
        "Idempotency-Key": idempotencyKey,
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data, headers) => {
        // React Native specific: Avoid axios serializing FormData
        return data;
      },
    });
  },

  async getUserQuotaUsage(): Promise<any> {
    const res = await axiosInstance.get("/chatbot/usage");
    return res;
  },
};

export default chatbotApi;
