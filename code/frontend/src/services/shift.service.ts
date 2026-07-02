import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Shift {
  id: number;
  storeId: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  shiftName: string; // "MORNING" | "AFTERNOON" | "NIGHT"
  shiftDate: string; // "yyyy-MM-dd"
}

export const getShifts = async (storeId: number, params?: { date?: string; startDate?: string; endDate?: string }): Promise<Shift[]> => {
  const response = await axiosInstance.get<ApiResponse<Shift[]>>("/shifts", {
    params: { storeId, ...params }
  });
  return response.data.data;
};

export const assignShift = async (storeId: number, data: { userId: number; shiftName: string; shiftDate: string }): Promise<Shift> => {
  const response = await axiosInstance.post<ApiResponse<Shift>>("/shifts", data, {
    params: { storeId }
  });
  return response.data.data;
};

export const deleteShift = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/shifts/${id}`);
};
