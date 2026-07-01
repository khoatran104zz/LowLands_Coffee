import axiosInstance from "@/lib/axios";

export interface RecipeIngredient {
  id?: number;
  ingredientId: number;
  ingredientCode?: string;
  ingredientName?: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  productVariantId: number;
  productVariantSize?: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  ingredients: RecipeIngredient[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeRequest {
  productVariantId: number;
  code: string;
  name: string;
  description?: string;
  status?: string;
  ingredients: RecipeIngredient[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await axiosInstance.get<ApiResponse<Recipe[]>>("/recipes");
  return response.data.data;
};

export const getRecipeById = async (id: number): Promise<Recipe> => {
  const response = await axiosInstance.get<ApiResponse<Recipe>>(`/recipes/${id}`);
  return response.data.data;
};

export const createRecipe = async (data: RecipeRequest): Promise<Recipe> => {
  const response = await axiosInstance.post<ApiResponse<Recipe>>("/recipes", data);
  return response.data.data;
};

export const updateRecipe = async (id: number, data: RecipeRequest): Promise<Recipe> => {
  const response = await axiosInstance.put<ApiResponse<Recipe>>(`/recipes/${id}`, data);
  return response.data.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/recipes/${id}`);
};
