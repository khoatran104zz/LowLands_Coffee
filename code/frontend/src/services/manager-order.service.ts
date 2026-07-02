import axiosInstance from "@/lib/axios";
import { Order } from "@/types";
import { toFrontendOrder, BackendOrderResponse } from "@/services/order.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getManagerOrders = async (params?: {
  status?: string;
  orderType?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<Order[]> => {
  const response = await axiosInstance.get<ApiResponse<{ content: BackendOrderResponse[] }>>("/manager/orders", { params });
  return response.data.data.content.map(toFrontendOrder);
};

export const confirmManagerOrder = async (id: number): Promise<Order> => {
  const response = await axiosInstance.post<ApiResponse<BackendOrderResponse>>(`/manager/orders/${id}/confirm`);
  return toFrontendOrder(response.data.data);
};

export const cancelManagerOrder = async (id: number, reason?: string): Promise<Order> => {
  const response = await axiosInstance.post<ApiResponse<BackendOrderResponse>>(`/manager/orders/${id}/cancel`, reason ? { reason } : {});
  return toFrontendOrder(response.data.data);
};
