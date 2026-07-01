"use client";

import React, { useState, useEffect } from "react";
import { Coins, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { BarChart, LineChart, ChartDataItem } from "@/components/charts/Chart";
import { useTranslation } from "@/hooks/useTranslation";
import { OrderExtended } from "@/mock/orders";

export default function ManagerRevenuePage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const orders = useDashboardStore((state) => state.orders);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // StoreId = 2: Hồ Con Rùa orders
  const MY_BRANCH_ID = 2;
  const myBranchOrders = orders.filter((o) => o.storeId === MY_BRANCH_ID);
  const myCompletedOrders = myBranchOrders.filter((o) => o.status === "completed");

  // Sums
  const todayRevenue = myCompletedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Simulated weekly / monthly
  const weeklyRevenue = todayRevenue + 12800000;
  const monthlyRevenue = todayRevenue + 45900000;

  const columns: Column<OrderExtended>[] = [
    { key: "orderCode", header: "Mã hóa đơn" },
    {
      key: "createdAt",
      header: "Thời gian",
      render: (item) => <span>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</span>
    },
    { key: "receiverName", header: "Khách hàng" },
    {
      key: "totalAmount",
      header: "Thanh toán",
      render: (item) => <span className="font-bold text-amber-900">{item.totalAmount.toLocaleString("vi-VN")}đ</span>
    },
    {
      key: "paymentMethod",
      header: "Hình thức",
      render: (item) => <span className="uppercase text-xs font-semibold">{item.paymentMethod}</span>
    }
  ];

  // Daily revenue trend (last 5 days)
  const dailyTrendData: ChartDataItem[] = [
    { label: "21/06", value: 2400000 },
    { label: "22/06", value: 3100000 },
    { label: "23/06", value: 1800000 },
    { label: "24/06", value: 4200000 },
    { label: "25/06", value: Math.max(3000000, todayRevenue) }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("common.revenue")} - Hồ Con Rùa
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Kế toán doanh thu thực tế, lịch sử lập hóa đơn bán lẻ tại cửa hàng Hồ Con Rùa.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs flex items-center space-x-4 text-left">
          <div className="p-3 bg-amber-800/10 rounded-lg text-amber-900">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase block tracking-wider">{t("staff.manager.todayRevenue")}</span>
            <span className="text-lg font-bold text-foreground font-outfit mt-0.5 block">
              {todayRevenue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs flex items-center space-x-4 text-left">
          <div className="p-3 bg-amber-800/10 rounded-lg text-amber-900">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase block tracking-wider">{t("staff.manager.weeklyRevenue")}</span>
            <span className="text-lg font-bold text-foreground font-outfit mt-0.5 block">
              {weeklyRevenue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs flex items-center space-x-4 text-left">
          <div className="p-3 bg-amber-800/10 rounded-lg text-amber-900">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase block tracking-wider">{t("staff.manager.monthlyRevenue")}</span>
            <span className="text-lg font-bold text-foreground font-outfit mt-0.5 block">
              {monthlyRevenue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
          Biểu đồ tăng trưởng doanh số 5 ngày qua
        </h4>
        <LineChart data={dailyTrendData} />
      </div>

      {/* Daily transaction list */}
      <div className="space-y-2 text-left">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          Danh sách hóa đơn hoàn tất hôm nay ({myCompletedOrders.length})
        </h4>
        <DataTable
          data={myCompletedOrders}
          columns={columns}
          pageSize={5}
        />
      </div>
    </div>
  );
}
