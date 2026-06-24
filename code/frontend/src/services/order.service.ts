import axiosInstance from "@/lib/axios";
import { Order } from "@/types";

export const createOrder = async (orderData: Order): Promise<Order> => {
  const response = await axiosInstance.post<Order>("/orders", orderData);
  return response.data;
};

export const getOrderHistory = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>("/orders/history");
  return response.data;
};
