"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/auth.store";
import { updateProfile } from "@/services/auth.service";
import { getOrderHistory } from "@/services/order.service";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  Eye,
  LogOut,
  PackageCheck,
  RefreshCw,
  Settings,
  Truck,
  XCircle,
} from "lucide-react";

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

const getPaymentLabel = (paymentMethod: Order["paymentMethod"]) => {
  if (paymentMethod === "bank_transfer") return "Chuyển khoản";
  if (paymentMethod === "e_wallet") return "Ví điện tử / thẻ";
  return "Thanh toán khi nhận hàng";
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const getProgress = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "cancelled") return 100;
  const index = ORDER_STEPS.findIndex((step) => step.key === normalized);
  return index < 0 ? 0 : Math.round((index / (ORDER_STEPS.length - 1)) * 100);
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { user, isAuthenticated, hasHydrated, hydrateFromStorage, logout, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
  }, [user]);

  const loadHistory = useCallback(async (silent = false) => {
    if (!silent) {
      setHistoryLoading(true);
    }
    setHistoryError(null);
    try {
      const history = await getOrderHistory();
      setOrders(history || []);
    } catch (err) {
      console.warn("Failed to fetch customer order history from backend:", err);
      setHistoryError("api_not_connected");
    } finally {
      if (!silent) {
        setHistoryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    void loadHistory();
    const intervalId = window.setInterval(() => {
      void loadHistory(true);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, loadHistory]);

  useEffect(() => {
    if (!selectedOrder?.id) return;
    const latest = orders.find((order) => order.id === selectedOrder.id);
    if (latest) {
      setSelectedOrder(latest);
    }
  }, [orders, selectedOrder?.id]);

  const summary = useMemo(() => {
    return {
      active: orders.filter((order) => !["completed", "cancelled"].includes(normalizeStatus(order.status))).length,
      completed: orders.filter((order) => normalizeStatus(order.status) === "completed").length,
      cancelled: orders.filter((order) => normalizeStatus(order.status) === "cancelled").length,
    };
  }, [orders]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setProfileLoading(true);
    try {
      const updatedUser = await updateProfile({ fullName, phone });
      updateUser(updatedUser);
      toast.success(t("auth.profileSaved"));
    } catch (err) {
      console.warn("Backend API offline. Simulating profile save locally.", err);
      if (user) {
        updateUser({ ...user, fullName, phone });
        toast.success(`${t("auth.profileSaved")} (Cục bộ)`);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="py-12 bg-background min-h-screen text-left">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-border/50 pb-6">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-primary tracking-tight">
              {t("auth.profileTitle")}
            </h1>
            <div className="w-12 h-1 bg-accent rounded-full mt-3" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 self-start"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("common.logout")}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-base text-primary flex items-center gap-2 border-b border-border/60 pb-3">
              <Settings className="h-5 w-5 text-accent" />
              <span>Cập nhật thông tin</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">{t("auth.fullName")}</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-border text-xs sm:text-sm h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">{t("auth.email")}</label>
                <Input
                  value={user?.email}
                  disabled
                  className="border-border bg-secondary/50 text-xs sm:text-sm h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">{t("auth.phone")}</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-border text-xs sm:text-sm h-10"
                />
              </div>

              <Button type="submit" disabled={profileLoading} className="w-full rounded-full h-10 font-bold text-sm">
                {profileLoading ? t("common.loading") : t("common.save")}
              </Button>
            </form>
          </div>

          <div id="orders" className="lg:col-span-8 border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <h3 className="font-bold text-base text-primary flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-accent" />
                <span>Theo dõi đơn hàng</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadHistory()}
                disabled={historyLoading}
                className="h-9 rounded-full text-xs font-bold self-start md:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${historyLoading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <SummaryTile label="Đang xử lý" value={summary.active} tone="amber" />
              <SummaryTile label="Hoàn tất" value={summary.completed} tone="emerald" />
              <SummaryTile label="Đã hủy" value={summary.cancelled} tone="rose" />
            </div>

            {historyLoading && (
              <div className="flex flex-col gap-3 py-12 justify-center items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">{t("common.loading")}</span>
              </div>
            )}

            {historyError === "api_not_connected" && (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-3 border border-dashed border-border rounded-xl p-6">
                <AlertCircle className="h-8 w-8 text-accent" />
                <h4 className="text-sm font-bold text-foreground">Chưa tải được lịch sử đơn hàng</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  Vui lòng thử lại sau khi backend và tài khoản khách hàng được kết nối.
                </p>
              </div>
            )}

            {!historyLoading && !historyError && orders.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center gap-2 border border-dashed border-border rounded-xl">
                <AlertCircle className="h-10 w-10 text-muted-foreground/35" />
                <p className="text-xs text-muted-foreground">Chưa có đơn hàng nào được ghi nhận.</p>
              </div>
            )}

            {!historyLoading && !historyError && orders.length > 0 && (
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id ?? order.orderCode}
                    order={order}
                    formatPrice={formatPrice}
                    onView={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Theo dõi ${selectedOrder.orderCode || `#${selectedOrder.id}`}` : "Theo dõi đơn hàng"}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5 text-left">
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-primary">{selectedOrder.orderCode}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(selectedOrder.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      {getOrderTypeLabel(selectedOrder.orderType)}
                    </span>
                  </div>
                </div>
                <StatusPill status={selectedOrder.status} />
              </div>
            </div>

            <OrderTimeline status={selectedOrder.status} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <DetailTile label="Người nhận" value={selectedOrder.receiverName || "-"} />
              <DetailTile label="Số điện thoại" value={selectedOrder.receiverPhone || "-"} />
              <DetailTile label="Địa chỉ" value={selectedOrder.deliveryAddress || "-"} />
              <DetailTile label="Thanh toán" value={getPaymentLabel(selectedOrder.paymentMethod)} />
            </div>

            {selectedOrder.note && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs font-semibold text-amber-900">
                Ghi chú: {selectedOrder.note}
              </div>
            )}

            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Chi tiết món
              </div>
              <div className="divide-y divide-border">
                {selectedOrder.items.map((item, index) => (
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
                    {item.toppings.length > 0 && (
                      <div className="mt-2 space-y-1 pl-3 border-l border-border">
                        {item.toppings.map((topping) => (
                          <div key={topping.toppingId} className="flex justify-between gap-2 text-[11px] text-muted-foreground">
                            <span>+ {topping.toppingName} x{topping.quantity}</span>
                            <span>{formatPrice(topping.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-border pt-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng tiền</div>
                <div className="text-xl font-black text-[#C8510A]">{formatPrice(selectedOrder.totalAmount)}</div>
              </div>
              <Button onClick={() => setSelectedOrder(null)} className="rounded-full px-5 text-xs font-bold">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: "amber" | "emerald" | "rose" }) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
      : tone === "rose"
        ? "text-rose-700 bg-rose-500/10 border-rose-500/20"
        : "text-amber-800 bg-amber-500/10 border-amber-500/20";

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{label}</div>
      <div className="mt-0.5 text-lg font-black">{value}</div>
    </div>
  );
}

function OrderCard({
  order,
  formatPrice,
  onView,
}: {
  order: Order;
  formatPrice: (value: number) => string;
  onView: () => void;
}) {
  const normalized = normalizeStatus(order.status);
  const isCancelled = normalized === "cancelled";

  return (
    <div className="border border-border/70 rounded-xl p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors text-xs">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-primary">{order.orderCode}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground font-semibold">
            <span>{getOrderTypeLabel(order.orderType)}</span>
            <span>{formatDateTime(order.createdAt)}</span>
            <span>{order.items.length} món</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full ${isCancelled ? "bg-rose-500" : "bg-[#C8510A]"}`}
              style={{ width: `${getProgress(order.status)}%` }}
            />
          </div>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
          <div className="text-right">
            <div className="font-black text-primary text-base">{formatPrice(order.totalAmount)}</div>
            <div className="text-[10px] text-muted-foreground font-semibold">{getStatusLabel(order.status)}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onView}
            className="h-8 rounded-full text-xs font-bold"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Chi tiết
          </Button>
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
        <span>Đơn hàng đã bị hủy. Vui lòng liên hệ cửa hàng nếu cần hỗ trợ thêm.</span>
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

function DetailTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-extrabold text-foreground">{value}</div>
    </div>
  );
}
