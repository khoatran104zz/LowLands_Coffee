"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Coffee, CheckCircle, FileDown } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { ManagerDashboardSummary } from "@/services/dashboard.service";
import { getManagerDashboardSummary } from "@/services/manager-dashboard.service";
import { getOrders } from "@/services/order.service";
import { Order } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";

export default function ManagerDashboardPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const branchName = summary?.storeName || "";

  const loadDashboardData = async () => {
    try {
      const data = await getManagerDashboardSummary();
      setSummary(data);
      setSummaryError(null);

      // Fetch branch-specific orders
      setIsLoadingOrders(true);
      const ordersData = await getOrders({ storeId: data.storeId, page: 0, size: 1000 }).catch((e) => {
        console.error("Failed to load orders for manager dashboard", e);
        return [] as Order[];
      });
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load manager dashboard summary", error);
      setSummaryError(t("manager.dashboard.errorLoad") || "Không thể tải báo cáo từ Backend API.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    void loadDashboardData();
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // 1. Process Monthly Revenue for store branch
  const completedOrders = orders.filter((o) => (o.status || "").toUpperCase() === "COMPLETED");

  const monthlyRevenueMap: Record<string, number> = {};
  completedOrders.forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + (order.totalAmount || 0);
  });

  const last6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    last6Months.push(key);
  }

  const monthlyRevenueData = last6Months.map((key) => {
    const [year, month] = key.split("-");
    const label = locale === "vi" ? `Th. ${month}` : `${month}/${year.slice(2)}`;
    const val = monthlyRevenueMap[key] || 0;
    return { label, val };
  });

  const maxMonthlyRevenue = Math.max(...monthlyRevenueData.map((d) => d.val), 1);

  // 2. Process Hourly Orders
  const timeSlots = [
    { label: "07:00-10:00", min: 7, max: 10, count: 0 },
    { label: "10:00-13:00", min: 10, max: 13, count: 0 },
    { label: "13:00-16:00", min: 13, max: 16, count: 0 },
    { label: "16:00-19:00", min: 16, max: 19, count: 0 },
    { label: "19:00-22:00", min: 19, max: 22, count: 0 }
  ];
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const hour = new Date(o.createdAt).getHours();
    const slot = timeSlots.find(s => hour >= s.min && hour < s.max);
    if (slot) slot.count++;
  });

  const maxHourlyCount = Math.max(...timeSlots.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
          {t("manager.dashboard.title")} - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("manager.dashboard.subtitle")}
        </p>
      </div>

      {summaryError && (
        <p className="text-xs text-destructive font-semibold">{summaryError}</p>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t("manager.dashboard.todayRevenue")}
          value={summary ? `${summary.todayRevenue.toLocaleString()}đ` : "0đ"}
          icon={DollarSign}
          description={t("manager.dashboard.todayRevenueDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.todayOrders")}
          value={summary ? String(summary.todayOrders) : "0"}
          icon={ShoppingBag}
          description={t("manager.dashboard.todayOrdersDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.todayPreparing")}
          value={summary ? String(summary.preparingOrders) : "0"}
          icon={Coffee}
          description={t("manager.dashboard.todayPreparingDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.todayCompleted")}
          value={summary ? String(summary.completedOrders) : "0"}
          icon={CheckCircle}
          description={t("manager.dashboard.todayCompletedDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.inventoryWarning")}
          value={summary ? `${summary.lowStockItems} ${t("manager.dashboard.itemLabel")}` : `0 ${t("manager.dashboard.itemLabel")}`}
          icon={AlertTriangle}
          description={t("manager.dashboard.inventoryWarningDesc")}
          trend={summary && summary.lowStockItems > 0 ? { type: "down", value: t("manager.dashboard.needRestock") } : undefined}
        />
        <StatsCard
          title={t("manager.dashboard.activeStaff")}
          value={summary ? `${summary.activeStaff} ${t("manager.dashboard.baristaLabel")}` : `0 ${t("manager.dashboard.baristaLabel")}`}
          icon={Users}
          description={t("manager.dashboard.activeStaffDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.todayGoodsReceipts")}
          value={summary ? String(summary.todayGoodsReceipts) : "0"}
          icon={FileDown}
          description={t("manager.dashboard.todayGoodsReceiptsDesc")}
        />
      </div>

      {isLoadingOrders ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t("manager.dashboard.chartRevenueGroup")}>
            <div className="w-full flex items-end justify-between gap-2 h-60 px-2 pt-6">
              {monthlyRevenueData.map((item, idx) => {
                const pct = (item.val / maxMonthlyRevenue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none absolute -top-8 z-10 whitespace-nowrap">
                      {item.val.toLocaleString()}đ
                    </span>
                    <div
                      style={{ height: `${Math.max(pct, 5)}%` }}
                      className="w-full sm:w-8 bg-amber-800 hover:bg-amber-750 transition-all duration-300 rounded-t-md cursor-pointer"
                    />
                    <span className="text-[10px] text-zinc-400 font-bold mt-2 font-outfit select-none">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title={t("manager.dashboard.chartHourlyOrders")}>
            <div className="w-full flex items-end justify-between gap-2 h-60 px-2 pt-6">
              {timeSlots.map((item, idx) => {
                const pct = (item.count / maxHourlyCount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none absolute -top-8 z-10 whitespace-nowrap">
                      {item.count} {locale === "vi" ? "đơn" : "orders"}
                    </span>
                    <div
                      style={{ height: `${Math.max(pct, 5)}%` }}
                      className="w-full sm:w-8 bg-emerald-600 hover:bg-emerald-555 transition-all duration-300 rounded-t-md cursor-pointer"
                    />
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold mt-2 font-outfit select-none whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
