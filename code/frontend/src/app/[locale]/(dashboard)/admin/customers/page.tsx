"use client";

import React, { useState, useEffect } from "react";
import { CustomerExtended } from "@/mock/customers";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Filter } from "@/components/tables/Filter";
import { UI_TEXT } from "@/constants/ui-text";

export default function AdminCustomersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const customers = useDashboardStore((state) => state.customers);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

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
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none ${
            item.status === "active"
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-zinc-500/10 text-zinc-650"
          }`}
        >
          {item.status === "active" ? "Hoạt động" : "Tạm khóa"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {UI_TEXT.common.customers}
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
