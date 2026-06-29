"use client";

import React, { useState, useEffect } from "react";
import { Employee } from "@/mock/employees";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles } from "lucide-react";

export default function ManagerStaffPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const employees = useDashboardStore((state) => state.employees);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // StoreId = 2 Hồ Con Rùa branch employees ONLY
  const MY_BRANCH_ID = 2;
  const branchEmployees = employees.filter((e) => e.branchId === MY_BRANCH_ID);

  const columns: Column<Employee>[] = [
    { key: "id", header: "Mã NV" },
    { key: "fullName", header: "Họ và tên" },
    { key: "workingShift", header: "Ca trực được giao" },
    { key: "phone", header: "Điện thoại" },
    { key: "email", header: "Email nội bộ" },
    {
      key: "performance",
      header: "Đánh giá hiệu suất",
      render: (item) => (
        <span className="inline-flex items-center space-x-1 font-bold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2 py-0.5 rounded-lg text-xs select-none">
          <Sparkles className="h-3 w-3 text-amber-800" />
          <span>{item.performance || "Khá"}</span>
        </span>
      )
    },
    {
      key: "status",
      header: "Chấm công",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none ${
            item.status === "active"
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-zinc-500/10 text-zinc-600"
          }`}
        >
          {item.status === "active" ? "Đang trực" : "Off ca"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("common.employees")} - Hồ Con Rùa
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Theo dõi ca làm việc đăng ký, hiệu suất pha chế và chấm công nhân viên tại chi nhánh.
        </p>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên nhân viên..."
        />
      </div>

      {/* Table */}
      <DataTable
        data={branchEmployees}
        columns={columns}
        searchKey="fullName"
        searchQuery={searchQuery}
      />
    </div>
  );
}
