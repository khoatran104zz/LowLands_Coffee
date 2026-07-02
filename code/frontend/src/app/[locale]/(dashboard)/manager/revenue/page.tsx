"use client";

import React, { useState, useEffect } from "react";
import { Coins, TrendingUp, Calendar, ArrowUpRight, DollarSign } from "lucide-react";
import { ManagerDashboardSummary } from "@/services/dashboard.service";
import { getManagerDashboardSummary } from "@/services/manager-dashboard.service";
import { useTranslation } from "@/hooks/useTranslation";
import { StatsCard } from "@/components/admin/StatsCard";

export default function ManagerRevenuePage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const branchName = summary?.storeName || "";

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
            Báo cáo Doanh thu - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Số liệu thống kê doanh thu bán lẻ qua quầy POS của chi nhánh.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          Đang tải số liệu doanh thu...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Hôm nay (Today)"
              value={summary ? `${summary.todayRevenue.toLocaleString()}đ` : "0đ"}
              icon={DollarSign}
              description="Doanh thu ghi nhận trong ngày"
            />
            <StatsCard
              title="Hôm qua (Yesterday)"
              value={summary ? `${summary.yesterdayRevenue.toLocaleString()}đ` : "0đ"}
              icon={Calendar}
              description="Doanh thu ngày hôm trước"
            />
            <StatsCard
              title="Tuần này (This Week)"
              value={summary ? `${summary.thisWeekRevenue.toLocaleString()}đ` : "0đ"}
              icon={TrendingUp}
              description="Tính từ Thứ Hai đầu tuần"
            />
            <StatsCard
              title="Tháng này (This Month)"
              value={summary ? `${summary.thisMonthRevenue.toLocaleString()}đ` : "0đ"}
              icon={ArrowUpRight}
              description="Tính từ ngày đầu tiên của tháng"
            />
          </div>

          {/* Additional details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Thông tin đối soát doanh số</h3>
            <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-2">
              <p>• Doanh thu hiển thị ở trên là doanh số thực tế đã hoàn thành thanh toán (tính trên các đơn hàng có trạng thái <strong className="text-amber-850">Completed</strong>).</p>
              <p>• Số liệu được cập nhật trực tiếp theo thời gian thực từ cơ sở dữ liệu bán hàng của hệ thống.</p>
              <p>• Mọi chênh lệch giữa tiền mặt két thu ngân và doanh số hệ thống cần được báo cáo điều chỉnh qua phiếu điều chỉnh két hoặc liên hệ quản trị hệ thống.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
