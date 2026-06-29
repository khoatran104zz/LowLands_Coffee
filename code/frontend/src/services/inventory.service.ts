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

export const getStockBalances = async (): Promise<StockBalance[]> => {
  const response = await axiosInstance.get<ApiResponse<StockBalance[]>>("/inventory/stock-balances");
  return response.data.data;
};

export const createStockAdjustment = async (data: StockAdjustmentRequest): Promise<void> => {
  await axiosInstance.post<ApiResponse<unknown>>("/inventory/stock-adjustments", data);
};
