"use client";

import React, { useState, useEffect } from "react";
import { OrderExtended } from "@/mock/orders";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAuthStore } from "@/store/auth.store";

export default function ManagerOrdersPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const orders = useDashboardStore((state) => state.orders);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);
  const currentUser = useAuthStore((state) => state.user);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(null);

  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const filteredOrders = orders
    .filter((o) => o.storeId === myBranchId)
    .filter((o) => {
      if (!statusFilter) return true;
      return o.status === statusFilter;
    });

  const columns: Column<OrderExtended>[] = [
    { key: "orderCode", header: t("admin.ordersPage.colCode") || "Mã đơn hàng" },
    { key: "receiverName", header: t("admin.ordersPage.colCustomer") || "Khách hàng" },
    {
      key: "createdAt",
      header: "Thời gian đặt",
      render: (item) => <span>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</span>
    },
    {
      key: "totalAmount",
      header: t("admin.ordersPage.colTotal") || "Thành tiền",
      render: (item) => <span className="font-extrabold text-amber-900">{item.totalAmount.toLocaleString()}đ</span>
    },
    {
      key: "paymentMethod",
      header: t("admin.ordersPage.colPayment") || "Thanh toán",
      render: (item) => {
        const labels = {
          cod: "Tiền mặt",
          bank_transfer: "Chuyển khoản",
          e_wallet: "Ví điện tử"
        };
        return <span>{labels[item.paymentMethod as keyof typeof labels] || item.paymentMethod}</span>;
      }
    },
    {
      key: "status",
      header: t("admin.ordersPage.colStatus") || "Trạng thái",
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenDetail = (order: OrderExtended) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus as any);
    toast.success(`Cập nhật trạng thái đơn hàng sang: ${newStatus}`);
    setSelectedOrder({ ...selectedOrder, status: newStatus as any });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("admin.ordersPage.title") || "Quản lý đơn hàng"} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.ordersPage.subtitle") || "Danh sách và luồng trạng thái đơn hàng của chi nhánh."}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.ordersPage.searchPlaceholder") || "Tìm theo mã hóa đơn, tên khách..."}
        />
        <Filter
          label={t("admin.ordersPage.statusFilter") || "Trạng thái"}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "pending", label: "Chờ pha chế" },
            { value: "preparing", label: "Đang làm món" },
            { value: "completed", label: "Đã hoàn tất" },
            { value: "cancelled", label: "Đã hủy" }
          ]}
          placeholder="Tất cả trạng thái"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        searchKey="orderCode"
        searchQuery={searchQuery}
        onView={handleOpenDetail}
      />

      {/* Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Chi tiết đơn hàng: ${selectedOrder?.orderCode}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-5 text-left select-none">
            {/* Status change actions */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-amber-900/10 space-y-2">
              <span className="block text-[#948175] font-bold uppercase text-[9px]">Cập nhật trạng thái đơn</span>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  onClick={() => handleStatusChange("pending")}
                  className={`h-8 text-[11px] font-bold rounded-lg ${
                    selectedOrder.status === "pending"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Chờ pha chế
                </Button>
                <Button
                  onClick={() => handleStatusChange("preparing")}
                  className={`h-8 text-[11px] font-bold rounded-lg ${
                    selectedOrder.status === "preparing"
                      ? "bg-amber-600 text-white"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Đang làm món
                </Button>
                <Button
                  onClick={() => handleStatusChange("completed")}
                  className={`h-8 text-[11px] font-bold rounded-lg ${
                    selectedOrder.status === "completed"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Hoàn tất đơn
                </Button>
                <Button
                  onClick={() => handleStatusChange("cancelled")}
                  className={`h-8 text-[11px] font-bold rounded-lg ${
                    selectedOrder.status === "cancelled"
                      ? "bg-rose-600 text-white"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-rose-50"
                  }`}
                >
                  Hủy đơn hàng
                </Button>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-bold text-zinc-800 uppercase font-outfit">Sản phẩm đã chọn</h4>
              <div className="mt-2 border border-zinc-150 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-semibold text-zinc-650">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Món nước</th>
                      <th className="p-3 text-center">Số lượng</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-250 bg-white">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="p-3">
                          <div>
                            <span className="font-extrabold text-zinc-800 block">{item.productName}</span>
                            {item.note && <span className="text-[10px] text-amber-900 block mt-0.5">Lưu ý: {item.note}</span>}
                          </div>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{item.unitPrice.toLocaleString()}đ</td>
                        <td className="p-3 text-right">{item.totalPrice.toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50/50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Tên người nhận</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">{selectedOrder.receiverName}</span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Điện thoại</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">{selectedOrder.receiverPhone}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Địa chỉ giao hàng</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">{selectedOrder.deliveryAddress || "Mua mang đi tại quầy"}</span>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="flex justify-between items-center border-t border-zinc-100 pt-4 mt-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Tổng cộng thanh toán:</span>
              <span className="text-base font-extrabold text-[#c8510a]">{selectedOrder.totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
