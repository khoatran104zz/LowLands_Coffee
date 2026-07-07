"use client";

import React, { useEffect, useState } from "react";
import { CustomerExtended, useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";
import { FormModal } from "@/components/admin/FormModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function AdminCustomersPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Store data & actions
  const customers = useDashboardStore((state) => state.customers);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);
  const updateCustomer = useDashboardStore((state) => state.updateCustomer);

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerExtended | null>(null);
  const [formFullName, setFormFullName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    setIsMounted(true);
    void hydrateUsers();
  }, [hydrateUsers]);

  const handleOpenEdit = (customer: CustomerExtended) => {
    setEditingCustomer(customer);
    setFormFullName(customer.fullName);
    setFormPhone(customer.phone || "");
    setFormEmail(customer.email);
    setFormStatus(customer.status === "inactive" ? "inactive" : "active");
    setIsEditOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!formFullName.trim() || !formEmail.trim()) {
      toast.error(locale === "vi" ? "Vui lòng nhập đầy đủ họ tên và email." : "Please enter full name and email.");
      return;
    }
    try {
      await updateCustomer(editingCustomer.id, {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        status: formStatus,
        roleId: editingCustomer.roleId || 0
      });
      toast.success(locale === "vi" ? "Cập nhật thông tin khách hàng thành công." : "Customer updated successfully.");
      setIsEditOpen(false);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || (locale === "vi" ? "Không thể cập nhật thông tin khách hàng." : "Failed to update customer.");
      toast.error(msg);
    }
  };

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
      render: (item) => <span className="font-bold text-amber-900">{item.orderCount || 0}</span>
    },
    {
      key: "totalSpent",
      header: t("admin.customersPage.colTotalSpent"),
      render: (item) => (
        <span className="font-extrabold text-emerald-700">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.totalSpent || 0)}
        </span>
      )
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
        onEdit={handleOpenEdit}
      />

      {/* Customer Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={locale === "vi" ? "Chỉnh sửa thông tin khách hàng" : "Edit Customer Info"}
        size="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-left px-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              {locale === "vi" ? "Họ và tên" : "Full Name"}
            </label>
            <Input
              required
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              placeholder={locale === "vi" ? "Nhập họ và tên..." : "Enter full name..."}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                {locale === "vi" ? "Số điện thoại" : "Phone Number"}
              </label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder={locale === "vi" ? "Nhập số điện thoại..." : "Enter phone..."}
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                {locale === "vi" ? "Email liên hệ" : "Email Address"}
              </label>
              <Input
                required
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              {locale === "vi" ? "Trạng thái hoạt động" : "Account Status"}
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="active">
                {locale === "vi" ? "Hoạt động (Active)" : "Active"}
              </option>
              <option value="inactive">
                {locale === "vi" ? "Tạm khóa (Inactive)" : "Inactive"}
              </option>
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="text-xs font-semibold h-10 px-4 rounded-lg"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white text-xs font-semibold h-10 px-4 rounded-lg"
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
