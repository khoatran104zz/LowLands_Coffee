"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Store, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { AdminDashboardSummary, getAdminDashboardSummary } from "@/services/dashboard.service";
import { useTranslation } from "@/hooks/useTranslation";

function NoDataBlock({ message }: { message: string }) {
  return (
    <div className="w-full min-h-[220px] flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center px-6">
      <BarChart3 className="h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-xs font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    getAdminDashboardSummary()
      .then((data) => {
        setSummary(data);
        setSummaryError(null);
      })
      .catch((error) => {
        console.error("Failed to load admin dashboard summary", error);
        setSummaryError(t("admin.dashboardPage.summaryError"));
        setSummary(null);
      });
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm font-semibold">
        {t("common.loading")}
      </div>
    );
  }

  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalOrders = summary?.totalOrders ?? 0;
  const totalUsers = summary?.totalUsers ?? 0;
  const totalStores = summary?.totalStores ?? 0;

  return (
    <div className="space-y-6">
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("admin.dashboardTitle")}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("admin.dashboardPage.subtitle")}
        </p>
        {summaryError && (
          <p className="mt-2 text-xs font-semibold text-rose-700">
            {summaryError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t("admin.revenueTitle")}
          value={`${totalRevenue.toLocaleString()}đ`}
          icon={DollarSign}
          description={t("admin.dashboardPage.revenueDesc")}
        />
        <StatsCard
          title={t("admin.ordersTitle")}
          value={totalOrders}
          icon={ShoppingBag}
          description={t("admin.dashboardPage.ordersDesc")}
        />
        <StatsCard
          title={t("admin.customersTitle")}
          value={totalUsers}
          icon={Users}
          description={t("admin.dashboardPage.customersDesc")}
        />
        <StatsCard
          title={t("admin.branchesTitle")}
          value={totalStores}
          icon={Store}
          description={t("admin.dashboardPage.branchesDesc")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("admin.revenueMonthChart")}
          description={t("admin.dashboardPage.chartRevenueDesc")}
        >
          <NoDataBlock message={t("admin.dashboardPage.chartRevenueNoData")} />
        </ChartCard>

        <ChartCard
          title={t("admin.revenueBranchChart")}
          description={t("admin.dashboardPage.chartBranchDesc")}
        >
          <NoDataBlock message={t("admin.dashboardPage.chartBranchNoData")} />
        </ChartCard>

        <ChartCard
          title={t("admin.bestSellersChart")}
          description={t("admin.dashboardPage.chartProductDesc")}
        >
          <NoDataBlock message={t("admin.dashboardPage.chartProductNoData")} />
        </ChartCard>

        <ChartCard
          title={t("admin.customerGrowthChart")}
          description={t("admin.dashboardPage.chartCustomerDesc")}
        >
          <NoDataBlock message={t("admin.dashboardPage.chartCustomerNoData")} />
        </ChartCard>
      </div>
    </div>
  );
}
