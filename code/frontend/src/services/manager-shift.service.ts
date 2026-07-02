import axiosInstance from "@/lib/axios";
import { Shift } from "@/services/shift.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getManagerShifts = async (params?: { date?: string; startDate?: string; endDate?: string }): Promise<Shift[]> => {
  const response = await axiosInstance.get<ApiResponse<Shift[]>>("/manager/shifts", { params });
  return response.data.data;
};

export const assignManagerShift = async (data: { userId: number; shiftName: string; shiftDate: string }): Promise<Shift> => {
  const response = await axiosInstance.post<ApiResponse<Shift>>("/manager/shifts", data);
  return response.data.data;
};

export const updateManagerShift = async (id: number, data: { userId: number; shiftName: string; shiftDate: string }): Promise<Shift> => {
  const response = await axiosInstance.put<ApiResponse<Shift>>(`/manager/shifts/${id}`, data);
  return response.data.data;
};

export const deleteManagerShift = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/manager/shifts/${id}`);
};
