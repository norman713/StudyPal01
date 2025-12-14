import axiosInstance from "./axiosConfig";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
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
};

export default userApi;
