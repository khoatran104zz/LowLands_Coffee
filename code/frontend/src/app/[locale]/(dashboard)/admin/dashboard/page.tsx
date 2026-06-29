"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Users, Store } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LineChart, BarChart, PieChart, ChartDataItem } from "@/components/charts/Chart";
import { useDashboardStore } from "@/store/dashboardStore";
import { AdminDashboardSummary, getAdminDashboardSummary } from "@/services/dashboard.service";
import { useTranslation } from "@/hooks/useTranslation";

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
      .catch(() => {
        setSummaryError("Không thể tải dashboard summary từ Backend API.");
      });
  }, []);

  // Fetch from store
  const orders = useDashboardStore((state) => state.orders);
  const customers = useDashboardStore((state) => state.customers);
  const branches = useDashboardStore((state) => state.branches);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm font-semibold">
        {t("common.loading")}
      </div>
    );
  }

  // Calculate metrics
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalCustomersCount = customers.length;
  const totalBranchesCount = branches.length;
  const displayRevenue = summary?.totalRevenue ?? totalRevenue;
  const displayOrders = summary?.totalOrders ?? totalOrdersCount;
  const displayUsers = summary?.totalUsers ?? totalCustomersCount;
  const displayStores = summary?.totalStores ?? totalBranchesCount;

  // Chart 1: Revenue by month (Mock data + dynamic last month)
  const revenueByMonthData: ChartDataItem[] = [
    { label: "Tháng 1", value: 0 },
    { label: "Tháng 2", value: 0 },
    { label: "Tháng 3", value: 0 },
    { label: "Tháng 4", value: 0 },
    { label: "Tháng 5", value: 0 },
    { label: "Tháng 6", value: displayRevenue }
  ];

  // Chart 2: Revenue by branch
  // Map orders to branches
  const branchRevenueMap: Record<string, number> = {};
  branches.forEach((b) => {
    branchRevenueMap[b.name] = 0;
  });
  completedOrders.forEach((o) => {
    if (branchRevenueMap[o.storeName] !== undefined) {
      branchRevenueMap[o.storeName] += o.totalAmount;
    } else {
      branchRevenueMap[o.storeName] = o.totalAmount;
    }
  });

  const revenueByBranchData: ChartDataItem[] = Object.entries(branchRevenueMap)
    .map(([label, value]) => ({ label, value }));

  // Chart 3: Best selling products
  const productSalesMap: Record<string, number> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      productSalesMap[item.productName] = (productSalesMap[item.productName] || 0) + item.quantity;
    });
  });

  const bestSellingProductsData: ChartDataItem[] = Object.entries(productSalesMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Chart 4: Customer Growth (Mock data)
  const customerGrowthData: ChartDataItem[] = [
    { label: "Tuần 1", value: 0 },
    { label: "Tuần 2", value: 0 },
    { label: "Tuần 3", value: 0 },
    { label: "Tuần 4", value: displayUsers }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("admin.dashboardTitle")}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Hệ thống giám sát vận hành, kết quả kinh doanh toàn hệ thống Lowlands Coffee.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t("admin.revenueTitle")}
          value={`${displayRevenue.toLocaleString()}đ`}
          icon={DollarSign}
          description="Đơn hoàn thành"
          trend={{ type: "up", value: "+12.4%" }}
        />
        <StatsCard
          title={t("admin.ordersTitle")}
          value={displayOrders}
          icon={ShoppingBag}
          description="Đơn trong tháng"
          trend={{ type: "up", value: "+8.2%" }}
        />
        <StatsCard
          title={t("admin.customersTitle")}
          value={displayUsers}
          icon={Users}
          description="Thành viên đã đăng ký"
          trend={{ type: "up", value: "+24.3%" }}
        />
        <StatsCard
          title={t("admin.branchesTitle")}
          value={displayStores}
          icon={Store}
          description="Chi nhánh đang chạy"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
            {t("admin.revenueMonthChart")}
          </h4>
          <LineChart data={revenueByMonthData} />
        </div>

        {/* Chart 2 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
            {t("admin.revenueBranchChart")}
          </h4>
          <PieChart data={revenueByBranchData} />
        </div>

        {/* Chart 3 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
            {t("admin.bestSellersChart")}
          </h4>
          <BarChart data={bestSellingProductsData} />
        </div>

        {/* Chart 4 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
            {t("admin.customerGrowthChart")}
          </h4>
          <LineChart data={customerGrowthData} />
        </div>
      </div>
    </div>
  );
}
