"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { Order } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { getOrders } from "@/services/order.service";

export default function StaffHistoryPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadHistory = async () => {
    if (!user?.branchId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setApiError(null);
    try {
      const fetched = await getOrders({ storeId: user.branchId, page: 0, size: 100 });
      setOrders(fetched);
    } catch (error) {
      console.error("Failed to load historical orders from API", error);
      setApiError("Không thể kết nối đến backend API. Đang đợi kết nối...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (user?.branchId) {
      loadHistory();
    }
  }, [user?.branchId]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Completed or Cancelled branch orders
  const branchHistory = orders.filter(
    (o) => o.status === "completed" || o.status === "cancelled"
  );

  const columns: Column<Order>[] = [
    { key: "orderCode", header: "Mã hóa đơn" },
    { key: "receiverName", header: "Khách hàng" },
    {
      key: "createdAt",
      header: "Thời gian",
      render: (item) => <span>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}</span>
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      render: (item) => <span className="font-bold text-amber-900">{item.totalAmount.toLocaleString("vi-VN")}đ</span>
    },
    {
      key: "paymentMethod",
      header: "Hình thức",
      render: (item) => <span className="uppercase text-xs font-semibold">{item.paymentMethod}</span>
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => {
        const style = item.status === "completed" ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700";
        const label = item.status === "completed" ? "Hoàn thành" : "Đã hủy";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none ${style}`}>
            {label}
          </span>
        );
      }
    }
  ];

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 text-left">
      <div className="flex justify-between items-center select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử giao dịch quầy - {user?.branchName || "Chi nhánh"}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Danh sách hóa đơn bán lẻ đã thanh toán hoặc đã hủy tại chi nhánh.
          </p>
        </div>
        <Link
          href="/vi/staff/pos"
          className="flex items-center space-x-1.5 px-3 py-2 border border-border bg-background hover:bg-muted text-xs font-bold rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Về màn hình POS</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm mã hóa đơn..."
        />
      </div>

      {apiError ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center select-none">
          <p className="text-sm font-bold text-amber-900">{apiError}</p>
          <Button onClick={loadHistory} variant="outline" className="mt-3 text-xs font-bold border-amber-600/20 text-[#C8510A] hover:bg-[#C8510A]/5">
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-20 text-muted-foreground select-none font-semibold text-xs">
          {t("common.loading")}...
        </div>
      ) : branchHistory.length === 0 ? (
        <div className="border border-dashed border-border/85 rounded-xl p-12 text-center select-none text-muted-foreground/60 bg-white">
          <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground/45 stroke-[1.2]" />
          <p className="text-xs font-bold">Chưa có dữ liệu lịch sử đơn hàng tại chi nhánh.</p>
        </div>
      ) : (
        <DataTable
          data={branchHistory}
          columns={columns as any}
          searchKey="orderCode"
          searchQuery={searchQuery}
          onView={handleOpenDetail as any}
        />
      )}

      {/* Detail Dialog */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Chi tiết đơn hàng cũ - ${selectedOrder?.orderCode || ""}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4 text-left">
            <div className="bg-muted/30 border border-border/40 rounded-lg p-3 text-xs space-y-1">
              <div>Khách hàng: <span className="font-bold">{selectedOrder.receiverName}</span></div>
              <div>Số điện thoại: <span className="font-bold">{selectedOrder.receiverPhone}</span></div>
              <div>Trạng thái: <span className={selectedOrder.status === "completed" ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                {selectedOrder.status === "completed" ? "Hoàn tất" : "Đã hủy"}
              </span></div>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
              <table className="w-full text-xs font-semibold text-foreground/80">
                <thead className="bg-muted/30 border-b border-border/60">
                  <tr className="text-left text-muted-foreground uppercase text-[10px] font-bold">
                    <th className="py-2 px-4">Đồ uống / bánh</th>
                    <th className="py-2 px-4 text-center">Kích cỡ</th>
                    <th className="py-2 px-4 text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedOrder.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-zinc-900">{item.productName} (x{item.quantity})</td>
                        <td className="py-2.5 px-4 text-center">Size {item.size}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-zinc-900">
                          {(item.totalPrice).toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                      {item.toppings && item.toppings.map((top, tIdx) => (
                        <tr key={tIdx} className="bg-muted/10 text-muted-foreground">
                          <td className="py-1 px-4 pl-8 italic">+ {top.toppingName}</td>
                          <td className="py-1 px-4 text-center">-</td>
                          <td className="py-1 px-4 text-right">
                            {((top.unitPrice * top.quantity) * item.quantity).toLocaleString("vi-VN")}đ
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/40 text-xs font-semibold text-zinc-800">
              <div className="w-48 space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính:</span>
                  <span>{selectedOrder.subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Khuyến mãi:</span>
                    <span>-{selectedOrder.discountAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-amber-900 pt-1">
                  <span>Tổng tiền:</span>
                  <span>{selectedOrder.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border/40 pt-4 mt-2">
              <Button onClick={() => setIsDetailOpen(false)} className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg px-5 h-9 text-xs font-semibold">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
