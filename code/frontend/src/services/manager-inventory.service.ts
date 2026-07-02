import axiosInstance from "@/lib/axios";
import { StockBalance, StockMovement } from "@/services/inventory.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ManagerStockAdjustmentRequest {
  ingredientId: number;
  quantity: number;
  unit: string;
  note?: string;
}

export const getManagerStockBalances = async (): Promise<StockBalance[]> => {
  const response = await axiosInstance.get<ApiResponse<StockBalance[]>>("/manager/inventory/stock-balances");
  return response.data.data;
};

export const getManagerStockMovements = async (): Promise<StockMovement[]> => {
  const response = await axiosInstance.get<ApiResponse<StockMovement[]>>("/manager/inventory/stock-movements");
  return response.data.data;
};

export const createManagerStockAdjustment = async (data: ManagerStockAdjustmentRequest): Promise<void> => {
  await axiosInstance.post<ApiResponse<unknown>>("/manager/inventory/stock-adjustments", data);
};
