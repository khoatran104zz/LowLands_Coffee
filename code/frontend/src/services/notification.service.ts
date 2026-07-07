import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: string;
  senderName?: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await axiosInstance.get<ApiResponse<NotificationItem[]>>("/notifications");
  return response.data.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await axiosInstance.post<ApiResponse<string>>(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await axiosInstance.post<ApiResponse<string>>("/notifications/read-all");
};
