import axiosInstance from "@/lib/axios";

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRequest {
  code: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await axiosInstance.get<ApiResponse<Supplier[]>>("/suppliers");
  return response.data.data;
};

export const getSupplierById = async (id: number): Promise<Supplier> => {
  const response = await axiosInstance.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  return response.data.data;
};

export const createSupplier = async (data: SupplierRequest): Promise<Supplier> => {
  const response = await axiosInstance.post<ApiResponse<Supplier>>("/suppliers", data);
  return response.data.data;
};

export const updateSupplier = async (id: number, data: SupplierRequest): Promise<Supplier> => {
  const response = await axiosInstance.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
  return response.data.data;
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/suppliers/${id}`);
};
