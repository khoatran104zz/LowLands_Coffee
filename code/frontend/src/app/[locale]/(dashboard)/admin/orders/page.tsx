"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChefHat, PackageCheck, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import {
  cancelOrder,
  completeOrder,
  confirmOrder,
  getOrders,
  prepareOrder,
  readyOrder,
} from "@/services/order.service";
import { DataTable, Column, ExtraAction } from "@/components/admin/DataTable";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { useTranslation } from "@/hooks/useTranslation";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const orderTypeOptions = [
  { value: "DELIVERY", label: "Delivery" },
  { value: "PICKUP", label: "Pickup" },
  { value: "DINE_IN", label: "Dine in" },
  { value: "TAKEAWAY", label: "Takeaway" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const statusLabel = (status?: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "preparing") return "Preparing";
  if (normalized === "ready") return "Ready";
  if (normalized === "completed") return "Completed";
  if (normalized === "cancelled") return "Cancelled";
  return status || "-";
};

const orderTypeLabel = (orderType: Order["orderType"]) => {
  if (orderType === "delivery") return "Delivery";
  if (orderType === "pickup") return "Pickup";
  if (orderType === "dine_in") return "Dine in";
  return "Takeaway";
};

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOrders({
        status: statusFilter || undefined,
        orderType: orderTypeFilter || undefined,
        search: searchQuery.trim() || undefined,
        page: 0,
        size: 100,
      });
      setOrders(data);
    } catch (error) {
      console.error("Failed to load admin orders", error);
      toast.error("Khong the tai danh sach don hang tu API.");
    } finally {
      setIsLoading(false);
    }
  }, [orderTypeFilter, searchQuery, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadOrders();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [loadOrders]);

  const summary = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status === "completed")
      .reduce((total, order) => total + order.totalAmount, 0);

    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      completed: orders.filter((order) => order.status === "completed").length,
      revenue,
    };
  }, [orders]);

  const updateOrderStatus = async (
    order: Order,
    action: "confirm" | "prepare" | "ready" | "complete" | "cancel"
  ) => {
    if (!order.id) return;

    if (action === "cancel") {
      const accepted = await confirm({
        title: t("common.confirmCancelOrderTitle"),
        message: `${t("common.confirmCancelOrderMessage")} ${order.orderCode || `#${order.id}`}`,
        confirmText: t("common.confirm"),
        cancelText: t("common.cancel"),
      });
      if (!accepted) return;
    }

    setIsUpdating(true);
    try {
      if (action === "confirm") await confirmOrder(order.id);
      if (action === "prepare") await prepareOrder(order.id);
      if (action === "ready") await readyOrder(order.id);
      if (action === "complete") await completeOrder(order.id);
      if (action === "cancel") await cancelOrder(order.id, "Admin cancelled order");
      toast.success("Cap nhat trang thai don hang thanh cong.");
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to update order status", error);
      toast.error("Khong the cap nhat trang thai don hang.");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "orderCode",
      header: t("admin.ordersPage.colCode"),
      render: (item) => <span className="font-extrabold text-amber-900">{item.orderCode || `#${item.id}`}</span>,
    },
    {
      key: "receiverName",
      header: t("admin.ordersPage.colCustomer"),
      render: (item) => (
        <div className="space-y-0.5">
          <div className="font-bold text-zinc-800 dark:text-zinc-100">{item.receiverName || "Walk-in Customer"}</div>
          <div className="text-[11px] text-muted-foreground">{item.receiverPhone || item.storeName || "-"}</div>
        </div>
      ),
    },
    {
      key: "orderType",
      header: "Type",
      render: (item) => orderTypeLabel(item.orderType),
    },
    {
      key: "totalAmount",
      header: t("admin.ordersPage.colTotal"),
      render: (item) => <span className="font-extrabold">{formatCurrency(item.totalAmount)}</span>,
    },
    {
      key: "paymentMethod",
      header: t("admin.ordersPage.colPayment"),
      render: (item) => (
        <div className="space-y-0.5">
          <div className="font-bold uppercase">{item.paymentMethod.replace("_", " ")}</div>
          <div className="text-[11px] text-muted-foreground">{item.payment?.paymentStatus || "UNPAID"}</div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: t("common.date"),
      render: (item) => formatDateTime(item.createdAt),
    },
    {
      key: "status",
      header: t("admin.ordersPage.colStatus"),
      render: (item) => <StatusBadge status={item.status || ""} customLabel={statusLabel(item.status)} />,
    },
  ];

  const actions: ExtraAction<Order>[] = [
    {
      icon: CheckCircle2,
      title: "Confirm",
      color: "hover:text-emerald-700",
      visible: (item) => item.status === "pending",
      onClick: (item) => updateOrderStatus(item, "confirm"),
    },
    {
      icon: ChefHat,
      title: "Prepare",
      color: "hover:text-orange-700",
      visible: (item) => item.status === "confirmed",
      onClick: (item) => updateOrderStatus(item, "prepare"),
    },
    {
      icon: PackageCheck,
      title: "Ready",
      color: "hover:text-sky-700",
      visible: (item) => item.status === "preparing",
      onClick: (item) => updateOrderStatus(item, "ready"),
    },
    {
      icon: CheckCircle2,
      title: "Complete",
      color: "hover:text-emerald-700",
      visible: (item) => item.status === "ready",
      onClick: (item) => updateOrderStatus(item, "complete"),
    },
    {
      icon: XCircle,
      title: "Cancel",
      color: "hover:text-rose-700",
      visible: (item) => !["completed", "cancelled"].includes(item.status || ""),
      onClick: (item) => updateOrderStatus(item, "cancel"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("admin.ordersPage.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Theo doi don hang va cap nhat trang thai truc tiep qua Backend Order API.
          </p>
        </div>
        <Button
          onClick={loadOrders}
          disabled={isLoading || isUpdating}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile label="Orders" value={summary.total} />
        <SummaryTile label="Pending" value={summary.pending} />
        <SummaryTile label="Completed" value={summary.completed} />
        <SummaryTile label="Revenue" value={formatCurrency(summary.revenue)} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.ordersPage.searchPlaceholder")}
        />
        <Filter
          label={t("admin.ordersPage.statusFilter")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder={t("common.all")}
        />
        <Filter
          label="Type"
          value={orderTypeFilter}
          onChange={setOrderTypeFilter}
          options={orderTypeOptions}
          placeholder={t("common.all")}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          {t("common.loading")}
        </div>
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          onView={setSelectedOrder}
          extraActions={actions}
          pageSize={10}
        />
      )}

      <FormModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.orderCode || "Order detail"}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailTile label="Customer" value={selectedOrder.receiverName || "Walk-in Customer"} />
              <DetailTile label="Phone" value={selectedOrder.receiverPhone || "-"} />
              <DetailTile label="Store" value={selectedOrder.storeName || `#${selectedOrder.storeId}`} />
              <DetailTile label="Type" value={orderTypeLabel(selectedOrder.orderType)} />
              <DetailTile label="Created" value={formatDateTime(selectedOrder.createdAt)} />
              <DetailTile label="Total" value={formatCurrency(selectedOrder.totalAmount)} />
              <DetailTile label="Payment status" value={selectedOrder.payment?.paymentStatus || "UNPAID"} />
              <DetailTile label="Payment id" value={selectedOrder.payment?.id ? `#${selectedOrder.payment.id}` : "-"} />
              <DetailTile label="Paid at" value={formatDateTime(selectedOrder.payment?.paidAt || undefined)} />
            </div>

            <div className="rounded-lg border border-border/70 overflow-hidden">
              <div className="bg-amber-50/60 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                Items
              </div>
              <div className="divide-y divide-border/60">
                {selectedOrder.items.map((item, index) => (
                  <div key={`${item.productVariantId}-${index}`} className="px-4 py-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-zinc-800 dark:text-zinc-100">
                          {item.productName} - {item.size}
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                          {item.toppings.length > 0 && (
                            <span> | {item.toppings.map((topping) => topping.toppingName).join(", ")}</span>
                          )}
                        </div>
                      </div>
                      <div className="font-extrabold whitespace-nowrap">{formatCurrency(item.totalPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
              {selectedOrder.status === "pending" && (
                <Button
                  disabled={isUpdating}
                  onClick={() => updateOrderStatus(selectedOrder, "confirm")}
                  className="h-9 text-xs bg-amber-850 hover:bg-amber-800 text-white"
                >
                  Confirm
                </Button>
              )}
              {selectedOrder.status === "confirmed" && (
                <Button disabled={isUpdating} onClick={() => updateOrderStatus(selectedOrder, "prepare")} className="h-9 text-xs">
                  Prepare
                </Button>
              )}
              {selectedOrder.status === "preparing" && (
                <Button disabled={isUpdating} onClick={() => updateOrderStatus(selectedOrder, "ready")} className="h-9 text-xs">
                  Ready
                </Button>
              )}
              {selectedOrder.status === "ready" && (
                <Button disabled={isUpdating} onClick={() => updateOrderStatus(selectedOrder, "complete")} className="h-9 text-xs">
                  Complete
                </Button>
              )}
              {!["completed", "cancelled"].includes(selectedOrder.status || "") && (
                <Button
                  disabled={isUpdating}
                  variant="outline"
                  onClick={() => updateOrderStatus(selectedOrder, "cancel")}
                  className="h-9 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-4 py-3 shadow-2xs">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-amber-900">{value}</div>
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xs font-extrabold text-zinc-800 dark:text-zinc-100">{value}</div>
    </div>
  );
}
