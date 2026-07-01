"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Store } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminBranchesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  
  // Table filters & searches
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Store data & actions
  const branches = useDashboardStore((state) => state.branches);
  const addBranch = useDashboardStore((state) => state.addBranch);
  const updateBranch = useDashboardStore((state) => state.updateBranch);
  const deleteBranch = useDashboardStore((state) => state.deleteBranch);

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Store | null>(null);

  // Form input states
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState("active");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Filter logic
  const filteredBranches = branches.filter((b) => {
    if (!statusFilter) return true;
    return b.status === statusFilter;
  });

  // Table columns definition
  const columns: Column<Store>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Tên chi nhánh" },
    { key: "address", header: "Địa chỉ" },
    { key: "phone", header: "Điện thoại" },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  // Form open handlers
  const handleOpenCreate = () => {
    setEditingBranch(null);
    setFormName("");
    setFormAddress("");
    setFormPhone("");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (branch: Store) => {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormAddress(branch.address);
    setFormPhone(branch.phone);
    setFormStatus(branch.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = async (branch: Store) => {
    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle"),
      message: t("admin.deleteBranchConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      deleteBranch(branch.id);
      toast.success("Xóa chi nhánh thành công!");
    }
  };

  // Form submit handlers
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim() || !formPhone.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (editingBranch) {
      updateBranch({
        id: editingBranch.id,
        name: formName.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        status: formStatus
      });
      toast.success("Cập nhật chi nhánh thành công!");
    } else {
      addBranch({
        name: formName.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        status: formStatus
      });
      toast.success("Thêm chi nhánh mới thành công!");
    }
    setIsFormOpen(false);
  };



  return (
    <div className="space-y-6">
      {/* Page Title & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.branches")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Quản lý danh sách chi nhánh hoạt động trong chuỗi Lowlands Coffee.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("common.add")} chi nhánh</span>
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên, địa chỉ chi nhánh..."
        />
        <Filter
          label="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: t("common.active") },
            { value: "inactive", label: t("common.inactive") }
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredBranches}
        columns={columns}
        searchKey="name"
        searchQuery={searchQuery}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingBranch ? t("admin.editBranch") : t("admin.createBranch")}
        size="md"
      >
        <form onSubmit={handleSaveBranch} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tên chi nhánh *</label>
            <Input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ví dụ: Lowlands Coffee - Hồ Con Rùa"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Địa chỉ *</label>
            <Input
              required
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Ví dụ: 42 Phạm Ngọc Thạch, Quận 3, TP. HCM"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Điện thoại *</label>
              <Input
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Ví dụ: 028.3822.4466"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái *</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-800"
              >
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4"
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      </FormModal>

      
    </div>
  );
}
