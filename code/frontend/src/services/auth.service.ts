import axiosInstance from "@/lib/axios";
import { User, Store, Promotion } from "@/types";

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await axiosInstance.get<User>("/auth/profile");
  return response.data;
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await axiosInstance.put<User>("/auth/profile", userData);
  return response.data;
};

export const getStores = async (): Promise<Store[]> => {
  const response = await axiosInstance.get<Store[]>("/stores");
  return response.data;
};

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await axiosInstance.get<Promotion[]>("/promotions");
  return response.data;
};
