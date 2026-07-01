"use client";

import React, { useState, useEffect } from "react";
import { FileText, Award, Calendar, Sparkles } from "lucide-react";
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
  const orders = useDashboardStore((state) => state.orders);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const myBranchStaff = employees.filter((e) => e.branchId === myBranchId);
  const myBranchOrders = orders.filter((o) => o.storeId === myBranchId);

  // Compute best performing employee
  const activeStaff = myBranchStaff.filter(e => e.status === "active");

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
          {t("sidebar.statisticalReports") || "Báo cáo thống kê"} - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Báo cáo thống kê hiệu suất hoạt động, chấm công ca trực và doanh thu tại cửa hàng.
        </p>
      </div>

      {/* Grid boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Performance Box */}
        <ChartCard title="Nhân viên xuất sắc trong tháng">
          <div className="space-y-3.5 mt-2">
            {activeStaff.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-800 block">{staff.fullName}</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider mt-0.5">{staff.workingShift || "Ca trực"}</span>
                </div>
                <span className="inline-flex items-center space-x-1 font-extrabold text-amber-900 bg-amber-800/10 px-2.5 py-1 rounded-lg text-xs select-none">
                  <Sparkles className="h-3.5 w-3.5 text-amber-800" />
                  <span>{staff.performance || "9.5"} / 10</span>
                </span>
              </div>
            ))}
            {activeStaff.length === 0 && (
              <p className="text-xs text-muted-foreground font-semibold text-center py-6">Chưa có đánh giá hiệu suất ca trực.</p>
            )}
          </div>
        </ChartCard>

        {/* Operating Summary Box */}
        <ChartCard title="Tổng kết vận hành hôm nay">
          <div className="space-y-3.5 text-xs font-semibold text-zinc-700 mt-2">
            <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
              <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">Tổng số nhân sự chi nhánh:</span>
              <span className="font-bold text-zinc-800">{myBranchStaff.length} người</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
              <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">Số nhân sự đang trực ca:</span>
              <span className="font-bold text-emerald-600">{activeStaff.length} người</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/50 pb-2.5">
              <span className="text-zinc-400 font-bold select-none uppercase text-[10px]">Số lượng hóa đơn POS phát sinh:</span>
              <span className="font-bold text-zinc-800">{myBranchOrders.length} hóa đơn</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#948175] font-bold select-none uppercase text-[10px]">Tổng doanh thu quầy ghi nhận:</span>
              <span className="text-amber-900 font-extrabold text-sm">
                {myBranchOrders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}đ
              </span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
