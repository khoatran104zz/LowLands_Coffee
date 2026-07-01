import axiosInstance from "@/lib/axios";

export interface GoodsReceiptItem {
  id?: number;
  ingredientId: number;
  ingredientCode?: string;
  ingredientName?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice?: number;
}

export interface GoodsReceipt {
  id: number;
  supplierId: number;
  supplierName?: string;
  storeId: number;
  storeName?: string;
  createdById: number;
  createdByName?: string;
  receiptCode: string;
  totalAmount: number;
  status: string;
  note?: string;
  items: GoodsReceiptItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GoodsReceiptRequest {
  supplierId: number;
  storeId: number;
  createdById: number;
  receiptCode: string;
  note?: string;
  items: {
    ingredientId: number;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getGoodsReceipts = async (): Promise<GoodsReceipt[]> => {
  const response = await axiosInstance.get<ApiResponse<GoodsReceipt[]>>("/goods-receipts");
  return response.data.data;
};

export const getGoodsReceiptById = async (id: number): Promise<GoodsReceipt> => {
  const response = await axiosInstance.get<ApiResponse<GoodsReceipt>>(`/goods-receipts/${id}`);
  return response.data.data;
};

export const createGoodsReceipt = async (data: GoodsReceiptRequest): Promise<GoodsReceipt> => {
  const response = await axiosInstance.post<ApiResponse<GoodsReceipt>>("/goods-receipts", data);
  return response.data.data;
};

export const updateGoodsReceipt = async (id: number, data: GoodsReceiptRequest): Promise<GoodsReceipt> => {
  const response = await axiosInstance.put<ApiResponse<GoodsReceipt>>(`/goods-receipts/${id}`, data);
  return response.data.data;
};

export const deleteGoodsReceipt = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/goods-receipts/${id}`);
};

export const completeGoodsReceipt = async (id: number): Promise<GoodsReceipt> => {
  const response = await axiosInstance.post<ApiResponse<GoodsReceipt>>(`/goods-receipts/${id}/complete`);
  return response.data.data;
};
