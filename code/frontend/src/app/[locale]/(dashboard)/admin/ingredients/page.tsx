"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getIngredientCategories,
  Ingredient,
  IngredientCategory
} from "@/services/ingredient.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminIngredientsPage() {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Ingredient | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formStatus, setFormStatus] = useState("active");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ingList, catList] = await Promise.all([
        getIngredients(),
        getIngredientCategories()
      ]);
      setIngredients(ingList);
      setCategories(catList);
    } catch (error) {
      console.error("Failed to load ingredients data", error);
      toast.error("Không thể tải danh sách nguyên liệu từ máy chủ.");
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
  const filteredData = ingredients.filter((item) => {
    const matchesCategory = !categoryFilter || String(item.categoryId) === categoryFilter;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const columns: Column<Ingredient>[] = [
    { key: "id", header: t("admin.ingredientsPage.colId") },
    { key: "code", header: t("admin.ingredientsPage.colCode") },
    { key: "name", header: t("admin.ingredientsPage.colName") },
    { key: "categoryName", header: t("admin.ingredientsPage.colCategory"), render: (item) => item.categoryName || `Mã DM: ${item.categoryId}` },
    { key: "unit", header: t("admin.ingredientsPage.colUnit") },
    {
      key: "status",
      header: t("admin.ingredientsPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : "");
    setFormCode("");
    setFormName("");
    setFormUnit("");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Ingredient) => {
    setEditingItem(item);
    setFormCategoryId(String(item.categoryId));
    setFormCode(item.code);
    setFormName(item.name);
    setFormUnit(item.unit);
    setFormStatus(item.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: Ingredient) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoryId || !formCode.trim() || !formName.trim() || !formUnit.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường thông tin!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        categoryId: parseInt(formCategoryId),
        code: formCode.trim(),
        name: formName.trim(),
        unit: formUnit.trim(),
        status: formStatus
      };

      if (editingItem) {
        await updateIngredient(editingItem.id, payload);
        toast.success("Cập nhật nguyên liệu thành công!");
      } else {
        await createIngredient(payload);
        toast.success("Thêm nguyên liệu mới thành công!");
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save ingredient", error);
      toast.error("Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      await deleteIngredient(itemToDelete.id);
      toast.success("Xóa nguyên liệu thành công!");
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to delete ingredient", error);
      toast.error("Không thể xóa nguyên liệu. Vui lòng kiểm tra lại ràng buộc dữ liệu.");
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
            {t("admin.ingredientsPage.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.ingredientsPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.createIngredient")}</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.ingredientsPage.searchPlaceholder")}
        />
        <Filter
          label={t("admin.ingredientsPage.categoryFilter")}
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          placeholder={t("admin.ingredientsPage.allCategories")}
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          {t("admin.ingredientsPage.loading")}
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
        title={editingItem ? t("admin.editIngredient") : t("admin.createIngredient")}
        onSubmit={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Mã nguyên liệu *</label>
            <Input
              required
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              placeholder="Ví dụ: NL-CAF-ROB"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#c8510a] uppercase">Danh mục nguyên liệu *</label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Tên nguyên liệu *</label>
          <Input
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ví dụ: Cà phê Robusta Đắk Lắk"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Đơn vị tính *</label>
            <Input
              required
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
              placeholder="Ví dụ: kg, ml, lon, hộp"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#c8510a] uppercase">Trạng thái hoạt động</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="active">Đang sử dụng (Active)</option>
              <option value="inactive">Tạm ngưng (Inactive)</option>
            </select>
          </div>
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
        title="Xác nhận xóa nguyên liệu"
        message={`Bạn có chắc chắn muốn xóa nguyên liệu "${itemToDelete?.name}"? Thao tác này không thể phục hồi và có thể ảnh hưởng tới các công thức liên quan.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  );
}
