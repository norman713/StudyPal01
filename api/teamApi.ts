import axiosInstance from "./axiosConfig";

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
const teamApi = {
  // async searchTeams(
  //   filter: "JOINED" | "OWNED",
  //   keyword?: string,
  //   cursor?: string,
  //   size: number = 10
  // ): Promise<TeamListResponse> {
  //   const url = "/teams/search";
  //   const params = { filter, keyword, cursor, size };
  //   const res = await axiosInstance.get<TeamListResponse>(url, { params });
  //   return res.data;
  // },
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
  


  async getInfo(teamId: string) {
  const url = `/teams/${teamId}`;
  const res = await axiosInstance.get(url);
  return res;
},

async delete(teamId: string) {
  const url = `/teams/${teamId}`;
  return await axiosInstance.delete(url);
},

  async update(teamId: string, data: { name?: string; description?: string }) {
    const url = `/teams/${teamId}`;
    return await axiosInstance.patch(url, data);
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
    const url = `/team-notification-settings/${teamId}`;
    const res = await axiosInstance.get(url);
    return res.data as TeamNotificationSetting;
  },

};

export default teamApi;
