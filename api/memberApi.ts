import axiosInstance from "./axiosConfig";

export type Member = {
  userId: string;
  name: string;
  avatarUrl: string;
  role: "OWNER" | "MEMBER" | "ADMIN";
};

export type MemberListResponse = {
  members: Member[];
  total: number;
  nextCursor?: string | null;
};
const memberApi = {

    async getAll(teamId: string, cursor?: string): Promise<MemberListResponse> {
    const url = `/members`;
    const params: any = { teamId };
    if (cursor) params.cursor = cursor;

    return axiosInstance.get(url, { params });
  },
  async leave(teamId: string) {
    const url = `/members/leave`;
    return await axiosInstance.delete(url, { params: { teamId } });
  },

};

export default memberApi;
