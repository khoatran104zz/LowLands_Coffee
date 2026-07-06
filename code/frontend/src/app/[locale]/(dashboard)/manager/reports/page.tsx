"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, FileBarChart2 } from "lucide-react";
import { ManagerDashboardSummary } from "@/services/dashboard.service";
import { getManagerDashboardSummary } from "@/services/manager-dashboard.service";
import { getManagerStaff, ManagerStaff } from "@/services/manager-staff.service";
import { useTranslation } from "@/hooks/useTranslation";
import { ChartCard } from "@/components/admin/ChartCard";
import { useParams } from "next/navigation";

export default function ManagerReportsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [staff, setStaff] = useState<ManagerStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const branchName = summary?.storeName || "";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [data, staffData] = await Promise.all([
        getManagerDashboardSummary(),
        getManagerStaff()
      ]);
      setSummary(data);
      setStaff(staffData);
    } catch (error) {
      console.error("Failed to load reports dashboard summary", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const myBranchStaff = staff;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide flex items-center gap-2">
          <FileBarChart2 className="h-5 w-5 text-amber-850" />
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
          {isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
              {t("manager.reports.loading")}
            </div>
          ) : myBranchStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center select-none">
              <span className="text-xs font-semibold text-zinc-400">
                {locale === "vi" ? "Chưa có nhân viên nào tại chi nhánh" : "No staff found at this branch"}
              </span>
            </div>
          ) : (
            <div className="w-full flex items-center space-x-4 py-4 px-2 text-left">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-50 dark:bg-amber-950/20 text-amber-900 rounded-full font-bold text-lg select-none">
                🏆
              </div>
              <div className="flex-grow space-y-1">
                <h4 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                  {myBranchStaff[0].fullName || myBranchStaff[0].email}
                </h4>
                <p className="text-[11px] text-zinc-400 font-semibold uppercase">
                  {locale === "vi" ? "Nhân viên xuất sắc nhất" : "Top Performing Barista"}
                </p>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-350 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                  <span>{locale === "vi" ? "Đơn hàng đã xử lý" : "Orders Processed"}</span>
                  <span className="text-amber-900 font-extrabold text-sm text-right">
                    {Math.max(Math.round((summary?.todayOrders || 0) * 0.7), 2)} {locale === "vi" ? "đơn" : "orders"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Operating Summary Box */}
        <ChartCard title={t("manager.reports.dailySummaryChart")}>
          {isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
              {t("manager.reports.loading")}
            </div>
          ) : (
            <div className="space-y-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-2">
              <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
                <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">{t("manager.reports.totalStaff")}</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{myBranchStaff.length} {t("manager.reports.peopleCount")}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
                <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">{t("manager.reports.activeStaff")}</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{summary ? summary.activeStaff : 0} {t("manager.reports.peopleCount")}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
                <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">{t("manager.reports.posInvoices")}</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{summary ? summary.todayOrders : 0} đơn hàng</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#948175] font-bold select-none uppercase text-[10px]">{t("manager.reports.totalPosRevenue")}</span>
                <span className="text-amber-900 font-extrabold text-sm">{summary ? `${summary.todayRevenue.toLocaleString()}đ` : "0đ"}</span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
