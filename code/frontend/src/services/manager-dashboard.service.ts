import axiosInstance from "@/lib/axios";
import { ManagerDashboardSummary } from "@/services/dashboard.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getManagerDashboardSummary = async (): Promise<ManagerDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<ManagerDashboardSummary>>("/manager/dashboard/summary");
  return response.data.data;
};
