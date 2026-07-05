"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackOrder } from "@/services/order.service";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, ChefHat, ClipboardList, Clock, PackageCheck, Search, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

const ORDER_STEPS = [
  { key: "pending", label: "Chờ xác nhận", icon: ClipboardList },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
  { key: "preparing", label: "Đang pha chế", icon: ChefHat },
  { key: "ready", label: "Sẵn sàng", icon: PackageCheck },
  { key: "completed", label: "Hoàn tất", icon: CheckCircle2 },
];

const normalizeStatus = (status?: string) => status?.toLowerCase() || "pending";

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "pending") return "Chờ nhân viên xác nhận";
  if (normalized === "confirmed") return "Đã xác nhận";
  if (normalized === "preparing") return "Đang pha chế";
  if (normalized === "ready") return "Sẵn sàng giao/nhận";
  if (normalized === "completed") return "Hoàn tất";
  if (normalized === "cancelled") return "Đã hủy";
  return status || "Chờ xác nhận";
};

const getOrderTypeLabel = (orderType: Order["orderType"]) => {
  if (orderType === "delivery") return "Giao hàng";
  if (orderType === "pickup") return "Đến nhận tại quầy";
  if (orderType === "dine_in") return "Dùng tại bàn";
  return "Mang đi";
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-muted-foreground">Đang tải...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (silent = false) => {
    if (!code.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập mã đơn và số điện thoại.");
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    try {
      const result = await trackOrder(code.trim(), phone.trim());
      setOrder(result);
    } catch (error) {
      console.error("Failed to track order", error);
      setOrder(null);
      toast.error("Không tìm thấy đơn hàng phù hợp.");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (code && phone) {
      void handleTrack(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!order) return;
    const intervalId = window.setInterval(() => {
      void handleTrack(true);
    }, 30000);
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.orderCode, code, phone]);

  return (
    <div className="py-12 bg-background min-h-screen text-left">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border/60 pb-6">
          <h1 className="font-heading text-3xl font-extrabold text-primary tracking-tight">
            Theo dõi đơn hàng
          </h1>
          <div className="mt-3 h-1 w-12 rounded-full bg-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleTrack();
            }}
            className="lg:col-span-4 rounded-2xl border border-border/85 bg-card p-5 shadow-sm space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Mã đơn hàng</label>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="LL-260705-0001"
                className="h-10 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Số điện thoại nhận hàng</label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0901234567"
                className="h-10 text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full rounded-full h-10 text-sm font-bold">
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Đang tra cứu" : "Tra cứu"}
            </Button>
          </form>

          <div className="lg:col-span-8">
            {!order ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Nhập mã đơn và số điện thoại để xem trạng thái xử lý.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/85 bg-card p-5 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-xl border border-border bg-secondary/20 p-4">
                  <div>
                    <div className="text-lg font-black text-primary">{order.orderCode}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDateTime(order.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {getOrderTypeLabel(order.orderType)}
                      </span>
                    </div>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                <OrderTimeline status={order.status} />

                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Chi tiết món
                  </div>
                  <div className="divide-y divide-border">
                    {order.items.map((item, index) => (
                      <div key={`${item.productVariantId}-${index}`} className="p-3 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-extrabold text-foreground">
                              {item.productName} - Size {item.size}
                            </div>
                            <div className="mt-0.5 text-muted-foreground font-semibold">
                              x{item.quantity} - {formatPrice(item.unitPrice)}
                            </div>
                          </div>
                          <div className="font-black text-[#C8510A] whitespace-nowrap">
                            {formatPrice(item.totalPrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng tiền</div>
                  <div className="text-xl font-black text-[#C8510A]">{formatPrice(order.totalAmount)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  const normalized = normalizeStatus(status);
  const theme =
    normalized === "completed"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : normalized === "cancelled"
        ? "bg-rose-500/10 text-rose-700 border-rose-500/20"
        : normalized === "preparing"
          ? "bg-orange-500/10 text-orange-700 border-orange-500/20"
          : normalized === "ready"
            ? "bg-sky-500/10 text-sky-700 border-sky-500/20"
            : "bg-amber-500/10 text-amber-800 border-amber-500/20";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function OrderTimeline({ status }: { status?: string }) {
  const normalized = normalizeStatus(status);
  const currentIndex = ORDER_STEPS.findIndex((step) => step.key === normalized);

  if (normalized === "cancelled") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-start gap-2">
        <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Đơn hàng đã bị hủy.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {ORDER_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isDone = currentIndex >= index;
        const isCurrent = currentIndex === index;
        return (
          <div
            key={step.key}
            className={`rounded-xl border px-3 py-3 text-center ${
              isDone
                ? "border-[#C8510A]/25 bg-[#C8510A]/10 text-[#C8510A]"
                : "border-border bg-secondary/10 text-muted-foreground"
            }`}
          >
            <Icon className={`mx-auto h-4 w-4 ${isCurrent ? "animate-pulse" : ""}`} />
            <div className="mt-1 text-[10px] font-black uppercase tracking-wider">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}
