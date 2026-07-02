"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { useDashboardStore } from "@/store/dashboardStore";
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

  const employees = useDashboardStore((state) => state.employees);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);
  const ingredients = useDashboardStore((state) => state.ingredients);

  useEffect(() => {
    setIsMounted(true);
    void hydrateUsers();
    getManagerDashboardSummary()
      .then((data) => {
        setSummary(data);
        setSummaryError(null);
      })
      .catch((error) => {
        console.error("Failed to load manager dashboard summary", error);
        setSummaryError(t("manager.dashboard.errorLoad") || "Không thể tải báo cáo từ Backend API.");
      });
  }, [hydrateUsers, t]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // We manage StoreId = 2: "Lowlands Coffee - Hồ Con Rùa"
  const MY_BRANCH_ID = currentUser?.branchId || 2;
  
  // Count active employees at this branch
  const activeEmployeesCount = employees.filter(
    (e) => e.branchId === MY_BRANCH_ID && e.status === "active"
  ).length;

  // Count low stock/out of stock ingredients
  const inventoryWarningsCount = ingredients.filter(
    (i) => i.status === "low_stock" || i.status === "out_of_stock"
  ).length;
  
  const displayInventoryWarnings = summary?.lowStockItems ?? inventoryWarningsCount;

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
          value={t("manager.dashboard.waitingBE")}
          icon={DollarSign}
          description={t("manager.dashboard.todayRevenueDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.todayOrders")}
          value={t("manager.dashboard.waitingBE")}
          icon={ShoppingBag}
          description={t("manager.dashboard.todayOrdersDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.activeStaff")}
          value={`${activeEmployeesCount} ${t("manager.dashboard.baristaLabel")}`}
          icon={Users}
          description={t("manager.dashboard.activeStaffDesc")}
        />
        <StatsCard
          title={t("manager.dashboard.inventoryWarning")}
          value={`${displayInventoryWarnings} ${t("manager.dashboard.itemLabel")}`}
          icon={AlertTriangle}
          description={t("manager.dashboard.inventoryWarningDesc")}
          trend={displayInventoryWarnings > 0 ? { type: "down", value: t("manager.dashboard.needRestock") } : undefined}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t("manager.dashboard.chartRevenueGroup")}>
          <div className="flex flex-col items-center justify-center h-[280px] bg-[#FAF7F2] dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200/50 select-none">
            <span className="text-xs font-semibold text-zinc-400">{t("manager.dashboard.noData")}</span>
            <span className="text-[10px] text-amber-900 mt-1 uppercase font-bold tracking-wider font-outfit">{t("manager.dashboard.waitingBEPlaceholder")}</span>
          </div>
        </ChartCard>

        <ChartCard title={t("manager.dashboard.chartHourlyOrders")}>
          <div className="flex flex-col items-center justify-center h-[280px] bg-[#FAF7F2] dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200/50 select-none">
            <span className="text-xs font-semibold text-zinc-400">{t("manager.dashboard.noData")}</span>
            <span className="text-[10px] text-amber-900 mt-1 uppercase font-bold tracking-wider font-outfit">{t("manager.dashboard.waitingBEPlaceholder")}</span>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
