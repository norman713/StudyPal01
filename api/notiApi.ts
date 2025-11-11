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
};

export default notificationApi;
