"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Category } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { FormModal } from "@/components/admin/FormModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useDashboardStore((state) => state.categories);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);
  const addCategory = useDashboardStore((state) => state.addCategory);
  const updateCategory = useDashboardStore((state) => state.updateCategory);
  const deleteCategory = useDashboardStore((state) => state.deleteCategory);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState("active");

  useEffect(() => {
    setIsMounted(true);
    void hydrateProductCatalog("admin");
  }, [hydrateProductCatalog]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const columns: Column<Category>[] = [
    { key: "id", header: t("admin.categoriesPage.colId") },
    { key: "name", header: t("admin.categoriesPage.colName") },
    { key: "description", header: t("admin.categoriesPage.colDescription") },
    {
      key: "status",
      header: t("admin.categoriesPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
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

  const handleOpenDelete = async (category: Category) => {
    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle"),
      message: t("admin.deleteCategoryConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      try {
        await deleteCategory(category.id);
        toast.success(t("admin.categoriesPage.successDelete"));
      } catch {
        toast.error(t("admin.categoriesPage.errorDelete"));
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(t("admin.categoriesPage.errorValidation"));
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name: formName.trim(),
          description: formDesc.trim(),
          status: formStatus
        });
        toast.success(t("admin.categoriesPage.successUpdate"));
      } else {
        await addCategory({
          name: formName.trim(),
          description: formDesc.trim(),
          status: formStatus
        });
        toast.success(t("admin.categoriesPage.successCreate"));
      }
    } catch {
      toast.error(t("admin.categoriesPage.errorSave"));
      return;
    }
    setIsFormOpen(false);
  };



  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.categories")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.categoriesPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.createCategory")}</span>
        </Button>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.categoriesPage.searchPlaceholder")}
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
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? t("admin.editCategory") : t("admin.createCategory")}
        size="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.categoriesPage.labelName")}</label>
            <Input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t("admin.categoriesPage.placeholderName")}
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.categoriesPage.labelDesc")}</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder={t("admin.categoriesPage.placeholderDesc")}
              className="w-full p-3 border border-border bg-background text-foreground text-xs font-medium rounded-lg h-16 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.categoriesPage.labelStatus")}</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="active">{t("common.active")}</option>
              <option value="inactive">{t("common.inactive")}</option>
            </select>
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
