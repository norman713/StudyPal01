import axiosInstance from "./axiosConfig";

/**
 * Invite API
 */
export interface InviteUserRequest {
  teamId: string;
  inviteeId: string;
}

export interface InviteUserResponse {
  id: string;
  teamId: string;
  inviteeId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

const inviteApi = {
  /**
   * Invite a user to a team
   * POST /api/invitations
   */
  async inviteUser(request: InviteUserRequest): Promise<InviteUserResponse> {
    const url = `/invitations`;
    const data: InviteUserResponse = await axiosInstance.post(url, request);
    return data;
  },
};

export default inviteApi;
