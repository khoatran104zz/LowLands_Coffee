"use client";

import React, { useState, useEffect } from "react";
import { OrderExtended } from "@/mock/orders";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Filter } from "@/components/tables/Filter";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";

export default function ManagerOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const orders = useDashboardStore((state) => state.orders);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  // StoreId = 2: Hồ Con Rùa branch orders ONLY
  const MY_BRANCH_ID = 2;
  const filteredOrders = orders
    .filter((o) => o.storeId === MY_BRANCH_ID)
    .filter((o) => {
      if (!statusFilter) return true;
      return o.status === statusFilter;
    });

  const orderStatusOptions = [
    { value: "pending", label: "Chờ pha chế" },
    { value: "preparing", label: "Đang làm món" },
    { value: "completed", label: "Đã giao / Hoàn tất" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const columns: Column<OrderExtended>[] = [
    { key: "orderCode", header: "Mã hóa đơn" },
    { key: "receiverName", header: "Khách hàng" },
    {
      key: "createdAt",
      header: "Thời gian đặt",
      render: (item) => <span>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</span>
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      render: (item) => <span className="font-bold text-amber-900">{item.totalAmount.toLocaleString()}đ</span>
    },
    {
      key: "paymentMethod",
      header: "Thanh toán",
      render: (item) => {
        const labels = {
          cod: "Tiền mặt",
          bank_transfer: "Chuyển khoản",
          e_wallet: "Ví MoMo"
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
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {UI_TEXT.manager.orderWorkflow}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Quy trình tiếp nhận, pha chế món và bàn giao nước cho khách hàng tại chi nhánh.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm mã đơn hàng, tên khách..."
        />
        <Filter
          label="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={orderStatusOptions}
          placeholder="Tất cả tiến độ"
        />
      </div>

      {/* Orders Table */}
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
        title={`Chi tiết đơn hàng Hồ Con Rùa - ${selectedOrder?.orderCode || ""}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground/80 bg-muted/20 border border-border/40 p-4 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Khách hàng</span>
                <div>Họ tên: {selectedOrder.receiverName}</div>
                <div>Điện thoại: {selectedOrder.receiverPhone}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Phương thức</span>
                <div>Loại đơn: {selectedOrder.orderType === "pickup" ? "Khách lấy tại quầy" : "Giao tận nơi"}</div>
                <div>Thanh toán: <span className="uppercase text-amber-900 font-bold">{selectedOrder.paymentMethod}</span></div>
              </div>
            </div>

            {/* Workflow controls */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Chuyển tiếp trạng thái đơn:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus("preparing")}
                  disabled={selectedOrder.status === "completed" || selectedOrder.status === "cancelled"}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-amber-800 hover:bg-amber-800 hover:text-white disabled:opacity-50"
                >
                  Bắt đầu làm món
                </button>
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={selectedOrder.status === "completed" || selectedOrder.status === "cancelled"}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-700 hover:bg-emerald-700 hover:text-white disabled:opacity-50"
                >
                  Hoàn tất / Giao hàng
                </button>
                <button
                  onClick={() => handleUpdateStatus("cancelled")}
                  disabled={selectedOrder.status === "completed" || selectedOrder.status === "cancelled"}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-600 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                >
                  Hủy đơn hàng
                </button>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Đồ uống cần pha chế:</label>
              <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
                <table className="w-full text-xs font-semibold text-foreground/80">
                  <thead className="bg-muted/30 border-b border-border/60">
                    <tr className="text-left text-muted-foreground uppercase text-[10px] font-bold">
                      <th className="py-2 px-4">Tên đồ uống</th>
                      <th className="py-2 px-4 text-center">Kích cỡ</th>
                      <th className="py-2 px-4 text-center">Số lượng</th>
                      <th className="py-2 px-4 text-right">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedOrder.items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr>
                          <td className="py-3 px-4 font-bold text-foreground">{item.productName}</td>
                          <td className="py-3 px-4 text-center">Size {item.size}</td>
                          <td className="py-3 px-4 text-center">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold">
                            {(item.totalPrice).toLocaleString()}đ
                          </td>
                        </tr>
                        {item.toppings && item.toppings.map((top, tIdx) => (
                          <tr key={`t-${idx}-${tIdx}`} className="bg-muted/10 text-muted-foreground">
                            <td className="py-1 px-4 pl-8 italic">+ {top.toppingName}</td>
                            <td className="py-1 px-4 text-center">-</td>
                            <td className="py-1 px-4 text-center">{top.quantity}</td>
                            <td className="py-1 px-4 text-right">
                              {((top.unitPrice * top.quantity) * item.quantity).toLocaleString()}đ
                            </td>
                          </tr>
                        ))}
                        {item.note && (
                          <tr className="bg-amber-800/[0.01]">
                            <td colSpan={4} className="py-1.5 px-4 italic text-amber-800 text-[11px]">
                              Chú thích: {item.note}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/40">
              <div className="w-60 text-xs font-semibold text-foreground space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính:</span>
                  <span>{selectedOrder.subtotal.toLocaleString()}đ</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Khuyến mãi:</span>
                    <span>-{selectedOrder.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-amber-900 pt-1">
                  <span>Tổng cộng:</span>
                  <span>{selectedOrder.totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsDetailOpen(false)} className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg px-6 h-10 text-xs font-semibold">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
