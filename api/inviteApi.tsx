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

export interface Invitation {
  id: string;
  inviteeId: string;
  inviterName: string;
  inviterAvatarUrl: string;
  teamId: string;
  teamName: string;
  invitedAt: string;
}

export interface InvitationListResponse {
  invitations: Invitation[];
  total: number;
  nextCursor?: string | null;
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

  /**
   * Get all invitations
   * GET /api/invitations/all
   */
  async getAll(
    cursor?: string,
    size: number = 10
  ): Promise<InvitationListResponse> {
    const url = `/invitations/all`;
    const params = { cursor, size };
    const res = await axiosInstance.get(url, { params });
    return res as unknown as InvitationListResponse;
  },

  /**
   * Reply to invitation
   * POST /api/invitations/{invitationId}?accept={true|false}
   */
  async reply(
    invitationId: string,
    accept: boolean
  ): Promise<{ success: boolean; message: string }> {
    const url = `/invitations/${invitationId}`;
    const params = { accept };
    // The API might expect query params, so we pass params.
    // Confirmed from screenshot: POST /api/invitations/{invitationId} with query param 'accept'
    const res = await axiosInstance.post(url, null, { params });
    return res as unknown as { success: boolean; message: string };
  },
};

export default inviteApi;
