"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  DollarSign,
  Package,
  ReceiptText,
  ShoppingBag,
  Store,
  XCircle
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import {
  AdminDashboardSummary,
  DashboardLowStockItem,
  DashboardRecentActivity,
  DashboardStoreRanking,
  DashboardTopProduct,
  DashboardTrendPoint,
  getAdminDashboardSummary
} from "@/services/dashboard.service";
import { useParams } from "next/navigation";

function formatCurrency(value?: number) {
  return `${Math.round(value ?? 0).toLocaleString("vi-VN")}d`;
}

function formatNumber(value?: number) {
  return Math.round(value ?? 0).toLocaleString("vi-VN");
}

function NoDataBlock({ message }: { message: string }) {
  return (
    <div className="w-full min-h-[180px] flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
      <BarChart3 className="h-7 w-7 text-muted-foreground mb-3" />
      <p className="text-xs font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}

function TrendBars({
  data,
  mode
}: {
  data: DashboardTrendPoint[];
  mode: "revenue" | "orders";
}) {
  if (data.length === 0) {
    return <NoDataBlock message="Chua co du lieu 7 ngay gan nhat." />;
  }

  const maxValue = Math.max(...data.map((item) => mode === "revenue" ? item.revenue : item.orders), 1);

  return (
    <div className="w-full flex items-end justify-between gap-2 h-52 px-2 pt-4">
      {data.map((item) => {
        const value = mode === "revenue" ? item.revenue : item.orders;
        const pct = (value / maxValue) * 100;
        return (
          <div key={`${mode}-${item.date}`} className="flex-1 flex flex-col items-center group relative min-w-0">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none absolute -top-8 z-10 whitespace-nowrap">
              {mode === "revenue" ? formatCurrency(value) : `${formatNumber(value)} don`}
            </span>
            <div
              style={{ height: `${Math.max(pct, 5)}%` }}
              className="w-full sm:w-8 bg-amber-800 hover:bg-amber-700 transition-all duration-300 rounded-t-md"
            />
            <span className="text-[10px] text-zinc-400 font-bold mt-2 font-outfit select-none truncate">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StoreRankingList({ stores }: { stores: DashboardStoreRanking[] }) {
  if (stores.length === 0) {
    return <NoDataBlock message="Chua co doanh thu theo chi nhanh." />;
  }

  const maxRevenue = Math.max(...stores.map((store) => store.revenue), 1);

  return (
    <div className="w-full space-y-4 px-1">
      {stores.slice(0, 5).map((store) => {
        const pct = (store.revenue / maxRevenue) * 100;
        return (
          <div key={store.storeId} className="space-y-1 text-left">
            <div className="flex justify-between gap-3 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              <span className="truncate">{store.storeName}</span>
              <span className="text-zinc-900 dark:text-white font-extrabold whitespace-nowrap">
                {formatCurrency(store.revenue)}
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${pct}%` }}
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopProductsList({ products }: { products: DashboardTopProduct[] }) {
  if (products.length === 0) {
    return <NoDataBlock message="Chua co san pham ban chay." />;
  }

  return (
    <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800">
      {products.slice(0, 5).map((product, index) => (
        <div key={product.productId} className="flex items-center justify-between gap-4 py-3 text-left">
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
              {index + 1}. {product.productName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(product.quantity)} ly
            </p>
          </div>
          <span className="text-sm font-extrabold text-amber-900 whitespace-nowrap">
            {formatCurrency(product.revenue)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LowStockList({ items }: { items: DashboardLowStockItem[] }) {
  if (items.length === 0) {
    return <NoDataBlock message="Khong co nguyen lieu can canh bao." />;
  }

  return (
    <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800">
      {items.map((item) => (
        <div key={`${item.storeId}-${item.ingredientId}`} className="flex items-center justify-between gap-4 py-3 text-left">
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
              {item.ingredientName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{item.storeName}</p>
          </div>
          <span className="text-xs font-extrabold text-rose-700 whitespace-nowrap">
            {formatNumber(item.currentStock)} / {formatNumber(item.minStock)} {item.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentActivities({ activities }: { activities: DashboardRecentActivity[] }) {
  if (activities.length === 0) {
    return <NoDataBlock message="Chua co hoat dong gan day." />;
  }

  return (
    <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.createdAt}-${activity.title}`} className="py-3 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}{activity.storeName ? ` - ${activity.storeName}` : ""}
              </p>
            </div>
            {activity.amount != null && (
              <span className="text-xs font-extrabold text-amber-900 whitespace-nowrap">
                {formatCurrency(activity.amount)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
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
        setSummaryError(locale === "vi" ? "Khong the tai dashboard tu API." : "Failed to load dashboard data.");
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, [locale]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm font-semibold">
        Loading...
      </div>
    );
  }

  const revenueTrend = summary?.revenueTrend ?? [];
  const orderTrend = summary?.orderTrend ?? [];
  const topProducts = summary?.topProducts ?? [];
  const storeRanking = summary?.storeRanking ?? [];
  const paymentBreakdown = summary?.paymentBreakdown ?? [];
  const lowStockItems = summary?.lowStockItems ?? [];
  const recentActivities = summary?.recentActivities ?? [];

  return (
    <div className="space-y-6">
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {locale === "vi" ? "Tong quan he thong" : "System Overview"}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {locale === "vi" ? "Du lieu tong quan lay truc tiep tu Dashboard API." : "Quick overview from the Dashboard API."}
        </p>
        {summaryError && <p className="mt-2 text-xs font-semibold text-rose-700">{summaryError}</p>}
      </div>

      {isLoading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard title="Doanh thu hom nay" value={formatCurrency(summary?.todayRevenue)} icon={DollarSign} />
            <StatsCard title="Doanh thu thang nay" value={formatCurrency(summary?.monthRevenue)} icon={ReceiptText} />
            <StatsCard title="Don hom nay" value={formatNumber(summary?.ordersToday)} icon={ShoppingBag} />
            <StatsCard title="Da hoan thanh hom nay" value={formatNumber(summary?.completedOrdersToday)} icon={CheckCircle} />
            <StatsCard title="Da huy hom nay" value={formatNumber(summary?.cancelledOrdersToday)} icon={XCircle} />
            <StatsCard title="Tong chi nhanh" value={formatNumber(summary?.totalStores)} icon={Store} />
            <StatsCard title="Tong san pham" value={formatNumber(summary?.totalProducts)} icon={Package} />
            <StatsCard title="Canh bao ton kho" value={formatNumber(summary?.lowStockCount)} icon={AlertTriangle} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="Doanh thu 7 ngay">
              <TrendBars data={revenueTrend} mode="revenue" />
            </ChartCard>

            <ChartCard title="Don hang 7 ngay">
              <TrendBars data={orderTrend} mode="orders" />
            </ChartCard>

            <ChartCard title="Thanh toan">
              {paymentBreakdown.length === 0 ? (
                <NoDataBlock message="Chua co du lieu thanh toan." />
              ) : (
                <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                  {paymentBreakdown.map((item) => (
                    <div key={item.paymentMethod} className="flex items-center justify-between gap-4 py-3 text-left">
                      <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.paymentMethod}</p>
                        <p className="text-xs text-muted-foreground">{formatNumber(item.orderCount)} don</p>
                      </div>
                      <span className="text-sm font-extrabold text-amber-900">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Top chi nhanh">
              <StoreRankingList stores={storeRanking} />
            </ChartCard>

            <ChartCard title="Top san pham">
              <TopProductsList products={topProducts} />
            </ChartCard>

            <ChartCard title="Nguyen lieu sap het">
              <LowStockList items={lowStockItems} />
            </ChartCard>

            <ChartCard title="Hoat dong gan day" className="xl:col-span-2">
              <RecentActivities activities={recentActivities} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
