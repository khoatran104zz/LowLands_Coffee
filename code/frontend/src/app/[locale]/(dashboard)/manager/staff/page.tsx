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
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);
  const currentUser = useAuthStore((state) => state.user);
  
  // StoreId = 2 Hồ Con Rùa branch employees ONLY (or from auth user)
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  useEffect(() => {
    setIsMounted(true);
    void hydrateUsers();
  }, [hydrateUsers]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const branchEmployees = employees.filter((e) => e.branchId === myBranchId);

  const columns: Column<Employee>[] = [
    {
      key: "employeeCode",
      header: t("manager.staff.colCode"),
      render: (item) => item.employeeCode || t("manager.staff.noCode")
    },
    { key: "fullName", header: t("manager.staff.colName") },
    { key: "workingShift", header: t("manager.staff.colShift"), render: (item) => item.workingShift || t("manager.staff.waitingBE") },
    { key: "phone", header: t("manager.staff.colPhone") },
    { key: "email", header: t("manager.staff.colEmail") },
    {
      key: "performance",
      header: t("manager.staff.colPerformance"),
      render: (item) => (
        <span className="inline-flex items-center space-x-1 font-bold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2.5 py-0.5 rounded-lg text-xs select-none">
          <Sparkles className="h-3 w-3 text-amber-800" />
          <span>{item.performance || t("manager.staff.waitingBE")}</span>
        </span>
      )
    },
    {
      key: "status",
      header: t("manager.staff.colStatus"),
      render: (item) => {
        const isActive = item.status === "active";
        return (
          <StatusBadge
            status={isActive ? "active" : "inactive"}
            customLabel={isActive ? t("manager.staff.statusActive") : t("manager.staff.statusInactive")}
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
          {t("manager.staff.title")} - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("manager.staff.subtitle")}
        </p>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("manager.staff.searchPlaceholder")}
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
