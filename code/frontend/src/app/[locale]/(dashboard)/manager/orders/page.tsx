"use client";

import React, { useState, useEffect } from "react";
import { Receipt, Search, Filter as FilterIcon, X, Check, AlertTriangle, Eye } from "lucide-react";
import { Order, OrderItemInput } from "@/types";
import { getOrders, confirmOrder, cancelOrder } from "@/services/order.service";
import { useAuthStore } from "@/store/auth.store";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";

export default function ManagerOrdersPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals controls
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const branchName = currentUser?.branchName || "Hồ Con Rùa";
  const myBranchId = currentUser?.branchId || 2;

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // By calling getOrders, the backend automatically scopes to manager's assigned branch
      const list = await getOrders({ storeId: myBranchId });
      setOrders(list);
    } catch (error) {
      console.error("Failed to load store orders", error);
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadOrders();
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Filter orders on client side for responsive search/filter
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch = !searchQuery || 
      (o.orderCode && o.orderCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.receiverName && o.receiverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.receiverPhone && o.receiverPhone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const columns: Column<Order>[] = [
    { key: "orderCode", header: "Mã đơn hàng", render: (item) => <span className="font-mono font-bold text-amber-900">{item.orderCode}</span> },
    { key: "receiverName", header: "Khách hàng", render: (item) => <span>{item.receiverName}</span> },
    { 
      key: "orderType", 
      header: "Hình thức", 
      render: (item) => {
        const typeLabels: Record<string, string> = {
          delivery: "Giao hàng",
          pickup: "Tự nhận",
          dine_in: "Tại quán",
          takeaway: "Mang đi",
        };
        return <span>{typeLabels[item.orderType] || item.orderType}</span>;
      }
    },
    { 
      key: "totalAmount", 
      header: "Tổng tiền", 
      render: (item) => <span className="font-extrabold text-[#c8510a]">{item.totalAmount.toLocaleString()}đ</span> 
    },
    { 
      key: "status", 
      header: "Trạng thái", 
      render: (item) => <StatusBadge status={item.status || "pending"} /> 
    },
    { 
      key: "createdAt", 
      header: "Thời gian", 
      render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US") : "N/A" 
    }
  ];

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder?.id) return;
    setIsActionLoading(true);
    try {
      await confirmOrder(selectedOrder.id);
      toast.success(`Đã xác nhận đơn hàng ${selectedOrder.orderCode}`);
      setIsConfirmOpen(false);
      setIsDetailOpen(false);
      loadOrders();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xác nhận đơn hàng.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenCancel = () => {
    setCancelReason("");
    setIsCancelOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder?.id) return;
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    setIsActionLoading(true);
    try {
      await cancelOrder(selectedOrder.id, cancelReason);
      toast.success(`Đã hủy đơn hàng ${selectedOrder.orderCode}`);
      setIsCancelOpen(false);
      setIsDetailOpen(false);
      loadOrders();
    } catch (error) {
      console.error(error);
      toast.error("Không thể hủy đơn hàng.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            {t("manager.orders.title")} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("manager.orders.subtitle")}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
        />
        <Filter
          label="Trạng thái đơn"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "pending", label: "Chờ xác nhận (Pending)" },
            { value: "confirmed", label: "Đã xác nhận (Confirmed)" },
            { value: "preparing", label: "Đang làm món (Preparing)" },
            { value: "ready", label: "Chờ lấy (Ready)" },
            { value: "completed", label: "Hoàn tất (Completed)" },
            { value: "cancelled", label: "Đã hủy (Cancelled)" },
          ]}
          placeholder="Tất cả trạng thái"
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          Đang tải danh sách đơn hàng...
        </div>
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchKey="orderCode"
          searchQuery={searchQuery}
          onView={handleOpenDetail}
        />
      )}

      {/* Detail Dialog */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Chi tiết đơn hàng: ${selectedOrder?.orderCode || ""}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-zinc-50/50 dark:bg-zinc-950/20 border border-border p-3.5 rounded-xl space-y-1.5">
                <div className="font-bold text-zinc-400 uppercase text-[9px] select-none">Khách hàng</div>
                <div className="font-extrabold text-zinc-800 dark:text-zinc-250 text-sm">{selectedOrder.receiverName}</div>
                <div className="font-semibold text-zinc-500">SĐT: {selectedOrder.receiverPhone}</div>
                <div className="font-semibold text-zinc-500 truncate" title={selectedOrder.deliveryAddress}>Địa chỉ: {selectedOrder.deliveryAddress}</div>
              </div>
              <div className="bg-zinc-50/50 dark:bg-zinc-950/20 border border-border p-3.5 rounded-xl space-y-1.5">
                <div className="font-bold text-zinc-400 uppercase text-[9px] select-none">Thông tin đơn</div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-zinc-500">Hình thức:</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {selectedOrder.orderType === "delivery" ? "Giao hàng" : selectedOrder.orderType === "pickup" ? "Tự nhận" : selectedOrder.orderType === "dine_in" ? "Tại quán" : "Mang đi"}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-zinc-500">Thanh toán:</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {selectedOrder.paymentMethod === "bank_transfer" ? "Chuyển khoản" : selectedOrder.paymentMethod === "e_wallet" ? "Ví điện tử" : "Tiền mặt"}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-zinc-500">Trạng thái:</span>
                  <StatusBadge status={selectedOrder.status || "pending"} />
                </div>
              </div>
            </div>

            {/* Note */}
            {selectedOrder.note && (
              <div className="bg-amber-50/40 border border-amber-900/10 p-3 rounded-lg text-xs italic text-amber-900 select-none">
                Ghi chú đơn hàng: {selectedOrder.note}
              </div>
            )}

            {/* Order Items Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background">
              <table className="w-full text-xs font-semibold text-foreground/80">
                <thead className="bg-muted border-b border-border">
                  <tr className="text-left text-zinc-450 uppercase text-[10px] font-bold">
                    <th className="p-3">Mặt hàng</th>
                    <th className="p-3 text-center">Kích cỡ</th>
                    <th className="p-3 text-center">Số lượng</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedOrder.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-muted/10">
                        <td className="p-3 font-bold text-foreground">{item.productName}</td>
                        <td className="p-3 text-center">Size {item.size}</td>
                        <td className="p-3 text-center">x{item.quantity}</td>
                        <td className="p-3 text-right">{item.unitPrice.toLocaleString()}đ</td>
                        <td className="p-3 text-right font-extrabold text-[#c8510a]">{(item.quantity * item.unitPrice).toLocaleString()}đ</td>
                      </tr>
                      {item.toppings && item.toppings.map((top, tIdx) => (
                        <tr key={tIdx} className="bg-muted/10 text-muted-foreground text-[11px]">
                          <td className="p-2 pl-8 font-medium">+ Topping: {top.toppingName}</td>
                          <td className="p-2 text-center">-</td>
                          <td className="p-2 text-center">x{top.quantity}</td>
                          <td className="p-2 text-right">{top.unitPrice.toLocaleString()}đ</td>
                          <td className="p-2 text-right">{(top.quantity * top.unitPrice).toLocaleString()}đ</td>
                        </tr>
                      ))}
                      {item.note && (
                        <tr className="bg-amber-800/[0.01] text-[11px]">
                          <td colSpan={5} className="p-2 pl-8 italic text-amber-800/80">
                            Yêu cầu thêm: {item.note}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total summary */}
            <div className="flex justify-between items-center bg-[#FAF7F2] p-4 rounded-xl border border-amber-900/10">
              <span className="text-xs font-bold text-amber-950 uppercase select-none">Tổng giá trị thanh toán:</span>
              <span className="text-base font-extrabold text-[#c8510a]">{selectedOrder.totalAmount.toLocaleString()}đ</span>
            </div>

            {/* Actions for Manager: Confirm & Cancel ONLY */}
            <div className="flex justify-end space-x-2 border-t border-border pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="h-10 text-xs font-semibold rounded-lg"
              >
                Đóng
              </Button>

              {(selectedOrder.status === "pending" || selectedOrder.status === "confirmed") && (
                <Button
                  onClick={handleOpenCancel}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                >
                  Hủy đơn hàng
                </Button>
              )}

              {selectedOrder.status === "pending" && (
                <Button
                  onClick={handleOpenConfirm}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                >
                  Xác nhận đơn
                </Button>
              )}
            </div>
          </div>
        )}
      </FormModal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmOrder}
        title="Xác nhận đơn hàng"
        message={`Bạn có chắc chắn muốn xác nhận đơn hàng ${selectedOrder?.orderCode}?`}
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
      />

      {/* Cancel Reason Dialog */}
      <FormModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title={`Hủy đơn hàng: ${selectedOrder?.orderCode || ""}`}
        size="md"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive select-none">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Hành động hủy đơn hàng sẽ chuyển trạng thái đơn sang Cancelled và không thể hoàn tác.</span>
          </div>

          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">Lý do hủy đơn hàng *</label>
            <Input
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy (ví dụ: Hết nguyên liệu, Khách yêu cầu hủy...)"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="flex justify-end space-x-2 border-t border-border pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
              disabled={isActionLoading}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={isActionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
