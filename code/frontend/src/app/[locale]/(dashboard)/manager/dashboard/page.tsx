"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Coffee,
  DollarSign,
  FileDown,
  Package,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Award,
  Zap,
  Inbox,
  Activity,
  XCircle
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { LineChart, BarChart, PieChart } from "@/components/charts/Chart";
import {
  DashboardIngredientConsumption,
  DashboardLowStockItem,
  DashboardRecentActivity,
  DashboardTopProduct,
  ManagerDashboardSummary
} from "@/services/dashboard.service";
import { getManagerDashboardSummary } from "@/services/manager-dashboard.service";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function ManagerDashboardPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const data = await getManagerDashboardSummary();
        setSummary(data);
        setSummaryError(null);
      } catch (error) {
        console.error("Failed to load manager dashboard summary", error);
        setSummaryError(t("manager.dashboard.errorLoad") || "Không thể tải báo cáo từ Backend API.");
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
    return breakdown.map((item) => {
      let friendlyLabel = item.paymentMethod;
      if (item.paymentMethod === "cod") {
        friendlyLabel = locale === "vi" ? "Tiền mặt (COD)" : "Cash (COD)";
      } else if (item.paymentMethod === "bank_transfer" || item.paymentMethod === "vnpay") {
        friendlyLabel = locale === "vi" ? "Chuyển khoản (VNPAY)" : "Transfer (VNPAY)";
      } else if (item.paymentMethod === "e_wallet" || item.paymentMethod === "momo") {
        friendlyLabel = locale === "vi" ? "Ví điện tử MoMo" : "MoMo E-Wallet";
      }
      return {
        label: friendlyLabel,
        value: item.revenue
      };
    });
  }, [summary, locale]);

  const topProductChartData = useMemo(() => {
    const products = summary?.topProducts ?? [];
    return products.slice(0, 5);
  }, [summary]);

  const lowStockItems = useMemo(() => {
    return summary?.lowStockItemsList ?? [];
  }, [summary]);

  const ingredientConsumption = useMemo(() => {
    return summary?.ingredientConsumption ?? [];
  }, [summary]);

  const recentActivities = useMemo(() => {
    return summary?.recentActivities ?? [];
  }, [summary]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm font-semibold select-none">
        <Activity className="h-5 w-5 animate-spin mr-2 text-amber-800" />
        {t("common.loading") || "Loading..."}
      </div>
    );
  }

  const branchName = summary?.storeName || "";

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="text-left select-none">
        <h1 className="text-2xl font-black text-amber-900 font-outfit uppercase tracking-wide">
          {t("manager.dashboard.title")}{branchName ? ` - ${branchName}` : ""}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("manager.dashboard.subtitle")}
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
          <p className="text-xs font-bold text-zinc-500 mt-3.5">{t("common.loading")}</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t("manager.dashboard.todayRevenue")}
              value={formatCurrency(summary?.todayRevenue)}
              icon={DollarSign}
            />
            <StatsCard
              title={locale === "vi" ? "Doanh thu tháng này" : "This Month's Revenue"}
              value={formatCurrency(summary?.thisMonthRevenue)}
              icon={ReceiptText}
            />
            <StatsCard
              title={t("manager.dashboard.todayOrders")}
              value={formatNumber(summary?.todayOrders)}
              icon={ShoppingBag}
            />
            <StatsCard
              title={t("manager.dashboard.todayPreparing")}
              value={formatNumber(summary?.preparingOrders)}
              icon={Coffee}
              className="border-blue-250 dark:border-blue-950/20 text-blue-800"
            />
            <StatsCard
              title={locale === "vi" ? "Món sẵn sàng phục vụ" : "Ready for Pickup"}
              value={formatNumber(summary?.readyOrders)}
              icon={Package}
              className="border-amber-250 dark:border-amber-950/20 text-amber-800"
            />
            <StatsCard
              title={t("manager.dashboard.todayCompleted")}
              value={formatNumber(summary?.completedOrders)}
              icon={CheckCircle2}
              className="border-emerald-250 dark:border-emerald-950/20 text-emerald-800"
            />
            <StatsCard
              title={t("manager.dashboard.inventoryWarning")}
              value={formatNumber(summary?.lowStockCount)}
              icon={AlertTriangle}
              className={summary?.lowStockCount && summary.lowStockCount > 0 
                ? "border-amber-250 dark:border-amber-950/20 text-amber-800 animate-pulse" 
                : undefined}
            />
            <StatsCard
              title={t("manager.dashboard.todayGoodsReceipts")}
              value={formatNumber(summary?.todayGoodsReceipts)}
              icon={FileDown}
            />
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* 1. Revenue Last 7 Days */}
            <ChartCard 
              title={locale === "vi" ? "Doanh thu 7 ngày qua" : "Revenue Last 7 Days"} 
              description={locale === "vi" ? "Biểu đồ xu hướng doanh thu chi nhánh" : "Branch revenue trend"}
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
              title={locale === "vi" ? "Đơn hàng 7 ngày qua" : "Orders Last 7 Days"} 
              description={locale === "vi" ? "Số lượng đơn hàng phục vụ" : "Daily invoices frequency"}
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
              title={t("manager.dashboard.chartRevenueGroup") || "Cơ cấu thanh toán"} 
              description={locale === "vi" ? "Phân bổ doanh thu theo hình thức" : "Revenue breakdown by payment gate"}
            >
              {paymentChartData.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full h-full pt-4">
                  <PieChart data={paymentChartData} height={230} />
                </div>
              )}
            </ChartCard>

            {/* 4. Ingredient Consumption List */}
            <ChartCard 
              title={locale === "vi" ? "Tiêu hao nguyên liệu" : "Ingredient Consumption"} 
              description={locale === "vi" ? "Top 5 nguyên liệu tiêu hao cao nhất tuần này" : "Top 5 consumed ingredients this week"}
            >
              {ingredientConsumption.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full space-y-4 px-1 py-4 text-left">
                  {(() => {
                    const maxVal = Math.max(...ingredientConsumption.map((item) => item.quantity), 1);
                    return ingredientConsumption.map((item) => {
                      const percentage = (item.quantity / maxVal) * 100;
                      return (
                        <div key={item.ingredientId} className="space-y-1 text-left">
                          <div className="flex justify-between gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            <span className="truncate">{item.ingredientName}</span>
                            <span className="text-zinc-900 dark:text-white font-extrabold whitespace-nowrap">
                              {formatNumber(item.quantity)} {item.unit}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="bg-amber-800 h-full rounded-full transition-all duration-500"
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
              title={locale === "vi" ? "Top sản phẩm bán chạy" : "Top Selling Products"} 
              description={locale === "vi" ? "Top 5 đồ uống được đặt nhiều nhất" : "Top 5 items ordered"}
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
                            <p className="text-[10px] text-zinc-450 font-bold uppercase mt-0.5">
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
              title={locale === "vi" ? "Nguyên liệu sắp hết" : "Low Stock Warning"} 
              description={locale === "vi" ? "Nguyên liệu tại chi nhánh sắp dưới hạn mức tối thiểu" : "Low stock warnings for current branch"}
            >
              {lowStockItems.length === 0 ? (
                <div className="w-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 bg-emerald-50/25 dark:bg-emerald-950/5 border border-dashed border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                  <Award className="h-6 w-6 text-emerald-800 mb-2" />
                  <p className="text-xs font-bold text-emerald-800 select-none">
                    {locale === "vi" ? "Không có nguyên liệu cảnh báo" : "All ingredient levels are optimal!"}
                  </p>
                </div>
              ) : (
                <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800/60 px-1 py-2 text-left">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={`${item.storeId}-${item.ingredientId}`} className="flex items-center justify-between gap-4 py-3 text-left">
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-800 flex items-center justify-center">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {item.ingredientName}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold truncate mt-0.5">{item.ingredientCode}</p>
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
            <ChartCard 
              title={locale === "vi" ? "Hoạt động gần đây" : "Recent Activities"} 
              className="xl:col-span-2"
            >
              {recentActivities.length === 0 ? (
                <EmptyDashboardState />
              ) : (
                <div className="w-full relative px-2 py-4">
                  <div className="absolute left-6.5 top-5 bottom-5 w-px bg-zinc-200 dark:bg-zinc-800" />
                  
                  <div className="space-y-6">
                    {recentActivities.slice(0, 5).map((activity, idx) => {
                      return (
                        <div key={idx} className="flex gap-4 items-start text-left relative">
                          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-900 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center shrink-0 z-10 shadow-3xs">
                            <Zap className="h-3.5 w-3.5" />
                          </div>
                          
                          <div className="flex-grow space-y-0.5 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start gap-4">
                              <p className="text-xs font-black text-zinc-800 dark:text-zinc-155 truncate">
                                {activity.title}
                              </p>
                              {activity.amount != null && (
                                <span className="text-xs font-black text-amber-850 shrink-0">
                                  {formatCurrency(activity.amount)}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-semibold truncate leading-relaxed">
                              {activity.description}
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
  return (
    <div className="min-h-[180px] w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center bg-zinc-50/10 select-none">
      <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-950/20 text-zinc-400 flex items-center justify-center mb-3">
        <Inbox className="h-4.5 w-4.5" />
      </div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Chưa có dữ liệu thực tế</p>
    </div>
  );
}
