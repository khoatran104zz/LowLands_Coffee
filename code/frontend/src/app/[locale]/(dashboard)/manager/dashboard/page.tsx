"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Coffee, CheckCircle, FileDown } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { getManagerDashboardSummary, ManagerDashboardSummary } from "@/services/dashboard.service";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/auth.store";

export default function ManagerDashboardPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  const loadDashboardData = () => {
    getManagerDashboardSummary()
      .then((data) => {
        setSummary(data);
        setSummaryError(null);
      })
      .catch((error) => {
        console.error("Failed to load manager dashboard summary", error);
        setSummaryError(t("manager.dashboard.errorLoad") || "Không thể tải báo cáo từ Backend API.");
      });
  };

  useEffect(() => {
    setIsMounted(true);
    loadDashboardData();
  }, [t]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t("manager.dashboard.chartRevenueGroup")}>
          <div className="flex flex-col items-center justify-center h-[280px] bg-[#FAF7F2] dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200/50 select-none">
            <span className="text-xs font-semibold text-zinc-400">{t("manager.dashboard.chartRevenueGroupSub")}</span>
            <span className="text-[10px] text-amber-900 mt-1 uppercase font-bold tracking-wider font-outfit">{t("manager.dashboard.chartCollecting")}</span>
          </div>
        </ChartCard>

        <ChartCard title={t("manager.dashboard.chartHourlyOrders")}>
          <div className="flex flex-col items-center justify-center h-[280px] bg-[#FAF7F2] dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200/50 select-none">
            <span className="text-xs font-semibold text-zinc-400">{t("manager.dashboard.chartHourlyOrdersSub")}</span>
            <span className="text-[10px] text-amber-900 mt-1 uppercase font-bold tracking-wider font-outfit">{t("manager.dashboard.chartCollecting")}</span>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
