import axiosInstance from "@/lib/axios";

export interface IngredientCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: string;
}

export interface IngredientCategoryRequest {
  name: string;
  code: string;
  description?: string;
  status?: string;
}

export interface Ingredient {
  id: number;
  categoryId: number;
  categoryName?: string;
  code: string;
  name: string;
  unit: string;
  minStock: number;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngredientRequest {
  categoryId: number;
  code: string;
  name: string;
  unit: string;
  minStock?: number;
  description?: string;
  status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getIngredients = async (): Promise<Ingredient[]> => {
  const response = await axiosInstance.get<ApiResponse<Ingredient[]>>("/ingredients");
  return response.data.data;
};

export const getIngredientById = async (id: number): Promise<Ingredient> => {
  const response = await axiosInstance.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
  return response.data.data;
};

export const createIngredient = async (data: IngredientRequest): Promise<Ingredient> => {
  const response = await axiosInstance.post<ApiResponse<Ingredient>>("/ingredients", data);
  return response.data.data;
};

export const updateIngredient = async (id: number, data: IngredientRequest): Promise<Ingredient> => {
  const response = await axiosInstance.put<ApiResponse<Ingredient>>(`/ingredients/${id}`, data);
  return response.data.data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/ingredients/${id}`);
};

export const getIngredientCategories = async (): Promise<IngredientCategory[]> => {
  const response = await axiosInstance.get<ApiResponse<IngredientCategory[]>>("/ingredient-categories");
  return response.data.data;
};

export const createIngredientCategory = async (data: IngredientCategoryRequest): Promise<IngredientCategory> => {
  const response = await axiosInstance.post<ApiResponse<IngredientCategory>>("/ingredient-categories", data);
  return response.data.data;
};

export const updateIngredientCategory = async (id: number, data: IngredientCategoryRequest): Promise<IngredientCategory> => {
  const response = await axiosInstance.put<ApiResponse<IngredientCategory>>(`/ingredient-categories/${id}`, data);
  return response.data.data;
};

export const deleteIngredientCategory = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/ingredient-categories/${id}`);
};
