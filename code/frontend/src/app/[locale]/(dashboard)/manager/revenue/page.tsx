"use client";

import React, { useState, useEffect } from "react";
import { Coins, TrendingUp, Calendar, ArrowUpRight, DollarSign } from "lucide-react";
import { getManagerDashboardSummary, ManagerDashboardSummary } from "@/services/dashboard.service";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";
import { StatsCard } from "@/components/admin/StatsCard";

export default function ManagerRevenuePage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = useAuthStore((state) => state.user);
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getManagerDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load revenue summary", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6 text-left">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-850" />
            {t("manager.revenue.title")} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("manager.revenue.subtitle")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          {t("manager.revenue.loading")}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t("manager.revenue.today")}
              value={summary ? `${summary.todayRevenue.toLocaleString()}đ` : "0đ"}
              icon={DollarSign}
              description={t("manager.revenue.todayDesc")}
            />
            <StatsCard
              title={t("manager.revenue.yesterday")}
              value={summary ? `${summary.yesterdayRevenue.toLocaleString()}đ` : "0đ"}
              icon={Calendar}
              description={t("manager.revenue.yesterdayDesc")}
            />
            <StatsCard
              title={t("manager.revenue.thisWeek")}
              value={summary ? `${summary.thisWeekRevenue.toLocaleString()}đ` : "0đ"}
              icon={TrendingUp}
              description={t("manager.revenue.thisWeekDesc")}
            />
            <StatsCard
              title={t("manager.revenue.thisMonth")}
              value={summary ? `${summary.thisMonthRevenue.toLocaleString()}đ` : "0đ"}
              icon={ArrowUpRight}
              description={t("manager.revenue.thisMonthDesc")}
            />
          </div>

          {/* Additional details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("manager.revenue.noteTitle")}</h3>
            <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-2">
              <p>{t("manager.revenue.noteDesc1")}</p>
              <p>{t("manager.revenue.noteDesc2")}</p>
              <p>{t("manager.revenue.noteDesc3")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
