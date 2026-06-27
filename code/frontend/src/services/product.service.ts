import axiosInstance from "@/lib/axios";
import { Product, Category, Topping, ProductVariant } from "@/types";

export interface ProductFilterParams {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  status?: string;
}

export interface ToppingRequest {
  name: string;
  price: number;
  status?: string;
}

export interface ProductVariantRequest {
  id?: number;
  size: ProductVariant["size"];
  price: number;
  status?: string;
}

export interface ProductRequest {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  variants: ProductVariantRequest[];
  toppingIds?: number[];
}

export const getProducts = async (params?: ProductFilterParams): Promise<Product[]> => {
  const response = await axiosInstance.get<ApiResponse<Product[]>>("/products", { params });
  return response.data.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<ApiResponse<Category[]>>("/categories");
  return response.data.data;
};

export const getAdminProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<ApiResponse<Product[]>>("/admin/products");
  return response.data.data;
};

export const createAdminProduct = async (data: ProductRequest): Promise<Product> => {
  const response = await axiosInstance.post<ApiResponse<Product>>("/admin/products", data);
  return response.data.data;
};

export const updateAdminProduct = async (id: number, data: ProductRequest): Promise<Product> => {
  const response = await axiosInstance.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
  return response.data.data;
};

export const deleteAdminProduct = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/admin/products/${id}`);
};

export const getAdminCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<ApiResponse<Category[]>>("/admin/categories");
  return response.data.data;
};

export const createAdminCategory = async (data: CategoryRequest): Promise<Category> => {
  const response = await axiosInstance.post<ApiResponse<Category>>("/admin/categories", data);
  return response.data.data;
};

export const updateAdminCategory = async (id: number, data: CategoryRequest): Promise<Category> => {
  const response = await axiosInstance.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
  return response.data.data;
};

export const deleteAdminCategory = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/admin/categories/${id}`);
};

export const getAdminToppings = async (): Promise<Topping[]> => {
  const response = await axiosInstance.get<ApiResponse<Topping[]>>("/admin/toppings");
  return response.data.data;
};

export const createAdminTopping = async (data: ToppingRequest): Promise<Topping> => {
  const response = await axiosInstance.post<ApiResponse<Topping>>("/admin/toppings", data);
  return response.data.data;
};

export const updateAdminTopping = async (id: number, data: ToppingRequest): Promise<Topping> => {
  const response = await axiosInstance.put<ApiResponse<Topping>>(`/admin/toppings/${id}`, data);
  return response.data.data;
};

export const deleteAdminTopping = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/admin/toppings/${id}`);
};
