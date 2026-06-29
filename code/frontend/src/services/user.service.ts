import axiosInstance from "@/lib/axios";
import { User } from "@/types";

export interface UserCreateRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  roleId: number;
  status: string;
}

export interface UserUpdateRequest {
  fullName: string;
  email: string;
  phone?: string;
  roleId: number;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<ApiResponse<User[]>>("/users");
  return response.data.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (data: UserCreateRequest): Promise<User> => {
  const response = await axiosInstance.post<ApiResponse<User>>("/users", data);
  return response.data.data;
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<User> => {
  const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};
