"use client";

import React, { useState, useEffect } from "react";
import { Employee, useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function ManagerStaffPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const employees = useDashboardStore((state) => state.employees);
  const currentUser = useAuthStore((state) => state.user);
  
  // StoreId = 2 Hồ Con Rùa branch employees ONLY (or from auth user)
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const branchEmployees = employees.filter((e) => e.branchId === myBranchId);

  const columns: Column<Employee>[] = [
    {
      key: "employeeCode",
      header: t("admin.employeesPage.colCode") || "Mã NV",
      render: (item) => item.employeeCode || "Chưa có mã"
    },
    { key: "fullName", header: t("admin.employeesPage.colName") || "Họ và tên" },
    { key: "workingShift", header: "Ca trực đăng ký", render: (item) => item.workingShift || "Chưa xếp ca" },
    { key: "phone", header: t("admin.employeesPage.colPhone") || "Điện thoại" },
    { key: "email", header: "Email nội bộ" },
    {
      key: "performance",
      header: "Hiệu suất",
      render: (item) => (
        <span className="inline-flex items-center space-x-1 font-bold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2.5 py-0.5 rounded-lg text-xs select-none">
          <Sparkles className="h-3 w-3 text-amber-800" />
          <span>{item.performance || "Khá"}</span>
        </span>
      )
    },
    {
      key: "status",
      header: t("admin.employeesPage.colStatus") || "Trạng thái",
      render: (item) => {
        const isActive = item.status === "active";
        return (
          <StatusBadge
            status={isActive ? "active" : "inactive"}
            customLabel={isActive ? "Đang làm việc" : "Nghỉ việc / Tạm ngưng"}
          />
        );
      }
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          Nhân sự chi nhánh - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Danh sách nhân viên, Barista, và thu ngân được phân nhiệm vụ vận hành trực tiếp tại chi nhánh.
        </p>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
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
