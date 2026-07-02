import axiosInstance from "@/lib/axios";
import { Order } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createOrder = async (orderData: Order): Promise<Order> => {
  const response = await axiosInstance.post<ApiResponse<BackendOrderResponse>>("/orders", toBackendOrderRequest(orderData));
  return toFrontendOrder(response.data.data);
};

export const getOrderHistory = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<ApiResponse<{ content: BackendOrderResponse[] }>>("/orders");
  return response.data.data.content.map(toFrontendOrder);
};

interface BackendOrderRequest {
  storeId: number;
  orderType: "DELIVERY" | "PICKUP" | "DINE_IN" | "TAKEAWAY";
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  paymentMethod: "CASH" | "BANKING" | "MOMO" | "CARD";
  note?: string;
  items: {
    productVariantId: number;
    quantity: number;
    toppingIds: number[];
    note?: string;
  }[];
}

interface BackendOrderResponse {
  id: number;
  userId?: number | null;
  storeId: number;
  storeName?: string;
  orderCode: string;
  orderType: "DELIVERY" | "PICKUP" | "DINE_IN" | "TAKEAWAY";
  status: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  note?: string;
  payment?: BackendPaymentResponse | null;
  items: {
    id: number;
    productId: number;
    productVariantId: number;
    productName: string;
    size: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    note?: string;
    toppings: {
      id: number;
      toppingId: number;
      toppingName: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }[];
  }[];
  createdAt: string;
  updatedAt?: string;
}

interface BackendPaymentResponse {
  id: number;
  paymentMethod: "CASH" | "BANKING" | "MOMO" | "CARD";
  paymentStatus: string;
  amount: number;
  paidAt?: string | null;
  createdAt?: string;
}

const orderTypeMap: Record<Order["orderType"], BackendOrderRequest["orderType"]> = {
  delivery: "DELIVERY",
  pickup: "PICKUP",
  dine_in: "DINE_IN",
  takeaway: "TAKEAWAY",
};

const paymentMethodMap: Record<Order["paymentMethod"], BackendOrderRequest["paymentMethod"]> = {
  cod: "CASH",
  bank_transfer: "BANKING",
  e_wallet: "MOMO",
};

const toBackendOrderRequest = (order: Order): BackendOrderRequest => ({
  storeId: order.storeId,
  orderType: orderTypeMap[order.orderType],
  receiverName: order.receiverName,
  receiverPhone: order.receiverPhone,
  deliveryAddress: order.deliveryAddress,
  paymentMethod: paymentMethodMap[order.paymentMethod],
  note: order.note,
  items: order.items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    toppingIds: item.toppings.map((topping) => topping.toppingId),
    note: item.note,
  })),
});

const toFrontendOrder = (order: BackendOrderResponse): Order => ({
  id: order.id,
  userId: order.userId ?? undefined,
  storeId: order.storeId,
  storeName: order.storeName,
  orderCode: order.orderCode,
  orderType: toFrontendOrderType(order.orderType),
  status: order.status.toLowerCase(),
  receiverName: order.receiverName,
  receiverPhone: order.receiverPhone,
  deliveryAddress: order.deliveryAddress,
  subtotal: Number(order.subtotal),
  discountAmount: Number(order.discountAmount),
  totalAmount: Number(order.totalAmount),
  note: order.note,
  paymentMethod: toFrontendPaymentMethod(order.payment?.paymentMethod),
  payment: order.payment
    ? {
        ...order.payment,
        amount: Number(order.payment.amount),
      }
    : undefined,
  items: order.items.map((item) => ({
    productId: item.productId,
    productVariantId: item.productVariantId,
    productName: item.productName,
    size: item.size,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    totalPrice: Number(item.totalPrice),
    note: item.note,
    toppings: item.toppings.map((topping) => ({
      toppingId: topping.toppingId,
      toppingName: topping.toppingName,
      unitPrice: Number(topping.unitPrice),
      quantity: topping.quantity,
      totalPrice: Number(topping.totalPrice),
    })),
  })),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const toFrontendOrderType = (orderType: BackendOrderResponse["orderType"]): Order["orderType"] => {
  if (orderType === "DELIVERY") return "delivery";
  if (orderType === "PICKUP") return "pickup";
  if (orderType === "DINE_IN") return "dine_in";
  return "takeaway";
};

const toFrontendPaymentMethod = (paymentMethod?: BackendPaymentResponse["paymentMethod"]): Order["paymentMethod"] => {
  if (paymentMethod === "BANKING") return "bank_transfer";
  if (paymentMethod === "MOMO" || paymentMethod === "CARD") return "e_wallet";
  return "cod";
};
