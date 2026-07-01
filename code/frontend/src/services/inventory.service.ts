import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StockBalance {
  storeId: number;
  storeName: string;
  ingredientId: number;
  ingredientCode: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
}

export interface StockAdjustmentRequest {
  storeId: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  note?: string;
  createdById: number;
}

export interface StockMovement {
  id: number;
  storeId: number;
  storeName?: string;
  ingredientId: number;
  ingredientCode?: string;
  ingredientName?: string;
  movementType: string;
  quantity: number;
  unit: string;
  referenceType?: string;
  referenceId?: number;
  note?: string;
  createdById?: number;
  createdByName?: string;
  createdAt?: string;
}

export const getStockBalances = async (): Promise<StockBalance[]> => {
  const response = await axiosInstance.get<ApiResponse<StockBalance[]>>("/inventory/stock-balances");
  return response.data.data;
};

export const createStockAdjustment = async (data: StockAdjustmentRequest): Promise<void> => {
  await axiosInstance.post<ApiResponse<unknown>>("/inventory/stock-adjustments", data);
};

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const response = await axiosInstance.get<ApiResponse<StockMovement[]>>("/inventory/stock-movements");
  return response.data.data;
};
