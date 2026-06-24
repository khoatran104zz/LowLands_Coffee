import axiosInstance from "@/lib/axios";
import { Product, Category } from "@/types";

export interface ProductFilterParams {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getProducts = async (params?: ProductFilterParams): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>("/products", { params });
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<Category[]>("/categories");
  return response.data;
};
