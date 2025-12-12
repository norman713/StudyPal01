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

const userApi = {
    getById(userId: string): Promise<UserProfile> {
        const url = `/users/${userId}`;
        return axiosInstance.get(url);
    },
    getSummary(): Promise<UserSummary> {
        const url = "/users/summary";
        return axiosInstance.get(url);
    },
};

export default userApi;
