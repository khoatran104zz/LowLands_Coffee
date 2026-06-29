import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ManagerDashboardSummary {
  storeId: number;
  totalProducts: number;
  inventoryItems: number;
  lowStockItems: number;
  totalOrders: number;
  totalRevenue: number;
}

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<AdminDashboardSummary>>("/admin/dashboard/summary");
  return response.data.data;
};

export const getManagerDashboardSummary = async (): Promise<ManagerDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<ManagerDashboardSummary>>("/manager/dashboard/summary");
  return response.data.data;
};
