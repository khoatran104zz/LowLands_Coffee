"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, TrendingUp, DollarSign, ShoppingBag, Percent, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getOrders } from "@/services/order.service";
import { Order } from "@/types";
import { useParams } from "next/navigation";
import { StatsCard } from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        const data = await getOrders({ page: 0, size: 1000 });
        setOrders(data);
      } catch (error) {
        console.error("Failed to load reports order data", error);
      } finally {
        setIsLoading(false);
      }
    };
    void loadReportData();
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Process data
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter((o) => (o.status || "").toUpperCase() === "COMPLETED");
  const completedOrdersCount = completedOrders.length;
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const avgOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
  const completionRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;

  // Order status counts
  const statusCounts: Record<string, number> = {
    PENDING: 0,
    PREPARING: 0,
    COMPLETED: 0,
    CANCELLED: 0
  };
  orders.forEach((o) => {
    const s = (o.status || "").toUpperCase();
    if (s in statusCounts) {
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }
  });

  // Branch statistics
  const branchStatsMap: Record<string, { total: number; count: number; name: string }> = {};
  completedOrders.forEach((o) => {
    const storeId = o.storeId;
    const name = o.storeName || `Store #${storeId}`;
    if (!branchStatsMap[name]) {
      branchStatsMap[name] = { total: 0, count: 0, name };
    }
    branchStatsMap[name].total += o.totalAmount || 0;
    branchStatsMap[name].count += 1;
  });

  const branchStats = Object.values(branchStatsMap).sort((a, b) => b.total - a.total);

  // CSV Export Logic
  const handleExportCSV = () => {
    const headers = locale === "vi" 
      ? ["Chi nhanh", "Doanh thu (VND)", "So don hoan thanh", "Gia tri don TB (VND)"]
      : ["Store Branch", "Revenue (VND)", "Completed Orders", "Avg Order Value (VND)"];
      
    const rows = branchStats.map((b) => [
      b.name,
      b.total,
      b.count,
      b.count > 0 ? Math.round(b.total / b.count) : 0
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCaoDoanhThu_Lowlands_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-850" />
            {t("common.reports")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {locale === "vi" ? "Xem thống kê chi tiết, doanh thu các chi nhánh và xuất báo cáo dữ liệu." : "View branch sales, averages, order details, and export summary datasets."}
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={branchStats.length === 0}
          className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>{locale === "vi" ? "Xuất Excel/CSV" : "Export Excel/CSV"}</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={locale === "vi" ? "Tổng doanh thu" : "Total Revenue"}
              value={`${totalRevenue.toLocaleString("vi-VN")}đ`}
              icon={DollarSign}
              description={locale === "vi" ? "Tất cả đơn hàng hoàn thành" : "All completed sales order"}
            />
            <StatsCard
              title={locale === "vi" ? "Tổng số đơn hàng" : "Total Orders"}
              value={totalOrdersCount}
              icon={ShoppingBag}
              description={locale === "vi" ? "Tổng tất cả các trạng thái" : "Combined counts of all statuses"}
            />
            <StatsCard
              title={locale === "vi" ? "Đơn hàng trung bình" : "Avg Order Value"}
              value={`${Math.round(avgOrderValue).toLocaleString("vi-VN")}đ`}
              icon={TrendingUp}
              description={locale === "vi" ? "Giá trị trung bình đơn hàng" : "Average order ticket value"}
            />
            <StatsCard
              title={locale === "vi" ? "Tỷ lệ hoàn thành" : "Completion Rate"}
              value={`${completionRate.toFixed(1)}%`}
              icon={Percent}
              description={locale === "vi" ? "Tỷ lệ đơn hàng thành công" : "Successfully completed order ratio"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order status analysis */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 select-none space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {locale === "vi" ? "Phân tích trạng thái đơn" : "Order Status Distribution"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/10">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{locale === "vi" ? "Hoàn thành" : "Completed"}</span>
                  </div>
                  <span className="font-extrabold text-emerald-900">{statusCounts.COMPLETED}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/10">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span>{locale === "vi" ? "Đang chế biến" : "Preparing"}</span>
                  </div>
                  <span className="font-extrabold text-blue-900">{statusCounts.PREPARING}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/10">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <Clock className="h-4 w-4" />
                    <span>{locale === "vi" ? "Đang chờ duyệt" : "Pending"}</span>
                  </div>
                  <span className="font-extrabold text-amber-900">{statusCounts.PENDING}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/10">
                  <div className="flex items-center space-x-2 text-rose-800">
                    <XCircle className="h-4 w-4" />
                    <span>{locale === "vi" ? "Đã hủy" : "Cancelled"}</span>
                  </div>
                  <span className="font-extrabold text-rose-900">{statusCounts.CANCELLED}</span>
                </div>
              </div>
            </div>

            {/* Branch performance comparison */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                {locale === "vi" ? "Hiệu suất doanh thu các chi nhánh" : "Revenue Performance by Branch"}
              </h3>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">{locale === "vi" ? "Chi nhánh" : "Store Branch"}</th>
                      <th className="pb-3 text-right">{locale === "vi" ? "Doanh thu" : "Revenue"}</th>
                      <th className="pb-3 text-center">{locale === "vi" ? "Số đơn" : "Orders"}</th>
                      <th className="pb-3 text-right">{locale === "vi" ? "Giá trị đơn TB" : "Avg Ticket"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchStats.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-muted-foreground font-medium">
                          {locale === "vi" ? "Không có dữ liệu chi nhánh nào" : "No branch data available"}
                        </td>
                      </tr>
                    ) : (
                      branchStats.map((item, idx) => (
                        <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                          <td className="py-3 font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</td>
                          <td className="py-3 text-right font-extrabold text-emerald-700">{item.total.toLocaleString("vi-VN")}đ</td>
                          <td className="py-3 text-center font-semibold text-zinc-650 dark:text-zinc-350">{item.count}</td>
                          <td className="py-3 text-right font-bold text-zinc-700 dark:text-zinc-300">
                            {Math.round(item.total / item.count).toLocaleString("vi-VN")}đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
