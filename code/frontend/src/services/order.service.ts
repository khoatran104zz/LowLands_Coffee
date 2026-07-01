import { Order } from "@/types";

const ORDER_BACKEND_NOT_IMPLEMENTED = "Order backend chua trien khai.";

export const createOrder = async (orderData: Order): Promise<Order> => {
  void orderData;
  throw new Error(ORDER_BACKEND_NOT_IMPLEMENTED);
};

export const getOrderHistory = async (): Promise<Order[]> => {
  throw new Error(ORDER_BACKEND_NOT_IMPLEMENTED);
};
