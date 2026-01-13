import { Platform } from "react-native";
import axiosInstance from "./axiosConfig";
import { readTokens } from "./tokenStore";

export interface Team {
  id: string;
  name: string;
  avatarUrl?: string;
  owner: boolean;
}
export interface TeamNotificationSetting {
  id: string;
  teamNotification: boolean;
  teamPlanReminder: boolean;
  chatNotification: boolean;
}
export interface TeamMemberTaskStatistic {
  userId: string;
  name: string;
  avatarUrl?: string;
  completedTaskCount: number;
}

export interface SearchTeamTaskStatisticsResponse {
  statistics: TeamMemberTaskStatistic[];
  total: number;
  nextCursor?: string | null;
}

export interface TeamListResponse {
  teams: Team[];
  total: number;
  nextCursor?: string | null;
}

export interface TeamInfoResponse {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  avatarUrl?: string;
  description?: string;
  totalMembers: number;
}

export interface CreateTeamResponse {
  id: string;
  name: string;
  description: string;
}
export interface TeamPreviewResponse {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  totalMembers: number;
}

export interface TeamTaskStatisticsResponse {
  total: number;
  unfinished: number;
  low: number;
  medium: number;
  high: number;
}

const teamApi = {
  async getTaskStatistics(teamId: string, fromDate: string, toDate: string, memberId?: string): Promise<TeamTaskStatisticsResponse> {
    const url = `/teams/${teamId}/tasks/statistics`;
    const body = { fromDate, toDate, memberId };
    const data: TeamTaskStatisticsResponse = await axiosInstance.post(url, body);
    return data;
  },

  async getPreviewByCode(teamCode: string): Promise<TeamPreviewResponse> {
    const url = `/teams/${teamCode}/preview`;
    const data: TeamPreviewResponse = await axiosInstance.get(url);
    return data;
  },

  async searchTeams(
    filter: "JOINED" | "OWNED",
    keyword?: string,
    cursor?: string,
    size: number = 10
  ): Promise<TeamListResponse> {
    const url = "/teams/search";
    const params = { filter, keyword, cursor, size };

    const data: TeamListResponse = await axiosInstance.get(url, { params });
    return data;
  },



  async create(name: string, description: string): Promise<CreateTeamResponse> {
    const url = "/teams";
    const res = (await axiosInstance.post(url, { name, description })) as CreateTeamResponse;
    return res;
  },



  async getInfo(teamId: string): Promise<TeamInfoResponse> {
    const url = `/teams/${teamId}`;
    const res = await axiosInstance.get(url);
    return res as unknown as TeamInfoResponse;
  },

  async delete(teamId: string) {
    const url = `/teams/${teamId}`;
    return await axiosInstance.delete(url);
  },

  async update(teamId: string, data: { name?: string; description?: string; file?: any }) {
    // Always use FormData for compatibility with backend handling of this endpoint
    const formData = new FormData();

    // Construct the request part (JSON)
    const requestBody: any = {};
    if (data.name) requestBody.name = data.name;
    if (data.description) requestBody.description = data.description;

    if (Platform.OS === "web") {
      formData.append(
        "request",
        new Blob([JSON.stringify(requestBody)], {
          type: "application/json",
        })
      );
    } else {
      formData.append("request", {
        string: JSON.stringify(requestBody),
        type: "application/json",
      } as any);
    }

    // Append the file if it exists
    if (data.file) {
      const file = data.file;
      const fileName = file.fileName || "team_avatar.jpg";
      const fileType = file.mimeType || "image/jpeg";

      if (Platform.OS === "web") {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append("file", blob, fileName);
      } else {
        formData.append("file", {
          uri: file.uri,
          name: fileName,
          type: fileType,
        } as any);
      }
    }

    // Execute request using fetch
    const { accessToken } = await readTokens();
    const url = `${process.env.EXPO_PUBLIC_API_URL}/teams/${teamId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.log("Update team failed:", response.status, text);
      throw new Error(`Update failed: ${response.status} ${text}`);
    }

    // Return empty or parsed JSON if API returns content
    // Check if content-type is json
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    }
    return true;
  },
  async getQR(teamId: string, width: number, height: number): Promise<string> {
    const url = `/teams/${teamId}/qr`;
    const params = { width, height };
    const res = await axiosInstance.get(url, { params }) as { qrCode: string };
    return res.qrCode;
  },
  async resetQR(teamId: string): Promise<{ success: boolean; message: string }> {
    const url = `/teams/${teamId}/code`;
    const res = await axiosInstance.patch(url) as { success: boolean; message: string };
    return res;
  },
  async getSetting(teamId: string): Promise<TeamNotificationSetting> {
    const url = `/teams/${teamId}/notification-settings`;
    const res = await axiosInstance.get(url);
    return res as unknown as TeamNotificationSetting;
  },

  async updateNotificationSetting(settingId: string, data: Partial<TeamNotificationSetting>): Promise<TeamNotificationSetting> {
    const url = `/notification-settings/${settingId}`;
    const res = await axiosInstance.patch(url, data);
    return res as unknown as TeamNotificationSetting;
  },
  
  async searchTeamTaskStatistics(
  teamId: string,
  payload: {
    keyword?: string;
    fromDate: string;
    toDate: string;
    cursor?: string;
    size: number;
  }
): Promise<SearchTeamTaskStatisticsResponse> {
  const url = `/teams/${teamId}/tasks/statistics/search`;

  const data: SearchTeamTaskStatisticsResponse = await axiosInstance.post(
    url,
    payload
  );

  return data;
},

};

export default teamApi;