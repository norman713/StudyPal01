import axiosInstance from "./axiosConfig";

/* =========================
   TYPES
========================= */

export interface CreateFolderRequest {
  teamId?: string; // query
  name: string; // body
}

export interface UserFolderUsageResponse {
  usageUsed: number; // bytes
  usageLimit: number; // bytes
}

export interface CreateFolderResponse {
  id: string;
  name: string;
  fileCount: number;
}
export interface GetFolderDetailResponse {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  bytes: number;
  fileCount: number;
}
export interface DeleteFolderResponse {
  success: boolean;
  message: string;
}
export interface FolderUsageResponse {
  success: boolean;
  message: string;
}
export interface FolderListItem {
  id: string;
  name: string;
  fileCount: number;
}

export interface GetFolderListResponse {
  folders: FolderListItem[];
  total: number;
  nextCursor?: string;
}

export interface GetFolderListParams {
  teamId?: string;
  cursor?: string;
  size?: number;
}

/* =========================
   API
========================= */

const folderApi = {
  // POST create folder
  async createFolder(
    request: CreateFolderRequest
  ): Promise<CreateFolderResponse> {
    const url = request.teamId
      ? `/folders?teamId=${request.teamId}`
      : `/folders`;

    const data: CreateFolderResponse = await axiosInstance.post(url, {
      name: request.name,
    });

    return data;
  },
  // GET folder detail
  async getFolderDetail(folderId: string): Promise<GetFolderDetailResponse> {
    const url = `/folders/${folderId}`;

    const data: GetFolderDetailResponse = await axiosInstance.get(url);

    return data;
  },

  // DELETE folder

  async deleteFolder(folderId: string): Promise<DeleteFolderResponse> {
    const url = `/folders/${folderId}`;

    const data: DeleteFolderResponse = await axiosInstance.delete(url);

    return data;
  },
  // PATCH update folder
  async updateFolder(folderId: string, name: string): Promise<void> {
    const url = `/folders/${folderId}`;

    await axiosInstance.patch(url, { name });
  },

  // GET folder usage for team
  async getFolderUsage(teamId: string): Promise<FolderUsageResponse> {
    const url = `/teams/${teamId}/folders/usage`;

    const data: FolderUsageResponse = await axiosInstance.get(url);

    return data;
  },
  // GET list folders
  async getFolders(
    params?: GetFolderListParams
  ): Promise<GetFolderListResponse> {
    const query: string[] = [];

    if (params?.teamId) query.push(`teamId=${params.teamId}`);
    if (params?.cursor) query.push(`cursor=${params.cursor}`);
    if (params?.size) query.push(`size=${params.size}`);

    const qs = query.length ? `?${query.join("&")}` : "";
    const url = `/folders/all${qs}`;

    const data: GetFolderListResponse = await axiosInstance.get(url);

    return data;
  },

  // GET user folder usage
  async getUserFolderUsage(): Promise<UserFolderUsageResponse> {
    const url = `/folders/usage`;

    const data: UserFolderUsageResponse = await axiosInstance.get(url);

    return data;
  },
  // GET team folder usage
  async getTeamFolderUsage(teamId: string): Promise<UserFolderUsageResponse> {
    const url = `/teams/${teamId}/folders/usage`;
    const data: UserFolderUsageResponse = await axiosInstance.get(url);
    return data;
  },
};

export default folderApi;
