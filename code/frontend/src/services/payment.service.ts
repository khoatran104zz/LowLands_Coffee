import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type PaymentMethod = "CASH" | "BANKING" | "MOMO" | "CARD";

export interface PaymentDetailResponse {
  id: number;
  orderId: number;
  orderCode: string;
  storeId: number;
  storeName: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  amount: number;
  paidAt?: string | null;
  createdAt?: string;
}

export const paymentMethodMap: Record<"cod" | "bank_transfer" | "e_wallet", PaymentMethod> = {
  cod: "CASH",
  bank_transfer: "BANKING",
  e_wallet: "MOMO",
};

export const payOrder = async (
  orderId: number,
  method: PaymentMethod,
  note?: string
): Promise<PaymentDetailResponse> => {
  const response = await axiosInstance.post<ApiResponse<PaymentDetailResponse>>(
    `/payments/orders/${orderId}/pay`,
    { method, note }
  );
  return response.data.data;
};

export const getPayment = async (id: number): Promise<PaymentDetailResponse> => {
  const response = await axiosInstance.get<ApiResponse<PaymentDetailResponse>>(`/payments/${id}`);
  return response.data.data;
};

export const getPaymentByOrder = async (orderId: number): Promise<PaymentDetailResponse> => {
  const response = await axiosInstance.get<ApiResponse<PaymentDetailResponse>>(`/payments/orders/${orderId}`);
  return response.data.data;
};

export const refundPayment = async (id: number, note?: string): Promise<PaymentDetailResponse> => {
  const response = await axiosInstance.post<ApiResponse<PaymentDetailResponse>>(`/payments/${id}/refund`, { note });
  return response.data.data;
};

export const failPayment = async (id: number, note?: string): Promise<PaymentDetailResponse> => {
  const response = await axiosInstance.post<ApiResponse<PaymentDetailResponse>>(`/payments/${id}/fail`, { note });
  return response.data.data;
};
