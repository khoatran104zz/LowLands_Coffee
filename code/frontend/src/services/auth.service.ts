import axiosInstance from "@/lib/axios";
import { User, Store, Promotion } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
  return response.data.data;
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>("/auth/register", data);
  return response.data.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await axiosInstance.get<ApiResponse<User>>("/auth/profile");
  return response.data.data;
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await axiosInstance.put<ApiResponse<User>>("/auth/profile", userData);
  return response.data.data;
};

export const getStores = async (): Promise<Store[]> => {
  const response = await axiosInstance.get<ApiResponse<Store[]>>("/stores");
  return response.data.data;
};

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await axiosInstance.get<ApiResponse<Promotion[]>>("/promotions");
  return response.data.data;
};
