import axiosInstance from "@/lib/axios";
import { Store } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StoreRequest {
  name: string;
  address: string;
  phone?: string;
  status: string;
}

export const getStores = async (): Promise<Store[]> => {
  const response = await axiosInstance.get<ApiResponse<Store[]>>("/stores");
  return response.data.data;
};

export const getStoreById = async (id: number): Promise<Store> => {
  const response = await axiosInstance.get<ApiResponse<Store>>(`/stores/${id}`);
  return response.data.data;
};

export const createStore = async (data: StoreRequest): Promise<Store> => {
  const response = await axiosInstance.post<ApiResponse<Store>>("/stores", data);
  return response.data.data;
};

export const updateStore = async (id: number, data: StoreRequest): Promise<Store> => {
  const response = await axiosInstance.put<ApiResponse<Store>>(`/stores/${id}`, data);
  return response.data.data;
};

export const deleteStore = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/stores/${id}`);
};
