import axiosInstance from "./axiosConfig";

export interface Team {
  id: string;
  name: string;
  avatarUrl?: string;
  owner: boolean;
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
  async getAll(
    filter: "JOINED" | "OWNED",
    cursor?: string,
    size: number = 10
  ): Promise<TeamListResponse> {
    const url = "/teams/all";
    const params = { filter, cursor, size };
    const res = (await axiosInstance.get(url, { params })) as TeamListResponse;
    return res;
  },

    async create(name: string, description: string): Promise<CreateTeamResponse> {
    const url = "/teams";
    const res = (await axiosInstance.post(url, { name, description })) as CreateTeamResponse;
    return res;
  },
  
    async search(
    filter: "JOINED" | "OWNED",
    keyword: string,
    cursor?: string,
    size: number = 10
  ): Promise<TeamListResponse> {
    const url = "/teams/search";
    const params = { filter, keyword, cursor, size };
    const res = (await axiosInstance.get(url, { params })) as TeamListResponse;
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

};

export default teamApi;
