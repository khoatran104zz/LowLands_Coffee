"use client";

import React, { useEffect, useState } from "react";
import { CustomerExtended, useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminCustomersPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const customers = useDashboardStore((state) => state.customers);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);

  useEffect(() => {
    setIsMounted(true);
    void hydrateUsers();
  }, [hydrateUsers]);

  if (!isMounted) {
    return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;
  }

  const filteredCustomers = customers.filter((customer) => {
    if (!statusFilter) return true;
    return customer.status === statusFilter;
  });

  const columns: Column<CustomerExtended>[] = [
    { key: "id", header: t("admin.customersPage.colId") },
    { key: "fullName", header: t("admin.customersPage.colName") },
    { key: "phone", header: t("admin.customersPage.colPhone") },
    { key: "email", header: t("admin.customersPage.colEmail") },
    {
      key: "orderCount",
      header: t("admin.customersPage.colOrders"),
      render: () => <span className="text-muted-foreground">{t("admin.customersPage.noData")}</span>
    },
    {
      key: "totalSpent",
      header: t("admin.customersPage.colTotalSpent"),
      render: () => <span className="text-muted-foreground">{t("admin.customersPage.noData")}</span>
    },
    {
      key: "status",
      header: t("admin.customersPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("common.customers")}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("admin.customersPage.subtitle")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.customersPage.searchPlaceholder")}
        />
        <Filter
          label={t("admin.customersPage.statusFilter")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: t("admin.customersPage.statusActive") },
            { value: "inactive", label: t("admin.customersPage.statusInactive") }
          ]}
        />
      </div>

      <DataTable
        data={filteredCustomers}
        columns={columns}
        searchKey="fullName"
        searchQuery={searchQuery}
      />
    </div>
  );
}
