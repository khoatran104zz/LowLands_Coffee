"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  Supplier
} from "@/services/supplier.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formTaxCode, setFormTaxCode] = useState("");
  const [formStatus, setFormStatus] = useState("active");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to load suppliers data", error);
      toast.error("Không thể tải danh sách nhà cung cấp từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  if (!isMounted) return null;

  // Filters logic
  const filteredData = suppliers.filter((item) => {
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: Column<Supplier>[] = [
    { key: "id", header: "ID" },
    { key: "code", header: "Mã NCC" },
    { key: "name", header: "Tên nhà cung cấp" },
    { key: "contactName", header: "Liên hệ" },
    { key: "phone", header: "Điện thoại" },
    { key: "taxCode", header: "MST" },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormCode("");
    setFormName("");
    setFormContactName("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormTaxCode("");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Supplier) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormContactName(item.contactName);
    setFormPhone(item.phone);
    setFormEmail(item.email);
    setFormAddress(item.address);
    setFormTaxCode(item.taxCode);
    setFormStatus(item.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: Supplier) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim() || !formContactName.trim() || !formPhone.trim() || !formEmail.trim() || !formAddress.trim() || !formTaxCode.trim()) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formCode.trim(),
        name: formName.trim(),
        contactName: formContactName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        taxCode: formTaxCode.trim(),
        status: formStatus
      };

      if (editingItem) {
        await updateSupplier(editingItem.id, payload);
        toast.success("Cập nhật nhà cung cấp thành công!");
      } else {
        await createSupplier(payload);
        toast.success("Thêm nhà cung cấp mới thành công!");
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save supplier", error);
      toast.error("Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      await deleteSupplier(itemToDelete.id);
      toast.success("Xóa nhà cung cấp thành công!");
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to delete supplier", error);
      toast.error("Không thể xóa nhà cung cấp. Vui lòng kiểm tra lại các phiếu nhập kho liên quan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            Danh sách Nhà cung cấp
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Quản lý các nhà phân phối nguyên liệu thô, hợp đồng cung ứng và thông tin liên hệ đại lý.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm nhà cung cấp</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm theo tên, mã NCC, người liên hệ..."
        />
        <Filter
          label="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: "Đang hợp tác" },
            { value: "inactive", label: "Tạm ngưng" }
          ]}
          placeholder="Tất cả trạng thái"
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          Đang tải danh sách nhà cung cấp từ máy chủ...
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          searchKey="name"
          searchQuery={searchQuery}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Create/Edit Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
        onSubmit={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Mã nhà cung cấp *</label>
            <Input
              required
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              placeholder="Ví dụ: NCC-DMT-MILK"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Mã số thuế *</label>
            <Input
              required
              value={formTaxCode}
              onChange={(e) => setFormTaxCode(e.target.value)}
              placeholder="Ví dụ: 0312345678"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Tên nhà cung cấp *</label>
          <Input
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ví dụ: Công ty Cổ phần Sữa Đà Lạt"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Người liên hệ đại diện *</label>
            <Input
              required
              value={formContactName}
              onChange={(e) => setFormContactName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Điện thoại *</label>
            <Input
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="Ví dụ: 0909123456"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Địa chỉ Email *</label>
          <Input
            required
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="contact@dalatmilk.com.vn"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Địa chỉ trụ sở *</label>
          <Input
            required
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            placeholder="11A Điện Biên Phủ, Quận Bình Thạnh, TP. HCM"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#c8510a] uppercase">Trạng thái hợp tác</label>
          <select
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
            className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
          >
            <option value="active">Đang hợp tác (Active)</option>
            <option value="inactive">Tạm ngưng (Inactive)</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 border-t border-zinc-100 pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFormOpen(false)}
            disabled={isSaving}
            className="h-10 text-xs font-semibold rounded-lg"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
          >
            {isSaving ? "Đang lưu..." : "Lưu lại"}
          </Button>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận ngừng hợp tác"
        message={`Bạn có chắc chắn muốn xóa/ngừng hợp tác với nhà cung cấp "${itemToDelete?.name}"? Thao tác này có thể ảnh hưởng tới các phiếu nhập kho hiện tại.`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  );
}
