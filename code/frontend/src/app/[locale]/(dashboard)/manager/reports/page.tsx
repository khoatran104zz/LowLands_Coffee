"use client";

import React, { useState, useEffect } from "react";
import { FileText, Award, Calendar, Sparkles } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { UI_TEXT } from "@/constants/ui-text";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function ManagerReportsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const employees = useDashboardStore((state) => state.employees);
  const orders = useDashboardStore((state) => state.orders);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  const MY_BRANCH_ID = 2;
  const myBranchStaff = employees.filter((e) => e.branchId === MY_BRANCH_ID);
  const myBranchOrders = orders.filter((o) => o.storeId === MY_BRANCH_ID);

  // Compute best performing employee
  const activeStaff = myBranchStaff.filter(e => e.status === "active");

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {UI_TEXT.common.reports} - Hồ Con Rùa
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Báo cáo thống kê hiệu suất hoạt động, chấm công ca trực tại cửa hàng Hồ Con Rùa.
        </p>
      </div>

      {/* Grid boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Performance Box */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground font-outfit uppercase tracking-wider border-b border-border/60 pb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-800" />
            Nhân viên xuất sắc trong tháng
          </h3>
          <div className="space-y-3.5">
            {activeStaff.map((staff, idx) => (
              <div key={staff.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">{staff.fullName}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase block">{staff.workingShift}</span>
                </div>
                <span className="inline-flex items-center space-x-1 font-bold text-amber-900 bg-amber-800/10 px-2.5 py-1 rounded-lg text-xs select-none">
                  <Sparkles className="h-3 w-3 text-amber-800" />
                  <span>Điểm: {staff.performance || "9.0/10"}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Summary Box */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground font-outfit uppercase tracking-wider border-b border-border/60 pb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-800" />
            Tổng kết ca trực hôm nay
          </h3>
          <div className="space-y-3 text-xs font-semibold text-foreground/80">
            <div className="flex justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground select-none">Tổng số nhân viên:</span>
              <span>{myBranchStaff.length} người</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground select-none">Nhân viên đi làm:</span>
              <span className="text-emerald-700">{activeStaff.length} người</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground select-none">Số lượng đơn hàng phát sinh:</span>
              <span>{myBranchOrders.length} đơn hàng</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground select-none">Doanh thu ghi nhận ca:</span>
              <span className="text-amber-900 font-bold">
                {myBranchOrders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
