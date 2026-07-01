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
        setSummaryError("Khong the tai dashboard summary tu Backend API.");
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
          Tong quan van hanh lay tu Backend Dashboard API. Doanh thu chi tiet can Order/Payment backend.
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
          value={`${totalRevenue.toLocaleString()}d`}
          icon={DollarSign}
          description="Order/Payment backend chua trien khai day du"
        />
        <StatsCard
          title={t("admin.ordersTitle")}
          value={totalOrders}
          icon={ShoppingBag}
          description="Khong dung mock orders"
        />
        <StatsCard
          title={t("admin.customersTitle")}
          value={totalUsers}
          icon={Users}
          description="Tai khoan tu User API"
        />
        <StatsCard
          title={t("admin.branchesTitle")}
          value={totalStores}
          icon={Store}
          description="Chi nhanh tu Store API"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("admin.revenueMonthChart")}
          description="Can Order/Payment backend de hien thi du lieu that"
        >
          <NoDataBlock message="Chua co du lieu doanh thu thang vi Order/Payment backend chua trien khai." />
        </ChartCard>

        <ChartCard
          title={t("admin.revenueBranchChart")}
          description="Khong tinh tu mock orders"
        >
          <NoDataBlock message="Chua co du lieu doanh thu theo chi nhanh." />
        </ChartCard>

        <ChartCard
          title={t("admin.bestSellersChart")}
          description="Can Order backend de tong hop san pham ban chay"
        >
          <NoDataBlock message="Chua co du lieu best seller." />
        </ChartCard>

        <ChartCard
          title={t("admin.customerGrowthChart")}
          description="Can report endpoint that de ve tang truong khach hang"
        >
          <NoDataBlock message="Chua co du lieu report chi tiet." />
        </ChartCard>
      </div>
    </div>
  );
}
