import axiosInstance from "./axiosConfig";
import { readTokens } from "./tokenStore";

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

export interface FileItemApi {
  id: string;
  name: string;
  extension: string;
  url: string;
  // size: number; // Not shown in new API image example, optional or removed
  updatedAt: string;
}

export interface FileDetail {
  id: string;
  name: string;
  extension: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  bytes: number;
}

export interface UpdateFileResponse {
  success: boolean;
  message: string;
}

export interface GetFilesResponse {
  files: FileItemApi[];
  total: number;
  nextCursor?: string;
}

export interface GetFilesParams {
  cursor?: string;
  size?: number;
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

  // POST upload file
  async uploadFile(folderId: string, file: any): Promise<any> {
    // API requires 'name' in query params as per image
    const fileName = file.name || "file";
    // We get baseUrl from process.env, need to ensure it's imported or available.
    // axiosConfig has it but it's local constant. We should probably export it or just use simple logic if possible.
    // For now, let's try to get it from process.env directly.
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    const url = `${baseUrl}/folders/${folderId}/files?name=${encodeURIComponent(fileName)}`;

    const formData = new FormData();

    // React Native FormData append signature
    formData.append("file", {
      uri: file.uri,
      name: fileName,
      type: file.mimeType || "application/octet-stream",
    } as any);

    const { accessToken } = await readTokens();

    // Use fetch instead of axios for better FormData handling in RN
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        // "Content-Type": "multipart/form-data", // Do NOT set this manually with fetch/FormData
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Upload Error Response:", text);
      throw new Error(`Upload failed: ${response.status} ${text}`);
    }

    return await response.json();
  },

  // GET files
  async getFiles(
    folderId: string,
    params?: GetFilesParams
  ): Promise<GetFilesResponse> {
    const query: string[] = [];
    if (params?.cursor) query.push(`cursor=${params.cursor}`);
    if (params?.size) query.push(`size=${params.size}`);

    const qs = query.length ? `?${query.join("&")}` : "";
    const url = `/folders/${folderId}/files/all${qs}`;

    const data: GetFilesResponse = await axiosInstance.get(url);
    return data;
  },

  // DELETE file
  async deleteFile(fileId: string): Promise<any> {
    const url = `/files/${fileId}`;
    const data = await axiosInstance.delete(url);
    return data;
  },

  // GET file detail
  async getFileDetail(fileId: string): Promise<FileDetail> {
    const url = `/files/${fileId}`;
    const res = await axiosInstance.get(url);
    return res as unknown as FileDetail;
  },

  // PATCH update file
  async updateFile(fileId: string, name: string): Promise<UpdateFileResponse> {
    const url = `/files/${fileId}`;
    const data: UpdateFileResponse = await axiosInstance.patch(url, { name });
    return data;
  },

  async searchFiles(
    folderId: string,
    keyword: string,
    params?: { cursor?: string; size?: number }
  ): Promise<GetFilesResponse> {
    const res = await axiosInstance.get(`/folders/${folderId}/files/search`, {
      params: { keyword, ...params },
    });
    return res as unknown as GetFilesResponse;
  },

  async moveFile(fileId: string, newFolderId: string): Promise<any> {
    const res = await axiosInstance.patch(`/files/${fileId}/move`, null, {
      params: { newFolderId },
    });
    return res;
  },
};

export default folderApi;
