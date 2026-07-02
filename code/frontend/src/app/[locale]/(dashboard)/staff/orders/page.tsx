"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { DataTable, Column } from "@/components/tables/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { ChevronLeft, Coffee } from "lucide-react";
import { getOrders, prepareOrder, completeOrder } from "@/services/order.service";

export default function StaffOrdersPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
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
      console.error("Failed to load orders from backend API", error);
      setApiError("Không thể kết nối đến backend API. Đang đợi kết nối...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (user?.branchId) {
      loadOrders();
    }
  }, [user?.branchId]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Active preparation orders: pending or preparing
  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  );

  const columns: Column<Order>[] = [
    { key: "orderCode", header: "Mã hóa đơn" },
    { key: "receiverName", header: "Khách hàng" },
    {
      key: "createdAt",
      header: "Thời gian",
      render: (item) => <span>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString("vi-VN") : ""}</span>
    },
    {
      key: "items",
      header: "Món cần chuẩn bị",
      render: (item) => (
        <span className="font-semibold block max-w-[200px] truncate">
          {item.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
        </span>
      )
    },
    {
      key: "status",
      header: "Tiến độ",
      render: (item) => {
        const style = item.status === "pending" ? "bg-blue-500/10 text-blue-700" : "bg-amber-500/10 text-amber-700 animate-pulse";
        const label = item.status === "pending" ? "Chờ pha chế" : "Đang làm món";
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

  const handleUpdateStatus = async (status: Order["status"]) => {
    if (!selectedOrder || !selectedOrder.id) return;
    try {
      if (status === "preparing") {
        const updated = await prepareOrder(selectedOrder.id);
        setSelectedOrder(updated);
        toast.success("Đã nhận pha chế món thành công!");
      } else if (status === "completed") {
        const updated = await completeOrder(selectedOrder.id);
        setSelectedOrder(null);
        setIsDetailOpen(false);
        toast.success("Pha chế hoàn tất!");
      }
      loadOrders();
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 text-left">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Đơn hàng cần pha chế - {user?.branchName || "Chi nhánh"}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Danh sách đồ uống đang chờ thu ngân / pha chế chuẩn bị phục vụ khách hàng.
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

      {apiError ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center select-none">
          <p className="text-sm font-bold text-amber-900">{apiError}</p>
          <Button onClick={loadOrders} variant="outline" className="mt-3 text-xs font-bold border-amber-600/20 text-[#C8510A] hover:bg-[#C8510A]/5">
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-20 text-muted-foreground select-none font-semibold text-xs">
          {t("common.loading")}...
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="border border-dashed border-border/85 rounded-xl p-12 text-center select-none text-muted-foreground/60 bg-white">
          <Coffee className="h-10 w-10 mx-auto mb-2 text-muted-foreground/45 stroke-[1.2]" />
          <p className="text-xs font-bold">Chưa có dữ liệu đơn hàng cần pha chế tại chi nhánh.</p>
        </div>
      ) : (
        <DataTable
          data={activeOrders}
          columns={columns as any}
          searchKey="orderCode"
          searchQuery={searchQuery}
          onView={handleOpenDetail as any}
        />
      )}

      {/* Detail dialog */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Chi tiết pha chế - ${selectedOrder?.orderCode || ""}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-5 text-left">
            <div className="space-y-1">
              <div>Khách hàng: <span className="font-bold">{selectedOrder.receiverName}</span></div>
              <div>Hình thức: <span className="font-bold">{selectedOrder.orderType === "pickup" ? "Khách tự lấy" : "Giao đi"}</span></div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleUpdateStatus("preparing")}
                disabled={selectedOrder.status === "preparing"}
                className="bg-amber-800 hover:bg-amber-700 text-white rounded-lg h-10 text-xs font-semibold"
              >
                Nhận làm món (Preparing)
              </Button>
              <Button
                onClick={() => handleUpdateStatus("completed")}
                className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg h-10 text-xs font-semibold"
              >
                Làm xong / Giao hàng
              </Button>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
              <table className="w-full text-xs font-semibold text-foreground/80">
                <thead className="bg-muted/30 border-b border-border/60">
                  <tr className="text-left text-muted-foreground uppercase text-[10px] font-bold">
                    <th className="py-2 px-4">Tên đồ uống</th>
                    <th className="py-2 px-4 text-center">Kích cỡ</th>
                    <th className="py-2 px-4 text-center">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedOrder.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-foreground">{item.productName}</td>
                        <td className="py-2.5 px-4 text-center">Size {item.size}</td>
                        <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                      </tr>
                      {item.toppings && item.toppings.map((top, tIdx) => (
                        <tr key={tIdx} className="bg-muted/10 text-muted-foreground">
                          <td className="py-1 px-4 pl-8 italic">+ Topping: {top.toppingName}</td>
                          <td className="py-1 px-4 text-center">-</td>
                          <td className="py-1 px-4 text-center">{top.quantity}</td>
                        </tr>
                      ))}
                      {item.note && (
                        <tr className="bg-amber-800/[0.01]">
                          <td colSpan={3} className="py-1.5 px-4 italic text-amber-800 text-[11px]">
                            Chú thích pha chế: {item.note}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
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
