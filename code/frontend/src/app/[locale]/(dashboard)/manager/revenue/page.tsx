"use client";

import React, { useState, useEffect } from "react";
import { Coins, TrendingUp, Calendar } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ChartCard } from "@/components/admin/ChartCard";
import { BarChart, LineChart, ChartDataItem } from "@/components/charts/Chart";
import { useTranslation } from "@/hooks/useTranslation";
import { OrderExtended } from "@/mock/orders";
import { useAuthStore } from "@/store/auth.store";
import { StatsCard } from "@/components/admin/StatsCard";

export default function ManagerRevenuePage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const orders = useDashboardStore((state) => state.orders);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const myBranchOrders = orders.filter((o) => o.storeId === myBranchId);
  const myCompletedOrders = myBranchOrders.filter((o) => o.status === "completed");

  // Sums
  const todayRevenue = myCompletedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Simulated weekly / monthly
  const weeklyRevenue = todayRevenue + 12800000;
  const monthlyRevenue = todayRevenue + 45900000;

  const columns: Column<OrderExtended>[] = [
    { key: "orderCode", header: t("admin.ordersPage.colCode") || "Mã hóa đơn" },
    {
      key: "createdAt",
      header: "Thời gian lập hóa đơn",
      render: (item) => <span>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</span>
    },
    { key: "receiverName", header: t("admin.ordersPage.colCustomer") || "Khách hàng" },
    {
      key: "totalAmount",
      header: t("admin.ordersPage.colTotal") || "Thanh toán",
      render: (item) => <span className="font-bold text-amber-900">{item.totalAmount.toLocaleString("vi-VN")}đ</span>
    },
    {
      key: "paymentMethod",
      header: t("admin.ordersPage.colPayment") || "Thanh toán",
      render: (item) => <span className="uppercase text-xs font-semibold text-zinc-500">{item.paymentMethod}</span>
    }
  ];

  // Daily revenue trend (last 5 days)
  const dailyTrendData: ChartDataItem[] = [
    { label: "27/06", value: 2400000 },
    { label: "28/06", value: 3100000 },
    { label: "29/06", value: 1800000 },
    { label: "30/06", value: 4200000 },
    { label: "01/07", value: Math.max(3000000, todayRevenue) }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          Doanh thu chi nhánh - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Báo cáo thống kê tổng doanh thu bán lẻ qua quầy POS của chi nhánh Hồ Con Rùa.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={t("staff.manager.todayRevenue") || "Doanh thu hôm nay"}
          value={`${todayRevenue.toLocaleString("vi-VN")}đ`}
          icon={Coins}
          description="Doanh số thực tế hôm nay"
        />
        <StatsCard
          title={t("staff.manager.weeklyRevenue") || "Doanh thu tuần này"}
          value={`${weeklyRevenue.toLocaleString("vi-VN")}đ`}
          icon={TrendingUp}
          description="Tổng doanh số tuần này"
        />
        <StatsCard
          title={t("staff.manager.monthlyRevenue") || "Doanh thu tháng này"}
          value={`${monthlyRevenue.toLocaleString("vi-VN")}đ`}
          icon={Calendar}
          description="Tổng doanh số tháng này"
        />
      </div>

      {/* Charts & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Xu hướng doanh thu 5 ngày qua">
            <LineChart data={dailyTrendData} />
          </ChartCard>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-2xs text-left select-none">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-outfit">Hiệu suất chỉ tiêu</h4>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Chỉ tiêu doanh thu tuần</span>
                <span className="text-[#c8510a]">85%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200/20">
                <div className="bg-[#c8510a] h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Chỉ tiêu đơn hàng/ngày</span>
                <span className="text-[#c8510a]">92%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200/20">
                <div className="bg-[#c8510a] h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        <h4 className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
          Hóa đơn hoàn tất gần đây
        </h4>
        <DataTable
          data={myCompletedOrders}
          columns={columns}
          searchKey="orderCode"
          searchQuery=""
        />
      </div>
    </div>
  );
}
