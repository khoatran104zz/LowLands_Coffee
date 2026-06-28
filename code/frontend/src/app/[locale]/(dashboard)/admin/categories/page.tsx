"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Category } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";

export default function AdminCategoriesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useDashboardStore((state) => state.categories);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);
  const addCategory = useDashboardStore((state) => state.addCategory);
  const updateCategory = useDashboardStore((state) => state.updateCategory);
  const deleteCategory = useDashboardStore((state) => state.deleteCategory);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState("active");

  useEffect(() => {
    setIsMounted(true);
    void hydrateProductCatalog("admin");
  }, [hydrateProductCatalog]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  const columns: Column<Category>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Tên danh mục" },
    { key: "description", header: "Mô tả chi tiết" },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none ${
            item.status === "active"
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-zinc-500/10 text-zinc-650"
          }`}
        >
          {item.status === "active" ? UI_TEXT.common.active : UI_TEXT.common.inactive}
        </span>
      )
    }
  ];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDesc("");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDesc(category.description || "");
    setFormStatus(category.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setDeletingCategoryId(category.id);
    setIsDeleteOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Vui lòng điền tên danh mục!");
      return;
    }

    if (editingCategory) {
      updateCategory({
        id: editingCategory.id,
        name: formName.trim(),
        description: formDesc.trim(),
        status: formStatus
      });
      toast.success("Cập nhật danh mục thành công!");
    } else {
      addCategory({
        name: formName.trim(),
        description: formDesc.trim(),
        status: formStatus
      });
      toast.success("Thêm danh mục mới thành công!");
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingCategoryId) {
      deleteCategory(deletingCategoryId);
      toast.success("Xóa danh mục thành công!");
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {UI_TEXT.common.categories}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Thiết lập danh sách phân nhóm sản phẩm (Cà phê, Trà, Bánh ngọt, v.v.).
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{UI_TEXT.common.add} danh mục</span>
        </Button>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên danh mục..."
        />
      </div>

      {/* Table list */}
      <DataTable
        data={categories}
        columns={columns}
        searchKey="name"
        searchQuery={searchQuery}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? UI_TEXT.admin.editCategory : UI_TEXT.admin.createCategory}
        size="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tên danh mục *</label>
            <Input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ví dụ: Phindi & Cream"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Mô tả phân loại</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Các món nước kết hợp thạch đá xay và kem béo..."
              className="w-full p-3 border border-border bg-background text-foreground text-xs font-medium rounded-lg h-16 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="active">{UI_TEXT.common.active}</option>
              <option value="inactive">{UI_TEXT.common.inactive}</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              {UI_TEXT.common.cancel}
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4"
            >
              {UI_TEXT.common.save}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác nhận xóa danh mục"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-foreground/80">
            {UI_TEXT.admin.deleteCategoryConfirm}
          </p>
          <div className="flex justify-end space-x-2 border-t border-border/40 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              {UI_TEXT.common.cancel}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-10 text-xs font-semibold px-4"
            >
              {UI_TEXT.common.confirm}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
