"use client";

import React, { useState, useEffect } from "react";
import { CustomerExtended } from "@/mock/customers";
import { useDashboardStore } from "@/store/dashboardStore";
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
    hydrateUsers();
  }, [hydrateUsers]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const filteredCustomers = customers.filter((c) => {
    if (!statusFilter) return true;
    return c.status === statusFilter;
  });

  const columns: Column<CustomerExtended>[] = [
    { key: "id", header: "Mã KH" },
    { key: "fullName", header: "Tên khách hàng" },
    { key: "phone", header: "Số điện thoại" },
    { key: "email", header: "Địa chỉ Email" },
    {
      key: "orderCount",
      header: "Số lượng đơn mua",
      render: (item) => <span className="font-bold text-center block w-full">{item.orderCount} đơn</span>
    },
    {
      key: "totalSpent",
      header: "Tổng tích lũy chi tiêu",
      render: (item) => <span className="font-bold text-amber-900">{item.totalSpent.toLocaleString()}đ</span>
    },
    {
      key: "status",
      header: "Thành viên",
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
          Xem thông tin khách hàng, số lượng đơn đặt hàng trực tuyến và tổng chi tiêu tích lũy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên khách hàng, SĐT, Email..."
        />
        <Filter
          label="Tài khoản"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Tạm khóa" }
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
