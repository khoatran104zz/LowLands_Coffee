"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ClipboardList,
  Clock,
  Eye,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/useConfirm";
import { useTranslation } from "@/hooks/useTranslation";
import {
  cancelOrder,
  completeOrder,
  confirmOrder,
  getOrders,
  prepareOrder,
  readyOrder,
} from "@/services/order.service";
import { buildOrderTrackingUrl, printOrderAsPdf } from "@/lib/order-print";

type OrderFilter = "active" | "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | "all";
type OrderAction = "confirm" | "prepare" | "ready" | "complete" | "cancel";

const STAFF_ORDER_ROLES = ["STAFF", "ADMIN", "MANAGER"];
const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "active", label: "Đang xử lý" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "preparing", label: "Đang pha chế" },
  { key: "ready", label: "Sẵn sàng" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "all", label: "Tất cả" },
];

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "ready"];
const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
  cancelled: 5,
};

const normalizeStatus = (status?: string) => status?.toLowerCase() || "pending";

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "pending") return "Chờ xác nhận";
  if (normalized === "confirmed") return "Đã xác nhận";
  if (normalized === "preparing") return "Đang pha chế";
  if (normalized === "ready") return "Sẵn sàng";
  if (normalized === "completed") return "Hoàn tất";
  if (normalized === "cancelled") return "Đã hủy";
  return status || "Chờ xác nhận";
};

const getOrderTypeLabel = (orderType: Order["orderType"]) => {
  if (orderType === "delivery") return "Giao hàng";
  if (orderType === "pickup") return "Khách đến nhận";
  if (orderType === "dine_in") return "Dùng tại bàn";
  return "Mang đi";
};

