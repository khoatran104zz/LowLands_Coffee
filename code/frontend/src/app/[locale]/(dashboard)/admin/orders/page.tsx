"use client";

import React, { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import { OrderExtended } from "@/mock/orders";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Filter } from "@/components/tables/Filter";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";

export default function AdminOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const orders = useDashboardStore((state) => state.orders);
  const branches = useDashboardStore((state) => state.branches);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);

  // Detail Modal control
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchBranch = !branchFilter || o.storeId === parseInt(branchFilter);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchBranch && matchStatus;
  });

  const branchFilterOptions = branches.map((b) => ({
    value: String(b.id),
    label: b.name
  }));

  const orderStatusOptions = [
    { value: "pending", label: "Chờ xử lý (Pending)" },
    { value: "preparing", label: "Đang pha chế (Preparing)" },
    { value: "completed", label: "Hoàn tất (Completed)" },
    { value: "cancelled", label: "Đã hủy (Cancelled)" }
  ];

  const columns: Column<OrderExtended>[] = [
    { key: "orderCode", header: "Mã hóa đơn" },
    { key: "storeName", header: "Chi nhánh" },
    { key: "receiverName", header: "Khách hàng" },
    {
      key: "createdAt",
      header: "Thời gian đặt",
      render: (item) => <span>{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
    },
    {
      key: "totalAmount",
      header: "Tổng thanh toán",
      render: (item) => <span className="font-bold text-amber-900">{item.totalAmount.toLocaleString()}đ</span>
    },
    {
      key: "paymentMethod",
      header: "Phương thức",
      render: (item) => {
        const labels = {
          cod: "Tiền mặt",
          bank_transfer: "Chuyển khoản",
          e_wallet: "Ví điện tử"
        };
        return <span>{labels[item.paymentMethod]}</span>;
      }
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => {
        const styles = {
          pending: "bg-blue-500/10 text-blue-700",
          preparing: "bg-amber-500/10 text-amber-700",
          completed: "bg-emerald-500/10 text-emerald-700",
          cancelled: "bg-rose-500/10 text-rose-700"
        };
        const labels = {
          pending: "Chờ pha chế",
          preparing: "Đang làm món",
          completed: "Hoàn tất",
          cancelled: "Đã hủy"
        };
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none ${styles[item.status]}`}>
            {labels[item.status]}
          </span>
        );
      }
    }
  ];

  const handleOpenDetail = (order: OrderExtended) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (status: OrderExtended["status"]) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, status);
    setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    toast.success(`Đã cập nhật trạng thái đơn sang: ${status}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {UI_TEXT.common.orders}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Theo dõi tiến độ, thanh toán và xử lý đơn hàng tại quầy &amp; giao đi cho khách hàng.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm mã hóa đơn, SĐT nhận..."
        />
        <Filter
          label="Chi nhánh"
          value={branchFilter}
          onChange={setBranchFilter}
          options={branchFilterOptions}
          placeholder="Tất cả chi nhánh"
        />
        <Filter
          label="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={orderStatusOptions}
          placeholder="Tất cả trạng thái"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        searchKey="orderCode"
        searchQuery={searchQuery}
        onView={handleOpenDetail}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Chi tiết đơn hàng ${selectedOrder?.orderCode || ""}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 text-left">
            {/* Customer & Delivery block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-foreground/80 bg-muted/20 border border-border/40 p-4 rounded-xl">
              <div className="space-y-1.5">
                <span className="text-muted-foreground block select-none uppercase tracking-wider text-[10px] font-bold">Người nhận hàng</span>
                <div>Họ tên: <span className="font-bold text-foreground">{selectedOrder.receiverName}</span></div>
                <div>Điện thoại: <span className="font-bold text-foreground">{selectedOrder.receiverPhone}</span></div>
                <div>Chi nhánh nhận đơn: <span className="font-bold text-foreground">{selectedOrder.storeName}</span></div>
              </div>
              <div className="space-y-1.5">
                <span className="text-muted-foreground block select-none uppercase tracking-wider text-[10px] font-bold">Phương thức giao hàng &amp; Thanh toán</span>
                <div>Kiểu giao hàng: <span className="font-bold text-foreground uppercase">{selectedOrder.orderType === "pickup" ? "Nhận tại quầy" : "Giao tận nơi"}</span></div>
                <div>Địa chỉ: <span className="font-bold text-foreground">{selectedOrder.deliveryAddress}</span></div>
                <div>Hình thức thanh toán: <span className="font-bold text-amber-900 uppercase">{selectedOrder.paymentMethod}</span></div>
              </div>
            </div>

            {/* Workflow state buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Cập nhật tiến độ đơn hàng:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedOrder.status === "pending"
                      ? "bg-blue-600 border-blue-650 text-white"
                      : "border-border hover:bg-blue-500/10 hover:text-blue-700"
                  }`}
                >
                  Chờ xử lý
                </button>
                <button
                  onClick={() => handleUpdateStatus("preparing")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedOrder.status === "preparing"
                      ? "bg-amber-600 border-amber-650 text-white"
                      : "border-border hover:bg-amber-500/10 hover:text-amber-700"
                  }`}
                >
                  Đang làm món
                </button>
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedOrder.status === "completed"
                      ? "bg-emerald-600 border-emerald-650 text-white"
                      : "border-border hover:bg-emerald-500/10 hover:text-emerald-700"
                  }`}
                >
                  Hoàn thành
                </button>
                <button
                  onClick={() => handleUpdateStatus("cancelled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedOrder.status === "cancelled"
                      ? "bg-rose-600 border-rose-650 text-white"
                      : "border-border hover:bg-rose-500/10 hover:text-rose-700"
                  }`}
                >
                  Hủy đơn hàng
                </button>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block select-none">Món nước đã chọn:</label>
              <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
                <table className="w-full text-xs font-semibold text-foreground/80">
                  <thead className="bg-muted/30 border-b border-border/60">
                    <tr className="text-left text-muted-foreground uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-4">Tên đồ uống / Topping</th>
                      <th className="py-2.5 px-4 text-center">Kích cỡ</th>
                      <th className="py-2.5 px-4 text-right">Đơn giá</th>
                      <th className="py-2.5 px-4 text-center">Số lượng</th>
                      <th className="py-2.5 px-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedOrder.items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        {/* Main Product row */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-foreground">{item.productName}</td>
                          <td className="py-3 px-4 text-center">Size {item.size}</td>
                          <td className="py-3 px-4 text-right">{item.unitPrice.toLocaleString()}đ</td>
                          <td className="py-3 px-4 text-center">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold text-foreground">
                            {(item.unitPrice * item.quantity).toLocaleString()}đ
                          </td>
                        </tr>

                        {/* Toppings rows */}
                        {item.toppings && item.toppings.map((top, tIdx) => (
                          <tr key={`t-${idx}-${tIdx}`} className="bg-muted/10 text-muted-foreground">
                            <td className="py-1.5 px-4 pl-8 italic">+ {top.toppingName}</td>
                            <td className="py-1.5 px-4 text-center">-</td>
                            <td className="py-1.5 px-4 text-right">+{top.unitPrice.toLocaleString()}đ</td>
                            <td className="py-1.5 px-4 text-center">{top.quantity}</td>
                            <td className="py-1.5 px-4 text-right">
                              {((top.unitPrice * top.quantity) * item.quantity).toLocaleString()}đ
                            </td>
                          </tr>
                        ))}

                        {/* Note row */}
                        {item.note && (
                          <tr className="bg-amber-800/[0.02]">
                            <td colSpan={5} className="py-2 px-4 italic text-amber-800 text-[11px]">
                              Ghi chú đồ uống: {item.note}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations total */}
            <div className="flex justify-end pt-2 border-t border-border/40">
              <div className="w-64 space-y-1.5 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="text-foreground">{(selectedOrder.subtotal).toLocaleString()}đ</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Mã giảm giá:</span>
                    <span>-{selectedOrder.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground pt-1.5">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-amber-900 font-outfit text-base">{(selectedOrder.totalAmount).toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsDetailOpen(false)} className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg px-6 h-10 text-xs font-semibold">
                Đóng chi tiết
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
