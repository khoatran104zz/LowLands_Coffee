"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Store, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { AdminDashboardSummary, getAdminDashboardSummary } from "@/services/dashboard.service";
import { getOrders } from "@/services/order.service";
import { getUsers } from "@/services/user.service";
import { Order, User } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [sumData, ordersData, usersData] = await Promise.all([
          getAdminDashboardSummary(),
          getOrders({ page: 0, size: 1000 }).catch((e) => {
            console.error("Failed to load orders for dashboard", e);
            return [] as Order[];
          }),
          getUsers().catch((e) => {
            console.error("Failed to load users for dashboard", e);
            return [] as User[];
          })
        ]);
        setSummary(sumData);
        setOrders(ordersData);
        setUsers(usersData);
        setSummaryError(null);
      } catch (error) {
        console.error("Failed to load admin dashboard summary", error);
        setSummaryError(t("admin.dashboardPage.summaryError"));
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
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

  // 1. Process Monthly Revenue
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

  // 2. Process Branch Revenue
  const branchRevenueMap: Record<string, number> = {};
  completedOrders.forEach((order) => {
    const storeName = order.storeName || `Store #${order.storeId}`;
    branchRevenueMap[storeName] = (branchRevenueMap[storeName] || 0) + (order.totalAmount || 0);
  });

  const branchRevenueData = Object.entries(branchRevenueMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const maxBranchRevenue = Math.max(...branchRevenueData.map((d) => d.total), 1);
  const grandTotalRevenue = branchRevenueData.reduce((sum, d) => sum + d.total, 0) || 1;

  // 3. Process Best Sellers
  const productSalesMap: Record<string, number> = {};
  completedOrders.forEach((order) => {
    if (!order.items) return;
    order.items.forEach((item) => {
      const productName = item.productName || `Product #${item.productId}`;
      productSalesMap[productName] = (productSalesMap[productName] || 0) + (item.quantity || 0);
    });
  });

  const bestSellersData = Object.entries(productSalesMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxQty = Math.max(...bestSellersData.map((d) => d.qty), 1);

  // 4. Process Customer Growth
  const customerUsers = users.filter((u) => (u.roleName || u.role || "").toUpperCase() === "CUSTOMER");

  const customerGrowthMap: Record<string, number> = {};
  customerUsers.forEach((u) => {
    if (!u.createdAt) return;
    const date = new Date(u.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    customerGrowthMap[monthKey] = (customerGrowthMap[monthKey] || 0) + 1;
  });

  const customerGrowthData = last6Months.map((key) => {
    const [year, month] = key.split("-");
    const label = locale === "vi" ? `Th. ${month}` : `${month}/${year.slice(2)}`;
    const count = customerGrowthMap[key] || 0;
    return { label, count };
  });

  const maxCustomerCount = Math.max(...customerGrowthData.map((d) => d.count), 1);

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

      {isLoading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t("admin.revenueTitle")}
              value={`${totalRevenue.toLocaleString("vi-VN")}đ`}
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
              <div className="w-full flex items-end justify-between gap-2 h-52 px-2 pt-4">
                {monthlyRevenueData.map((item, idx) => {
                  const pct = (item.val / maxMonthlyRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none absolute -top-8 z-10 whitespace-nowrap">
                        {item.val.toLocaleString()}đ
                      </span>
                      <div
                        style={{ height: `${Math.max(pct, 5)}%` }}
                        className="w-full sm:w-8 bg-amber-800 hover:bg-amber-700 transition-all duration-300 rounded-t-md cursor-pointer"
                      />
                      <span className="text-[10px] text-zinc-400 font-bold mt-2 font-outfit select-none">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            <ChartCard
              title={t("admin.revenueBranchChart")}
              description={t("admin.dashboardPage.chartBranchDesc")}
            >
              <div className="w-full space-y-4 px-2">
                {branchRevenueData.length === 0 ? (
                  <NoDataBlock message={t("admin.dashboardPage.chartBranchNoData")} />
                ) : (
                  branchRevenueData.slice(0, 5).map((item, idx) => {
                    const pct = (item.total / grandTotalRevenue) * 100;
                    return (
                      <div key={idx} className="space-y-1 text-left">
                        <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          <span className="truncate max-w-[200px]">{item.name}</span>
                          <span className="text-zinc-900 dark:text-white font-extrabold">{item.total.toLocaleString()}đ ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-amber-800 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ChartCard>

            <ChartCard
              title={t("admin.bestSellersChart")}
              description={t("admin.dashboardPage.chartProductDesc")}
            >
              <div className="w-full space-y-4 px-2">
                {bestSellersData.length === 0 ? (
                  <NoDataBlock message={t("admin.dashboardPage.chartProductNoData")} />
                ) : (
                  bestSellersData.map((item, idx) => {
                    const pct = (item.qty / maxQty) * 100;
                    return (
                      <div key={idx} className="flex items-center space-x-3 text-left">
                        <span className="w-5 h-5 flex items-center justify-center bg-amber-50 dark:bg-amber-950/20 text-amber-900 font-outfit text-xs font-bold rounded-full select-none">
                          {idx + 1}
                        </span>
                        <div className="flex-grow space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                            <span className="truncate max-w-[200px]">{item.name}</span>
                            <span className="text-zinc-900 dark:text-white font-extrabold">{item.qty} {locale === "vi" ? "ly" : "units"}</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ChartCard>

            <ChartCard
              title={t("admin.customerGrowthChart")}
              description={t("admin.dashboardPage.chartCustomerDesc")}
            >
              <div className="w-full flex items-end justify-between gap-2 h-52 px-2 pt-4">
                {customerGrowthData.map((item, idx) => {
                  const pct = (item.count / maxCustomerCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none absolute -top-8 z-10 whitespace-nowrap">
                        +{item.count} KH
                      </span>
                      <div
                        style={{ height: `${Math.max(pct, 5)}%` }}
                        className="w-full sm:w-8 bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-t-md cursor-pointer"
                      />
                      <span className="text-[10px] text-zinc-400 font-bold mt-2 font-outfit select-none">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
