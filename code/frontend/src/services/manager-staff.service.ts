import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ManagerStaff {
  id: number;
  userId: number;
  storeUserId: number;
  employeeCode?: string;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  status: string;
  storeId: number;
  storeName: string;
}

export const getManagerStaff = async (): Promise<ManagerStaff[]> => {
  const response = await axiosInstance.get<ApiResponse<ManagerStaff[]>>("/manager/staff");
  return response.data.data.map(withTableId);
};

export const getManagerStaffById = async (storeUserId: number): Promise<ManagerStaff> => {
  const response = await axiosInstance.get<ApiResponse<ManagerStaff>>(`/manager/staff/${storeUserId}`);
  return withTableId(response.data.data);
};

const withTableId = (staff: Omit<ManagerStaff, "id"> & { id?: number }): ManagerStaff => ({
  ...staff,
  id: staff.id ?? staff.storeUserId,
});