const getPaymentLabel = (paymentMethod: Order["paymentMethod"]) => {
  if (paymentMethod === "bank_transfer") return "Chuyển khoản";
  if (paymentMethod === "e_wallet") return "Ví/thẻ";
  return "Tiền mặt/COD";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const getAgeInMinutes = (value?: string) => {
  if (!value) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
};

const getAgeLabel = (value?: string) => {
  const minutes = getAgeInMinutes(value);
  if (minutes < 1) return "Vừa tạo";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}p` : `${hours}h`;
};

const getOrderPriority = (order: Order) => {
  const status = normalizeStatus(order.status);
  const statusRank = STATUS_ORDER[status] ?? 9;
  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  if (ACTIVE_STATUSES.includes(status)) {
    return statusRank * 1_000_000_000 + createdAt;
  }
  return statusRank * 1_000_000_000 - createdAt;
};

const getHttpStatus = (error: unknown) => (error as { response?: { status?: number } }).response?.status;

export default function StaffOrdersPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const logout = useAuthStore((state) => state.logout);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const roleUpper = user?.roleName?.toUpperCase();
  const branchId = user?.branchId;
  const canAccessStaffOrders = Boolean(isAuthenticated && user && roleUpper && STAFF_ORDER_ROLES.includes(roleUpper));
  const canLoadStaffOrders = Boolean(canAccessStaffOrders && branchId);
  const authError = useMemo(() => {
    if (!hasHydrated || !isAuthenticated || !user) return null;
    if (!canAccessStaffOrders) {
      return "Tài khoản hiện tại không có quyền xem trung tâm đơn hàng. Vui lòng đăng nhập bằng tài khoản nhân viên.";
    }
    if (!branchId) {
      return "Tài khoản nhân viên chưa được gán chi nhánh nên chưa thể tải danh sách đơn hàng.";
    }
    return null;
  }, [branchId, canAccessStaffOrders, hasHydrated, isAuthenticated, user]);
  const displayError = authError || apiError;
  const visibleOrders = useMemo(() => (canLoadStaffOrders && !displayError ? orders : []), [canLoadStaffOrders, displayError, orders]);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.push(`/${locale}/portal/login`);
      return;
    }

    if (!canAccessStaffOrders) {
      logout();
      router.push(`/${locale}/portal/login`);
    }
  }, [canAccessStaffOrders, hasHydrated, isAuthenticated, locale, logout, router, user]);

  const handleStaffLoginRedirect = useCallback(() => {
    setOrders([]);
    setSelectedOrder(null);
    setApiError(null);
    logout();
    router.push(`/${locale}/portal/login`);
  }, [locale, logout, router]);

  const loadOrders = useCallback(async (silent = false) => {
    if (!canAccessStaffOrders) {
      setOrders([]);
      setSelectedOrder(null);
      setApiError(null);
      if (!silent) {
        setIsLoading(false);
      }
      return;
    }

    if (!branchId) {
      setOrders([]);
      setSelectedOrder(null);
      setApiError("Tài khoản nhân viên chưa được gán chi nhánh nên chưa thể tải danh sách đơn hàng.");
      if (!silent) {
        setIsLoading(false);
      }
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    setApiError(null);
    try {
      const fetched = await getOrders({ storeId: branchId, page: 0, size: 100 });
      setOrders(fetched);
    } catch (error) {
      console.error("Failed to load staff orders from backend API", error);
      setOrders([]);
      setSelectedOrder(null);

      const status = getHttpStatus(error);
      if (status === 401 || status === 403) {
        setApiError("Phiên hiện tại không có quyền xem đơn hàng nhân viên. Vui lòng đăng nhập lại bằng tài khoản nhân viên đúng chi nhánh.");
        logout();
        router.push(`/${locale}/portal/login`);
        return;
      }

      setApiError("Không thể tải danh sách đơn hàng từ backend. Vui lòng kiểm tra API rồi thử lại.");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [branchId, canAccessStaffOrders, locale, logout, router]);

  useEffect(() => {
    if (!hasHydrated || !canLoadStaffOrders) return;

    const initialLoadId = window.setTimeout(() => {
      void loadOrders();
    }, 0);
    const intervalId = window.setInterval(() => {
      void loadOrders(true);
    }, 15000);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [canLoadStaffOrders, hasHydrated, loadOrders]);

  const counts = useMemo(() => {
    const byStatus = visibleOrders.reduce<Record<string, number>>((acc, order) => {
      const status = normalizeStatus(order.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      active: visibleOrders.filter((order) => ACTIVE_STATUSES.includes(normalizeStatus(order.status))).length,
      pending: byStatus.pending || 0,
      confirmed: byStatus.confirmed || 0,
      preparing: byStatus.preparing || 0,
      ready: byStatus.ready || 0,
      completed: byStatus.completed || 0,
      cancelled: byStatus.cancelled || 0,
      all: visibleOrders.length,
    };
  }, [visibleOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return visibleOrders
      .filter((order) => {
        const status = normalizeStatus(order.status);
        if (filter === "active") return ACTIVE_STATUSES.includes(status);
        if (filter === "all") return true;
        return status === filter;
      })
      .filter((order) => {
        if (!keyword) return true;
        const haystack = [
          order.orderCode,
          order.receiverName,
          order.receiverPhone,
          order.deliveryAddress,
          ...order.items.map((item) => item.productName),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
      .sort((left, right) => getOrderPriority(left) - getOrderPriority(right));
  }, [filter, searchQuery, visibleOrders]);

  const updateOrderStatus = async (order: Order, action: OrderAction) => {
    if (!order.id) return;

    if (action === "cancel") {
      const accepted = await confirm({
        title: "Hủy đơn hàng",
        message: `Bạn có chắc chắn muốn hủy đơn ${order.orderCode || `#${order.id}`}?`,
        confirmText: "Hủy đơn",
        cancelText: t("common.cancel"),
        variant: "danger",
      });
      if (!accepted) return;
    }

    setIsUpdating(true);
    try {
      let updatedOrder = order;
      if (action === "confirm") updatedOrder = await confirmOrder(order.id);
      if (action === "prepare") updatedOrder = await prepareOrder(order.id);
      if (action === "ready") updatedOrder = await readyOrder(order.id);
      if (action === "complete") updatedOrder = await completeOrder(order.id);
      if (action === "cancel") updatedOrder = await cancelOrder(order.id, "Staff cancelled order");

      setOrders((current) => current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)));
      setSelectedOrder(updatedOrder);
      toast.success(`Đã cập nhật ${updatedOrder.orderCode || `#${updatedOrder.id}`}: ${getStatusLabel(updatedOrder.status)}`);
      await loadOrders(true);
    } catch (error) {
      console.error("Failed to update order status", error);
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintOrder = useCallback((order: Order) => {
    const opened = printOrderAsPdf(order, {
      cashierName: user?.fullName,
      storeName: user?.branchName || order.storeName,
      trackingUrl: buildOrderTrackingUrl(order, locale),
    });

    if (opened) {
      toast.success("Đã mở mẫu in. Chọn Save as PDF để lưu hóa đơn.");
      return;
    }

    toast.error("Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  }, [locale, user?.branchName, user?.fullName]);

  const renderOrderActions = (order: Order, compact = false) => {
    const status = normalizeStatus(order.status);
    const className = compact ? "h-8 px-2 text-[10px]" : "h-9 px-3 text-xs";

    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {status === "pending" && (
          <Button
            type="button"
            disabled={isUpdating}
            onClick={() => updateOrderStatus(order, "confirm")}
            className={`${className} rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Xác nhận
          </Button>
        )}
        {status === "confirmed" && (
          <Button
            type="button"
            disabled={isUpdating}
            onClick={() => updateOrderStatus(order, "prepare")}
            className={`${className} rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold`}
          >
            <ChefHat className="h-3.5 w-3.5 mr-1" />
            Pha chế
          </Button>
        )}
        {status === "preparing" && (
          <Button
            type="button"
            disabled={isUpdating}
            onClick={() => updateOrderStatus(order, "ready")}
            className={`${className} rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold`}
          >
            <PackageCheck className="h-3.5 w-3.5 mr-1" />
            Sẵn sàng
          </Button>
        )}
        {status === "ready" && (
          <Button
            type="button"
            disabled={isUpdating}
            onClick={() => updateOrderStatus(order, "complete")}
            className={`${className} rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Hoàn tất
          </Button>
        )}
        {!["completed", "cancelled"].includes(status) && (
          <Button
            type="button"
            disabled={isUpdating}
            variant="outline"
            onClick={() => updateOrderStatus(order, "cancel")}
            className={`${className} rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50 font-bold`}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Hủy
          </Button>
        )}
      </div>
    );
  };

  if (!hasHydrated) {
    return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-6 text-left">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/${locale}/staff/pos`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
              >
                <ChevronLeft className="h-4 w-4" />
                POS
              </Link>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#C8510A]">
                {user?.branchName || "Chi nhánh"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-zinc-950 font-outfit uppercase tracking-wide">
              Trung tâm đơn hàng
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">
              Sắp xếp theo trạng thái và thời gian tạo để xử lý đơn theo đúng thứ tự.
            </p>
          </div>

          <Button
            onClick={() => loadOrders()}
            disabled={isLoading || isUpdating || !canLoadStaffOrders}
            className="h-10 rounded-lg bg-[#C8510A] px-4 text-xs font-bold text-white hover:bg-[#a84408] self-start lg:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile label="Đang xử lý" value={counts.active} tone="amber" />
          <SummaryTile label="Chờ xác nhận" value={counts.pending} tone="rose" />
          <SummaryTile label="Đang pha chế" value={counts.preparing} tone="orange" />
          <SummaryTile label="Sẵn sàng" value={counts.ready} tone="sky" />
        </div>

        <div className="rounded-xl border border-border/80 bg-white p-3 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm mã đơn, tên khách, số điện thoại, món..."
                className="h-10 pl-9 text-xs font-semibold"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" />
              <span>{filteredOrders.length} đơn</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => {
              const isActive = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`h-8 shrink-0 rounded-lg border px-3 text-[11px] font-black transition-colors ${
                    isActive
                      ? "border-[#C8510A]/20 bg-[#F5EBE1] text-[#C8510A]"
                      : "border-border bg-white text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {item.label} ({counts[item.key]})
                </button>
              );
            })}
          </div>
        </div>

        {displayError ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p>{displayError}</p>
                  <p className="mt-1 text-xs font-semibold text-amber-800/80">
                    Trang đã ẩn danh sách cũ để tránh xử lý nhầm đơn khi phiên đăng nhập không hợp lệ.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => loadOrders()}
                  disabled={isLoading || !canLoadStaffOrders}
                  className="h-9 rounded-lg border-amber-300 bg-white px-3 text-xs font-bold text-amber-900 hover:bg-amber-100"
                >
                  <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Thử lại
                </Button>
                <Button
                  type="button"
                  onClick={handleStaffLoginRedirect}
                  className="h-9 rounded-lg bg-[#C8510A] px-3 text-xs font-bold text-white hover:bg-[#a84408]"
                >
                  Đăng nhập nhân viên
                </Button>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="rounded-xl border border-border/80 bg-white py-20 text-center text-xs font-semibold text-muted-foreground">
            {t("common.loading")}...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/85 bg-white p-12 text-center text-muted-foreground/70">
            <ClipboardList className="mx-auto h-10 w-10 stroke-[1.2] text-muted-foreground/45" />
            <p className="mt-2 text-xs font-bold">Không có đơn hàng phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-xs">
                <thead className="bg-[#F5EBE1]/70 text-[10px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-black">Thứ tự</th>
                    <th className="px-4 py-3 text-left font-black">Đơn hàng</th>
                    <th className="px-4 py-3 text-left font-black">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-black">Món</th>
                    <th className="px-4 py-3 text-left font-black">Tổng tiền</th>
                    <th className="px-4 py-3 text-left font-black">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-black">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id ?? order.orderCode} className="hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 align-top">
                        <div className="h-7 w-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black">
                          {index + 1}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getAgeLabel(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-black text-zinc-950">{order.orderCode || `#${order.id}`}</div>
                        <div className="mt-1 text-[10px] font-semibold text-muted-foreground">{formatDateTime(order.createdAt)}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#C8510A]">
                          <Truck className="h-3 w-3" />
                          {getOrderTypeLabel(order.orderType)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-extrabold text-zinc-900">{order.receiverName || "Khách"}</div>
                        <div className="mt-1 text-[10px] font-semibold text-muted-foreground">{order.receiverPhone || "-"}</div>
                        <div className="mt-1 max-w-[180px] truncate text-[10px] font-semibold text-muted-foreground">
                          {order.deliveryAddress || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="max-w-[260px] font-bold text-zinc-800">
                          {order.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
                        </div>
                        {order.note && (
                          <div className="mt-1 max-w-[260px] truncate text-[10px] font-semibold text-amber-800">
                            Ghi chú: {order.note}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-black text-[#C8510A]">{formatCurrency(order.totalAmount)}</div>
                        <div className="mt-1 text-[10px] font-semibold text-muted-foreground">{getPaymentLabel(order.paymentMethod)}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {renderOrderActions(order, true)}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handlePrintOrder(order)}
                            className="h-8 rounded-lg px-2 text-[10px] font-bold border-[#C8510A]/25 text-[#C8510A] hover:bg-[#F5EBE1]"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1" />
                            PDF
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 rounded-lg px-2 text-[10px] font-bold"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Chi tiết
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Đơn ${selectedOrder.orderCode || `#${selectedOrder.id}`}` : "Chi tiết đơn hàng"}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-5 text-left">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <div>
                <div className="text-lg font-black text-amber-950">{selectedOrder.orderCode}</div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
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
              <div className="flex flex-col items-start lg:items-end gap-2">
                <StatusPill status={selectedOrder.status} />
                <span className="text-[10px] font-bold text-muted-foreground">Tuổi đơn: {getAgeLabel(selectedOrder.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <DetailTile label="Khách hàng" value={selectedOrder.receiverName || "Khách"} />
              <DetailTile label="Số điện thoại" value={selectedOrder.receiverPhone || "-"} />
              <DetailTile label="Thanh toán" value={getPaymentLabel(selectedOrder.paymentMethod)} />
              <DetailTile label="Tổng tiền" value={formatCurrency(selectedOrder.totalAmount)} highlight />
            </div>

            <DetailTile label="Địa chỉ / nhận hàng" value={selectedOrder.deliveryAddress || getOrderTypeLabel(selectedOrder.orderType)} />

            {selectedOrder.note && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
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
                          x{item.quantity} - {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="font-black text-[#C8510A] whitespace-nowrap">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                    {item.toppings.length > 0 && (
                      <div className="mt-2 space-y-1 pl-3 border-l border-border">
                        {item.toppings.map((topping) => (
                          <div key={topping.toppingId} className="flex justify-between gap-2 text-[11px] text-muted-foreground">
                            <span>+ {topping.toppingName} x{topping.quantity}</span>
                            <span>{formatCurrency(topping.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="mt-2 text-[11px] italic text-amber-800">Ghi chú món: {item.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-border pt-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái hiện tại</div>
                <div className="mt-1 text-sm font-black text-zinc-900">{getStatusLabel(selectedOrder.status)}</div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="h-9 rounded-lg border-[#C8510A]/25 px-3 text-xs font-bold text-[#C8510A] hover:bg-[#F5EBE1]"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  In PDF
                </Button>
                {renderOrderActions(selectedOrder)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: "amber" | "rose" | "orange" | "sky" }) {
  const theme =
    tone === "rose"
      ? "border-rose-500/20 bg-rose-50 text-rose-700"
      : tone === "orange"
        ? "border-orange-500/20 bg-orange-50 text-orange-700"
        : tone === "sky"
          ? "border-sky-500/20 bg-sky-50 text-sky-700"
          : "border-amber-500/20 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-2xs ${theme}`}>
      <div className="text-[10px] font-black uppercase tracking-wider opacity-75">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
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
            : normalized === "confirmed"
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-800 border-amber-500/20";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function DetailTile({ label, value, highlight = false }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-extrabold ${highlight ? "text-[#C8510A]" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
