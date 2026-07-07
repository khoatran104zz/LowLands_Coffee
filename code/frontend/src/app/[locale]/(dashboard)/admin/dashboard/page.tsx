"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Package,
  ReceiptText,
  ShoppingBag,
  Store as StoreIcon,
  XCircle,
  TrendingUp,
  Activity,
  Award,
  Zap,
  Inbox
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { LineChart, BarChart, PieChart } from "@/components/charts/Chart";
import {
  AdminDashboardSummary,
  getAdminDashboardSummary
} from "@/services/dashboard.service";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const sumData = await getAdminDashboardSummary();
        setSummary(sumData);
        setSummaryError(null);
      } catch (error) {
        console.error("Failed to load admin dashboard summary", error);
        setSummaryError(t("admin.dashboard.error"));
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, [locale, t]);

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(value ?? 0);
  };

  const formatNumber = (value?: number) => {
    return (value ?? 0).toLocaleString("vi-VN");
  };

  // Convert raw trend data to fit chart component signatures
  const revenueChartData = useMemo(() => {
    const trend = summary?.revenueTrend ?? [];
    if (trend.length === 0) return [];
    return trend.map((point) => ({
      label: point.label,
      value: point.revenue
    }));
  }, [summary]);

  const orderChartData = useMemo(() => {
    const trend = summary?.orderTrend ?? [];
    if (trend.length === 0) return [];
    return trend.map((point) => ({
      label: point.label,
      value: point.orders
    }));
  }, [summary]);

  const paymentChartData = useMemo(() => {
    const breakdown = summary?.paymentBreakdown ?? [];
    if (breakdown.length === 0) return [];
    return breakdown.map((item) => ({
      label: item.paymentMethod,
      value: item.revenue
    }));
  }, [summary]);

  const topProductChartData = useMemo(() => {
    const products = summary?.topProducts ?? [];
    return products.slice(0, 5);
  }, [summary]);

  const storeRankingChartData = useMemo(() => {
    const stores = summary?.storeRanking ?? [];
    return stores.slice(0, 5);
  }, [summary]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm font-semibold select-none">
        <Activity className="h-5 w-5 animate-spin mr-2 text-amber-800" />
        {t("admin.dashboard.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="text-left select-none">
        <h1 className="text-2xl font-black text-amber-900 font-outfit uppercase tracking-wide">
          {t("admin.dashboard.title")}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("admin.dashboard.subtitle")}
        </p>
        {summaryError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {summaryError}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center select-none">
          <Activity className="h-10 w-10 animate-spin text-amber-800" />
          <p className="text-xs font-bold text-zinc-500 mt-3.5">{t("admin.dashboard.loading")}</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t("admin.dashboard.todayRevenue")}
              value={formatCurrency(summary?.todayRevenue)}
              icon={DollarSign}
            />
            <StatsCard
              title={t("admin.dashboard.monthRevenue")}
              value={formatCurrency(summary?.monthRevenue)}
              icon={ReceiptText}
            />
            <StatsCard
              title={t("admin.dashboard.todayOrders")}
              value={formatNumber(summary?.ordersToday)}
              icon={ShoppingBag}
            />
            <StatsCard
              title={t("admin.dashboard.todayCompleted")}
              value={formatNumber(summary?.completedOrdersToday)}
              icon={CheckCircle2}
              className="border-emerald-250 dark:border-emerald-950/20"
            />
            <StatsCard
              title={t("admin.dashboard.todayCancelled")}
              value={formatNumber(summary?.cancelledOrdersToday)}
              icon={XCircle}
              className={summary?.cancelledOrdersToday && summary.cancelledOrdersToday > 0 
                ? "border-rose-250 dark:border-rose-950/20 text-rose-800" 
                : undefined}
            />
            <StatsCard
              title={t("admin.dashboard.totalStores")}
              value={formatNumber(summary?.totalStores)}
              icon={StoreIcon}
            />
            <StatsCard
              title={t("admin.dashboard.totalProducts")}
              value={formatNumber(summary?.totalProducts)}
              icon={Package}
            />
            <StatsCard
              title={t("admin.dashboard.lowStockWarning")}
              value={formatNumber(summary?.lowStockCount)}
              icon={AlertTriangle}
              className={summary?.lowStockCount && summary.lowStockCount > 0 
                ? "border-amber-250 dark:border-amber-950/20 text-amber-800 animate-pulse" 
                : undefined}
            />
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* 1. Revenue Last 7 Days */}
            <ChartCard 
              title={t("admin.dashboard.revenue7Days")} 
              description={locale === "vi" ? "Biểu đồ xu hướng doanh thu" : "Revenue trend visualization"}
            >
              {revenueChartData.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full h-full flex flex-col justify-end pt-4">
                  <LineChart data={revenueChartData} height={230} />
                </div>
              )}
            </ChartCard>

            {/* 2. Orders Last 7 Days */}
            <ChartCard 
              title={t("admin.dashboard.orders7Days")} 
              description={locale === "vi" ? "Tần suất đơn hàng phát sinh" : "Daily sales volume charts"}
            >
              {orderChartData.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full h-full flex flex-col justify-end pt-4">
                  <BarChart data={orderChartData} height={230} />
                </div>
              )}
            </ChartCard>

            {/* 3. Payment Methods Breakdown */}
            <ChartCard 
              title={t("admin.dashboard.paymentMethods")} 
              description={locale === "vi" ? "Cơ cấu doanh thu theo cổng thanh toán" : "Revenue breakdown by payment gate"}
            >
              {paymentChartData.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full h-full pt-4">
                  <PieChart data={paymentChartData} height={230} />
                </div>
              )}
            </ChartCard>

            {/* 4. Branch Rankings */}
            <ChartCard 
              title={t("admin.dashboard.topBranches")} 
              description={locale === "vi" ? "Top 5 chi nhánh đạt doanh thu cao nhất" : "Top 5 branches by revenue performance"}
            >
              {storeRankingChartData.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full space-y-4 px-1 py-4 text-left">
                  {(() => {
                    const maxVal = Math.max(...storeRankingChartData.map((s) => s.revenue), 1);
                    return storeRankingChartData.map((store, index) => {
                      const percentage = (store.revenue / maxVal) * 100;
                      return (
                        <div key={store.storeId} className="space-y-1 text-left">
                          <div className="flex justify-between gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            <span className="truncate flex items-center gap-1.5">
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-550 w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              {store.storeName}
                            </span>
                            <span className="text-zinc-900 dark:text-white font-extrabold whitespace-nowrap">
                              {formatCurrency(store.revenue)}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </ChartCard>

            {/* 5. Top Selling Products */}
            <ChartCard 
              title={t("admin.dashboard.topProducts")} 
              description={locale === "vi" ? "Top 5 món đồ uống bán chạy nhất" : "Top 5 best selling items"}
            >
              {topProductChartData.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800/60 px-1 py-2 text-left">
                  {topProductChartData.map((product, index) => {
                    const badgeEmoji = index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
                    return (
                      <div key={product.productId} className="flex items-center justify-between gap-4 py-3 text-left">
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-900 font-black text-xs flex items-center justify-center">
                            {badgeEmoji || index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">
                              {product.productName}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                              {formatNumber(product.quantity)} {locale === "vi" ? "ly" : "units"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-850 dark:text-amber-500 whitespace-nowrap">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartCard>

            {/* 6. Low Stock Ingredients */}
            <ChartCard 
              title={t("admin.dashboard.lowStockIngredients")} 
              description={locale === "vi" ? "Danh sách nguyên liệu chạm mức tối thiểu" : "Ingredients requiring urgent balance check"}
            >
              {summary?.lowStockItems && summary.lowStockItems.length === 0 ? (
                <div className="w-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 bg-emerald-50/25 dark:bg-emerald-950/5 border border-dashed border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                  <Award className="h-6 w-6 text-emerald-800 mb-2" />
                  <p className="text-xs font-bold text-emerald-800 select-none">
                    {locale === "vi" ? "Không có nguyên liệu cảnh báo" : "All ingredient levels are optimal!"}
                  </p>
                </div>
              ) : (
                <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800/60 px-1 py-2 text-left">
                  {(summary?.lowStockItems ?? []).slice(0, 5).map((item) => (
                    <div key={`${item.storeId}-${item.ingredientId}`} className="flex items-center justify-between gap-4 py-3 text-left">
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-800 flex items-center justify-center">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {item.ingredientName}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold truncate mt-0.5">{item.storeName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-rose-800 dark:text-rose-600 bg-rose-50 dark:bg-rose-950/5 px-2 py-0.5 rounded-full border border-rose-200">
                        {formatNumber(item.currentStock)} / {formatNumber(item.minStock)} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            {/* 7. Recent Operational Activities */}
            <ChartCard title={t("admin.dashboard.recentActivities")} className="xl:col-span-2">
              {summary?.recentActivities && summary.recentActivities.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full relative px-2 py-4">
                  {/* Vertical line helper for timeline layout */}
                  <div className="absolute left-6.5 top-5 bottom-5 w-px bg-zinc-200 dark:bg-zinc-800" />
                  
                  <div className="space-y-6">
                    {(summary?.recentActivities ?? []).slice(0, 5).map((activity, idx) => {
                      return (
                        <div key={idx} className="flex gap-4 items-start text-left relative">
                          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-900 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center shrink-0 z-10 shadow-3xs">
                            <Zap className="h-3.5 w-3.5" />
                          </div>
                          
                          <div className="flex-grow space-y-0.5 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start gap-4">
                              <p className="text-xs font-black text-zinc-800 dark:text-zinc-150 truncate">
                                {activity.title}
                              </p>
                              {activity.amount != null && (
                                <span className="text-xs font-black text-amber-850 shrink-0">
                                  {formatCurrency(activity.amount)}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[11px] text-zinc-455 dark:text-zinc-500 font-semibold truncate leading-relaxed">
                              {activity.description}
                              {activity.storeName ? ` • ${activity.storeName}` : ""}
                            </p>
                            
                            <p className="text-[9px] text-zinc-400 font-bold select-none pt-0.5 uppercase tracking-wide">
                              {activity.createdAt ? activity.createdAt.replace("T", " ").substring(0, 16) : "-"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </ChartCard>

          </div>
        </>
      )}
    </div>
  );
}

// --- Empty State for Dashboard Cards ---
function EmptyDashboardState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[180px] w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center bg-zinc-50/10 select-none">
      <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-950/20 text-zinc-400 flex items-center justify-center mb-3">
        <Inbox className="h-4.5 w-4.5" />
      </div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{t("admin.dashboard.noData")}</p>
    </div>
  );
}
