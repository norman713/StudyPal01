import axiosInstance from "./axiosConfig";

/* ===============================
   📦 Types
=============================== */
export interface NotificationItem {
  id: string;
  createdAt: string;
  title: string;
  content: string;
  subject: string; // ví dụ: "PLAN"
  subjectId: string;
  read: boolean;
  imageUrl:string |null
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  nextCursor?: string | null;
}

const notificationApi = {

  async getAll(
    cursor?: string,
    size: number = 10
  ): Promise<NotificationListResponse> {
    const url = "/notifications/all";
    const params = { cursor, size };
    const res = (await axiosInstance.get(url, { params })) as NotificationListResponse;
    return res;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const url = `/notifications/${id}`;
    const res = await axiosInstance.delete(url);
    return res.data;
  },

  async deleteMany(ids: string[]): Promise<{ success: boolean }> {
    const url = `/notifications`;
    // Pass ids in data body for DELETE request
    const res = await axiosInstance.delete(url, { data: { ids } });
    return res.data;
  },

  async markManyAsRead(ids: string[]): Promise<{ success: boolean }> {
    const url = `/notifications`;
    const res = await axiosInstance.patch(url, { ids });
    return res.data;
  },

  async deleteAll(): Promise<{ success: boolean }> {
    const url = `/notifications/all`;
    const res = await axiosInstance.delete(url);
    return res.data;
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const url = `/notifications/all`;
    const res = await axiosInstance.patch(url);
    return res.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const url = `/notifications/unread/count`;
    const res = await axiosInstance.get(url);
    return res.data;
  },
};

export default notificationApi;
