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
};

export default teamApi;
