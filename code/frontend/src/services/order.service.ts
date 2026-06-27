import { INITIAL_ORDERS } from "@/mock/orders";
import { Order } from "@/types";

export const createOrder = async (orderData: Order): Promise<Order> => {
  return {
    ...orderData,
    id: Date.now(),
    orderCode: `LL-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
};

export const getOrderHistory = async (): Promise<Order[]> => {
  return INITIAL_ORDERS;
};
