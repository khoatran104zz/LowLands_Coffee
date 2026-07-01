import { INITIAL_ORDERS } from "@/mock/orders";
import { Order } from "@/types";
import axiosInstance from "@/lib/axios";

export const createOrder = async (orderData: Order): Promise<Order> => {
  const response = await axiosInstance.post<ApiResponse<BackendOrderResponse>>("/orders", toOrderCreateRequest(orderData));
  return toOrder(response.data.data);
};

export const getOrderHistory = async (): Promise<Order[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<PageResponse<BackendOrderResponse>>>("/orders");
    return response.data.data.content.map(toOrder);
  } catch {
    return INITIAL_ORDERS;
  }
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
}

interface BackendOrderResponse {
  id: number;
  orderCode: string;
  orderType: "DELIVERY" | "PICKUP" | "DINE_IN" | "TAKEAWAY";
  status: string;
  storeId: number;
  storeName?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  subtotal: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  note?: string;
  payment?: {
    paymentMethod: "CASH" | "BANKING" | "MOMO" | "CARD";
  };
  items: Array<{
    id: number;
    productId: number;
    productVariantId: number;
    productName: string;
    size: string;
    unitPrice: number | string;
    quantity: number;
    totalPrice: number | string;
    note?: string;
    toppings: Array<{
      toppingId: number;
      toppingName: string;
      unitPrice: number | string;
      quantity: number;
      totalPrice: number | string;
    }>;
  }>;
  createdAt: string;
}

interface OrderCreateRequest {
  storeId: number;
  orderType: "DELIVERY" | "PICKUP" | "DINE_IN" | "TAKEAWAY";
  paymentMethod: "CASH" | "BANKING" | "MOMO" | "CARD";
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  note?: string;
  items: Array<{
    productVariantId: number;
    quantity: number;
    toppingIds: number[];
    note?: string;
  }>;
}

const toOrderCreateRequest = (orderData: Order): OrderCreateRequest => ({
  storeId: orderData.storeId,
  orderType: toBackendOrderType(orderData.orderType),
  paymentMethod: toBackendPaymentMethod(orderData.paymentMethod),
  receiverName: orderData.receiverName,
  receiverPhone: orderData.receiverPhone,
  deliveryAddress: orderData.deliveryAddress,
  note: orderData.note,
  items: orderData.items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    toppingIds: item.toppings.map((topping) => topping.toppingId),
    note: item.note,
  })),
});

const toOrder = (order: BackendOrderResponse): Order => ({
  id: order.id,
  storeId: order.storeId,
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
  createdAt: order.createdAt,
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
});

const toBackendOrderType = (orderType: Order["orderType"]): OrderCreateRequest["orderType"] => {
  const map: Record<Order["orderType"], OrderCreateRequest["orderType"]> = {
    delivery: "DELIVERY",
    pickup: "PICKUP",
    dine_in: "DINE_IN",
    takeaway: "TAKEAWAY",
  };
  return map[orderType];
};

const toBackendPaymentMethod = (paymentMethod: Order["paymentMethod"]): OrderCreateRequest["paymentMethod"] => {
  const map: Record<Order["paymentMethod"], OrderCreateRequest["paymentMethod"]> = {
    cod: "CASH",
    bank_transfer: "BANKING",
    e_wallet: "MOMO",
    card: "CARD",
  };
  return map[paymentMethod];
};

const toFrontendOrderType = (orderType: BackendOrderResponse["orderType"]): Order["orderType"] => {
  const map: Record<BackendOrderResponse["orderType"], Order["orderType"]> = {
    DELIVERY: "delivery",
    PICKUP: "pickup",
    DINE_IN: "dine_in",
    TAKEAWAY: "takeaway",
  };
  return map[orderType];
};

type BackendPaymentMethod = NonNullable<BackendOrderResponse["payment"]>["paymentMethod"];

const toFrontendPaymentMethod = (paymentMethod?: BackendPaymentMethod): Order["paymentMethod"] => {
  const map: Record<BackendPaymentMethod, Order["paymentMethod"]> = {
    CASH: "cod",
    BANKING: "bank_transfer",
    MOMO: "e_wallet",
    CARD: "card",
  };
  return paymentMethod ? map[paymentMethod] : "cod";
};
