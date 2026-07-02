import axiosInstance from "@/lib/axios";
import { GoodsReceipt, GoodsReceiptItem } from "@/services/goods-receipt.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ManagerGoodsReceiptRequest {
  supplierId: number;
  receiptCode: string;
  note?: string;
  items: Pick<GoodsReceiptItem, "ingredientId" | "quantity" | "unit" | "unitPrice">[];
}

export const getManagerGoodsReceipts = async (): Promise<GoodsReceipt[]> => {
  const response = await axiosInstance.get<ApiResponse<GoodsReceipt[]>>("/manager/goods-receipts");
  return response.data.data;
};

export const getManagerGoodsReceiptById = async (id: number): Promise<GoodsReceipt> => {
  const response = await axiosInstance.get<ApiResponse<GoodsReceipt>>(`/manager/goods-receipts/${id}`);
  return response.data.data;
};

export const createManagerGoodsReceipt = async (data: ManagerGoodsReceiptRequest): Promise<GoodsReceipt> => {
  const response = await axiosInstance.post<ApiResponse<GoodsReceipt>>("/manager/goods-receipts", data);
  return response.data.data;
};

export const updateManagerGoodsReceipt = async (id: number, data: ManagerGoodsReceiptRequest): Promise<GoodsReceipt> => {
  const response = await axiosInstance.put<ApiResponse<GoodsReceipt>>(`/manager/goods-receipts/${id}`, data);
  return response.data.data;
};

export const completeManagerGoodsReceipt = async (id: number): Promise<GoodsReceipt> => {
  const response = await axiosInstance.post<ApiResponse<GoodsReceipt>>(`/manager/goods-receipts/${id}/complete`);
  return response.data.data;
};
