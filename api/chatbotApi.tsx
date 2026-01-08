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

    if (files?.length) {
      files.forEach((file) => {
        formData.append("files", file as any);
      });
    }

    await axiosInstance.post("/chatbot/messages", formData, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },
};

export default chatbotApi;
