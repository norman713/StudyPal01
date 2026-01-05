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
        const response = await axiosClient.get(
            `/teams/${teamId}/messages`,
            { params }
        );
        return response;
    },

    sendMessage: async (
        teamId: string,
        content: string,
        file?: any
    ): Promise<void> => {
        const formData = new FormData();

        // The backend expects a JSON string for the "request" part
        // If content is empty/undefined (e.g. file only), send empty object {}
        const requestObj = (content && content.trim().length > 0) ? { content } : {};
        const requestBody = JSON.stringify(requestObj);

        if (Platform.OS === 'web') {
            // Web: Use Blob to set content type
            const blob = new Blob([requestBody], { type: 'application/json' });
            formData.append("request", blob);
        } else {
            // React Native: Use the specific object format
            formData.append("request", {
                string: requestBody,
                type: "application/json",
            } as any);
        }

        console.log("--- Sending Message Payload ---");
        console.log("Request Part (JSON):", requestBody);

        if (file) {
            // React Native file object standard: { uri, name, type }
            const fileObj = {
                uri: file.uri,
                name: file.name || "upload.jpg",
                type: file.type || "image/jpeg",
            };
            console.log("File Part:", fileObj);
            formData.append("files", fileObj as any);
        } else {
            console.log("File Part: None");
        }
        console.log("-------------------------------");

        try {
            await axiosClient.post(`/teams/${teamId}/messages`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                transformRequest: (data, headers) => {
                    // React Native specific: Avoid axios serializing FormData
                    return data;
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
};
