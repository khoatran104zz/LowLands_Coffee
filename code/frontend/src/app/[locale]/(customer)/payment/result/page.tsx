"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/auth.store";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, ClipboardList, RefreshCw } from "lucide-react";
import axiosInstance from "@/lib/axios";

interface OrderDetail {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  receiverPhone?: string;
  payment?: {
    paymentMethod: string;
    paymentStatus: string;
    paymentGateway?: string;
  };
}

const PAYMENT_TRACKING_STORAGE_KEY = "lowlands_pending_payment_order";

const readStoredReceiverPhone = (orderCode: string) => {
  if (typeof window === "undefined" || !orderCode) {
    return "";
  }

  try {
    const rawValue = window.localStorage.getItem(PAYMENT_TRACKING_STORAGE_KEY);
    if (!rawValue) {
      return "";
    }

    const parsed = JSON.parse(rawValue) as { orderCode?: string; receiverPhone?: string };
    if (parsed.orderCode !== orderCode) {
      return "";
    }

    return parsed.receiverPhone?.trim() || "";
  } catch {
    return "";
  }
};

export default function PaymentResultPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const success = searchParams?.get("success") === "true";
  const orderCode = searchParams?.get("orderCode") || "";
  const errorMessage = searchParams?.get("message") || "";

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!orderCode) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      const receiverPhone = readStoredReceiverPhone(orderCode);
      if (!receiverPhone) {
        setLoading(false);
        return;
      }

      try {
        // Fetch order details from public tracking API since user might be anonymous
        const response = await axiosInstance.get<{ data: OrderDetail }>("/orders/track", {
          params: { code: orderCode, phone: receiverPhone },
        });
        setOrder(response.data.data);
      } catch (error) {
        console.error("Failed to fetch order for result page", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrderDetails();
  }, [orderCode]);

  const formatPrice = (amount?: number) => {
    if (amount === undefined) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGatewayLabel = (gateway?: string, method?: string) => {
    if (gateway === "MOMO") return "Ví điện tử MoMo";
    if (gateway === "VNPAY") return "Cổng thanh toán VNPay";
    if (method === "BANKING") return "Chuyển khoản VNPay";
    if (method === "MOMO") return "Ví MoMo";
    return "Thanh toán trực tuyến";
  };

  const handleTrackOrder = () => {
    if (isAuthenticated) {
      router.push("/profile#orders");
    } else if (order?.receiverPhone) {
      // Redirect to guest tracking page
      router.push(`/track-order?code=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(order.receiverPhone)}`);
    } else if (orderCode) {
      router.push(`/track-order?code=${encodeURIComponent(orderCode)}`);
    } else {
      router.push("/menu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FBF7F0] flex flex-col items-center justify-center text-center p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 text-[#C8510A] animate-spin" />
          <h2 className="text-lg font-black text-[#3A1D14]">Đang đối soát kết quả thanh toán...</h2>
          <p className="text-sm font-semibold text-[#7B655A]">Vui lòng giữ kết nối, không đóng trình duyệt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-16 flex items-center justify-center text-left">
      <div className="container mx-auto max-w-xl px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-[#E5D8C8] shadow-xl overflow-hidden p-6 md:p-8 flex flex-col items-center text-center">
          {success ? (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-emerald-50 p-4 border border-emerald-100 mb-6 animate-bounce">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
              <h1 className="font-heading text-3xl font-black tracking-tight text-[#3A1D14] mb-2">
                Thanh toán thành công
              </h1>
              <p className="text-sm font-semibold text-emerald-700 max-w-sm mb-8">
                Cảm ơn bạn đã lựa chọn Lowlands Coffee. Đơn hàng của bạn đang được chế biến!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-rose-50 p-4 border border-rose-100 mb-6">
                <XCircle className="h-16 w-16 text-rose-600" />
              </div>
              <h1 className="font-heading text-3xl font-black tracking-tight text-[#3A1D14] mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-sm font-semibold text-rose-700 max-w-sm mb-8">
                {errorMessage || "Giao dịch không thành công hoặc đã bị hủy từ người dùng."}
              </p>
            </div>
          )}

          {order && (
            <div className="w-full rounded-2xl border border-[#E9DED1] bg-[#FFFCF8] p-5 mb-8 text-left text-sm space-y-3">
              <h3 className="font-black text-[#3A1D14] border-b border-[#E9DED1] pb-2 mb-2">
                Thông tin đơn hàng
              </h3>
              <div className="flex justify-between font-semibold">
                <span className="text-[#7B655A]">Mã đơn hàng:</span>
                <span className="font-black text-[#3A1D14]">{order.orderCode}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-[#7B655A]">Tổng tiền:</span>
                <span className="font-black text-[#C8510A] text-base">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-[#7B655A]">Phương thức:</span>
                <span className="font-black text-[#3A1D14]">
                  {getGatewayLabel(order.payment?.paymentGateway, order.payment?.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-[#7B655A]">Trạng thái giao dịch:</span>
                <span className={`font-black uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
                  success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {success ? "Đã thanh toán" : "Thất bại"}
                </span>
              </div>
            </div>
          )}

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Button
              onClick={handleTrackOrder}
              className="h-12 rounded-xl bg-[#3A1D14] px-5 text-sm font-black text-white hover:bg-[#2C140F] flex items-center justify-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Theo dõi đơn hàng
            </Button>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#C69A5B]/40 bg-[#8EA096] px-5 text-sm font-black text-white hover:bg-[#7F9188]"
            >
              <ShoppingBag className="h-4 w-4" />
              Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
