import { Platform } from "react-native";
import axiosClient from "./axiosConfig";

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: "IMAGE" | "FILE";
}

export interface MessageUser {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface Message {
    id: string;
    user: MessageUser; // Nested user object from backend
    content: string;
    attachments: Attachment[];
    createdAt: string;
    updatedAt: string;
    readBy: MessageUser[];
    isDeleted: boolean;
}
export interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

export interface EditMessageResponse {
  success: boolean;
  message: string;
}
export interface EditMessageRequest {
  content: string;
}

export interface GetMessagesResponse {
    messages: Message[];
    total: number;
    nextCursor: string | null;
}

export const chatApi = {
    getMessages: async (
        teamId: string,
        size: number = 20,
        cursor?: string
    ): Promise<GetMessagesResponse> => {
        const params: any = { size };
        if (cursor) {
            params.cursor = cursor;
        }
        const response: GetMessagesResponse = await axiosClient.get(
            `/teams/${teamId}/messages`,
            { params }
        );
        return response;
    },

    sendMessage: async (
        teamId: string,
        content?: string,
        options?: {
            mentionType?: "ALL" | "CUSTOM";
            memberIds?: string[];
        },
        file?: any
    ): Promise<void> => {
        const formData = new FormData();

        const requestObj: any = {};

        if (content && content.trim().length > 0) {
            requestObj.content = content;
        }

        if (options?.memberIds?.length) {
            requestObj.mentionType = options.mentionType;
            requestObj.memberIds = options.memberIds;
        }else if (options?.mentionType == "ALL"){
            requestObj.mentionType = options.mentionType;
        }
        const requestBody = JSON.stringify(requestObj);

        if (Platform.OS === 'web') {
            const blob = new Blob([requestBody], { type: 'application/json' });
            formData.append("request", blob);
        } else {
            formData.append("request", {
                string: requestBody,
                type: "application/json",
            } as any);
        }

        console.log("Request Part (JSON):", requestBody);

        if (file) {
            formData.append("files", {
                uri: file.uri,
                name: file.name ?? "upload.jpg",
                type: file.type ?? "image/jpeg",
            } as any);
        } else {
            console.log("File Part: None");
        }

        try {
            await axiosClient.post(`/teams/${teamId}/messages`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Message sent successfully!");
            
        } catch (error: any) {
            console.error("--- Send Message Error ---");
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", JSON.stringify(error.response.data, null, 2));
                console.error("Headers:", JSON.stringify(error.response.headers, null, 2));
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error Message:", error.message);
            }
            console.error("--------------------------");
            throw error;
        }
    },

    markMessageRead: async (messageId: string): Promise<void> => {
        await axiosClient.patch(`/messages/${messageId}/mark`);
    },

    deleteMessage: async (messageId: string): Promise<DeleteMessageResponse> => {
        const url = `/messages/${messageId}`;
        const data: DeleteMessageResponse = await axiosClient.delete(url);
        return data;
    },

editMessage: async (
  messageId: string,
  content: string
): Promise<EditMessageResponse> => {
  const url = `/messages/${messageId}`;

  const body: EditMessageRequest = {
    content,
  };

  const data: EditMessageResponse = await axiosClient.patch(url, body);
  return data;
},



};
