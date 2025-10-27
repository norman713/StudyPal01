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
  async getAll(
    teamId: string,
    cursor?: string,
    size: number = 10
  ): Promise<MemberListResponse> {
    const url = "/members/all";
    const params = { teamId, cursor, size };
    const res = (await axiosInstance.get(url, { params })) as MemberListResponse;
    return res;
  },


  async leave(teamId: string) {
    const url = `/members/leave`;
    return await axiosInstance.delete(url, { params: { teamId } });
  },

    async updateRole(
    teamId: string,
    memberId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<{ success: boolean; message: string }> {
    const url = `/members`;
    const body = { teamId, memberId, role };
    const res = (await axiosInstance.patch(url, body)) as {
      success: boolean;
      message: string;
    };
    return res;
  },

};

export default memberApi;
