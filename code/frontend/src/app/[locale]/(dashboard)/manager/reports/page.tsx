"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/auth.store";
import { ChartCard } from "@/components/admin/ChartCard";

export default function ManagerReportsPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const employees = useDashboardStore((state) => state.employees);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const myBranchStaff = employees.filter((e) => e.branchId === myBranchId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
          {t("manager.reports.title")} - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("manager.reports.subtitle")}
        </p>
      </div>

      {/* Grid boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Performance Box */}
        <ChartCard title={t("manager.reports.bestEmployeeChart")}>
          <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl border border-dashed border-zinc-200/50 select-none">
            <Sparkles className="h-8 w-8 text-amber-850 animate-pulse mb-2" />
            <span className="text-xs font-semibold text-zinc-400">{t("manager.reports.noPerformanceEvaluation")}</span>
            <span className="text-[10px] text-amber-900 mt-1 uppercase font-bold tracking-wider font-outfit">{t("manager.reports.waitingBEPlaceholder")}</span>
          </div>
        </ChartCard>

        {/* Operating Summary Box */}
        <ChartCard title={t("manager.reports.dailySummaryChart")}>
          <div className="space-y-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-2">
            <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
              <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">{t("manager.reports.totalStaff")}</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-100">{myBranchStaff.length} {t("manager.reports.peopleCount")}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
              <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">{t("manager.reports.activeStaff")}</span>
              <span className="font-bold text-amber-900">{t("manager.reports.waitingBE")}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
              <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">{t("manager.reports.posInvoices")}</span>
              <span className="font-bold text-amber-900">{t("manager.reports.waitingBE")}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#948175] font-bold select-none uppercase text-[10px]">{t("manager.reports.totalPosRevenue")}</span>
              <span className="text-amber-900 font-extrabold text-sm">{t("manager.reports.waitingBE")}</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
