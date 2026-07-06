import axiosInstance from "@/lib/axios";
import { Promotion } from "@/types";

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PromotionValidateResponse {
  valid: boolean;
  discount: number;
  message: string;
}

export const getPromotions = async (params?: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  applicableType?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}): Promise<PaginatedResponse<Promotion>> => {
  const response = await axiosInstance.get("/promotions", { params });
  return response.data.data;
};

export const getActivePromotions = async (): Promise<Promotion[]> => {
  const response = await axiosInstance.get("/promotions/active");
  return response.data.data;
};

export const getPromotionById = async (id: number): Promise<Promotion> => {
  const response = await axiosInstance.get(`/promotions/${id}`);
  return response.data.data;
};

export const createPromotion = async (
  promotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">
): Promise<Promotion> => {
  const response = await axiosInstance.post("/promotions", promotion);
  return response.data.data;
};

export const updatePromotion = async (
  id: number,
  promotion: Partial<Promotion>
): Promise<Promotion> => {
  const response = await axiosInstance.put(`/promotions/${id}`, promotion);
  return response.data.data;
};

export const deletePromotion = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/promotions/${id}`);
};

export const updatePromotionStatus = async (
  id: number,
  status: string
): Promise<Promotion> => {
  const response = await axiosInstance.patch(`/promotions/${id}/status`, { status });
  return response.data.data;
};

export const getAvailablePromotions = async (
  items: Array<{ productId: number; quantity: number }>,
  orderTotal: number
): Promise<Promotion[]> => {
  const response = await axiosInstance.post("/promotions/available", { items, orderTotal });
  return response.data.data;
};

export const validatePromotion = async (
  promotionCode: string,
  items: Array<{ productId: number; quantity: number }>,
  orderTotal: number
): Promise<PromotionValidateResponse> => {
  const response = await axiosInstance.post("/promotions/validate", {
    promotionCode,
    items,
    orderTotal,
  });
  return response.data.data;
};
