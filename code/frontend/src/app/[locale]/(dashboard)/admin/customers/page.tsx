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
    { key: "id", header: "Ma KH" },
    { key: "fullName", header: "Ten khach hang" },
    { key: "phone", header: "So dien thoai" },
    { key: "email", header: "Email" },
    {
      key: "orderCount",
      header: "So don mua",
      render: () => <span className="text-muted-foreground">Chua co du lieu</span>
    },
    {
      key: "totalSpent",
      header: "Tong chi tieu",
      render: () => <span className="text-muted-foreground">Chua co du lieu</span>
    },
    {
      key: "status",
      header: "Tai khoan",
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
          Danh sach khach hang lay tu User API. Lich su don hang va tong chi tieu se co khi Order backend duoc trien khai.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tim ten khach hang, so dien thoai, email..."
        />
        <Filter
          label="Tai khoan"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: "Hoat dong" },
            { value: "inactive", label: "Tam khoa" }
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
