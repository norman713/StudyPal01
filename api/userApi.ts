import { Platform } from "react-native";
import axiosInstance from "./axiosConfig";
import { readTokens } from "./tokenStore";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "UNSPECIFIED" | null;
  avatarUrl: string | null;
}

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Search Users
 */
export interface SearchUsersRequest {
  keyword: string;
  cursor?: string;
  size?: number;
}

export interface SearchUsersResponse {
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }>;
  nextCursor: string | null;
}

const userApi = {
  /**
   * Get user profile by id
   * GET /api/users/{id}
   */
  getById(userId: string): Promise<UserProfile> {
    const url = `/users/${userId}`;
    return axiosInstance.get(url);
  },

  /**
   * Get current user summary
   * GET /api/users/summary
   */
  getSummary(): Promise<UserSummary> {
    const url = "/users/summary";
    return axiosInstance.get(url);
  },

  /**
   * Search users by name or email
   * GET /api/users/search
   */
  searchUsers(
    params: SearchUsersRequest
  ): Promise<SearchUsersResponse> {
    const url = "/users/search";
    return axiosInstance.get(url, { params });
  },

  /**
   * Update user profile
   * PATCH /api/users
   */
  async updateUser(data: {
    name?: string;
    avatar?: any;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "UNSPECIFIED";
  }): Promise<UserProfile> {
    const formData = new FormData();

    const requestBody: any = {};
    if (data.name) requestBody.name = data.name;
    if (data.dateOfBirth) requestBody.dateOfBirth = data.dateOfBirth;
    if (data.gender) requestBody.gender = data.gender;

    console.log("API updateUser requestBody:", JSON.stringify(requestBody));

    if (Platform.OS === "web") {
      formData.append(
        "request",
        new Blob([JSON.stringify(requestBody)], {
          type: "application/json",
        })
      );
    } else {
      // Mobile: Use Typed Object with fetch.
      // fetch + { string: ..., type: 'application/json' } ensures the part has correct Content-Type.
      formData.append("request", {
        string: JSON.stringify(requestBody),
        type: "application/json",
      } as any);
    }

    if (data.avatar) {
      const fileName = data.avatar.fileName || "avatar.jpg";
      const fileType = data.avatar.mimeType || "application/octet-stream";

      console.log("Uploading avatar:", {
        uri: data.avatar.uri,
        name: fileName,
        type: fileType,
      });

      if (Platform.OS === "web") {
        const response = await fetch(data.avatar.uri);
        const blob = await response.blob();
        formData.append("file", blob, fileName);
      } else {
        formData.append("file", {
          uri: data.avatar.uri,
          name: fileName,
          type: fileType,
        } as any);
      }
    }

    // Use fetch for manual control
    const { accessToken } = await readTokens();
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users`;

    console.log("Sending PATCH to:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        // fetch automatically sets Content-Type: multipart/form-data; boundary=...
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.log("Update profile failed:", response.status, text);
      throw new Error(`Update failed: ${response.status} ${text}`);
    }

    return await response.json();
  }
};

export default userApi;
