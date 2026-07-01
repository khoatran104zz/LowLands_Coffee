"use client";

import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDashboardStore } from "@/store/dashboardStore";
import { getIngredients, Ingredient } from "@/services/ingredient.service";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  Recipe,
  RecipeIngredient
} from "@/services/recipe.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

interface FormIngRow {
  ingredientId: number;
  quantity: number;
  unit: string;
}

export default function AdminRecipesPage() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Load products list from global store
  const products = useDashboardStore((state) => state.products);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Recipe | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Recipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [formProductVariantId, setFormProductVariantId] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("active");
  const [formIngRows, setFormIngRows] = useState<FormIngRow[]>([]);

  // Flat list of all product variants for mapping dropdowns
  const flatVariants = React.useMemo(() => {
    const list: { id: number; label: string }[] = [];
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        list.push({
          id: v.id,
          label: `${p.name} (Size ${v.size})`
        });
      });
    });
    return list;
  }, [products]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await hydrateProductCatalog("admin");
      const [recipeList, ingList] = await Promise.all([
        getRecipes(),
        getIngredients()
      ]);
      setRecipes(recipeList);
      setIngredients(ingList);
    } catch (error) {
      console.error("Failed to load recipes data", error);
      toast.error("Không thể tải danh sách công thức từ máy chủ.");
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
  const filteredData = recipes.filter((item) => {
    return !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Recipe>[] = [
    { key: "id", header: t("admin.recipesPage.colId") },
    { key: "code", header: t("admin.recipesPage.colCode") },
    { key: "name", header: t("admin.recipesPage.colName") },
    {
      key: "productVariantId",
      header: t("admin.recipesPage.colProduct"),
      render: (item) => {
        const variant = flatVariants.find(v => v.id === item.productVariantId);
        return variant ? variant.label : `Mã biến thể: ${item.productVariantId}`;
      }
    },
    {
      key: "ingredients",
      header: t("admin.recipesPage.colIngredients"),
      render: (item) => (
        <div className="flex flex-wrap gap-1.5 max-w-sm">
          {item.ingredients?.map((ing, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/50 text-[10px] font-bold"
            >
              {ing.ingredientName}: {ing.quantity} {ing.unit}
            </span>
          ))}
        </div>
      )
    },
    {
      key: "status",
      header: t("admin.recipesPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    if (flatVariants.length === 0) {
      toast.error("Vui lòng thiết lập sản phẩm và các size biến thể trước khi lập công thức!");
      return;
    }
    if (ingredients.length === 0) {
      toast.error("Vui lòng thiết lập danh mục nguyên liệu trước!");
      return;
    }

    setEditingItem(null);
    setFormProductVariantId(String(flatVariants[0].id));
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormStatus("active");
    setFormIngRows([{ ingredientId: ingredients[0].id, quantity: 10, unit: ingredients[0].unit }]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Recipe) => {
    setEditingItem(item);
    setFormProductVariantId(String(item.productVariantId));
    setFormCode(item.code);
    setFormName(item.name);
    setFormDescription(item.description || "");
    setFormStatus(item.status);
    setFormIngRows(item.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity,
      unit: ing.unit
    })));
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: Recipe) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleAddRow = () => {
    setFormIngRows([...formIngRows, { ingredientId: ingredients[0].id, quantity: 10, unit: ingredients[0].unit }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (formIngRows.length === 1) {
      toast.error("Công thức pha chế phải có ít nhất 1 nguyên liệu thành phần!");
      return;
    }
    setFormIngRows(formIngRows.filter((_, i) => i !== idx));
  };

  const handleRowChange = (idx: number, field: keyof FormIngRow, val: string | number) => {
    const updated = [...formIngRows];
    if (field === "ingredientId") {
      const ingId = parseInt(val as string);
      const ing = ingredients.find(i => i.id === ingId);
      updated[idx].ingredientId = ingId;
      updated[idx].unit = ing ? ing.unit : "";
    } else if (field === "quantity") {
      updated[idx].quantity = Math.max(0.01, parseFloat(val as string) || 0);
    }
    setFormIngRows(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductVariantId || !formCode.trim() || !formName.trim()) {
      toast.error("Vui lòng nhập đầy đủ các thông tin chung!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        productVariantId: parseInt(formProductVariantId),
        code: formCode.trim(),
        name: formName.trim(),
        description: formDescription.trim(),
        status: formStatus,
        ingredients: formIngRows.map(row => ({
          ingredientId: row.ingredientId,
          quantity: row.quantity,
          unit: row.unit
        }))
      };

      if (editingItem) {
        await updateRecipe(editingItem.id, payload);
        toast.success("Cập nhật công thức pha chế thành công!");
      } else {
        await createRecipe(payload);
        toast.success("Tạo công thức pha chế mới thành công!");
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save recipe", error);
      toast.error("Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      await deleteRecipe(itemToDelete.id);
      toast.success("Xóa công thức thành công!");
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to delete recipe", error);
      toast.error("Thao tác thất bại. Công thức có thể đang được sử dụng ở nơi khác.");
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
            {t("admin.recipesPage.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.recipesPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.createRecipe")}</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.recipesPage.searchPlaceholder")}
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          {t("admin.recipesPage.loading")}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? t("admin.editRecipe") : t("admin.createRecipe")}
        onSubmit={handleSave}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase font-outfit">Mã công thức *</label>
            <Input
              required
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              placeholder="Ví dụ: REC-LATTE-M"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#c8510a] uppercase font-outfit">Sản phẩm áp dụng *</label>
            <select
              value={formProductVariantId}
              onChange={(e) => setFormProductVariantId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              {flatVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Tên công thức *</label>
          <Input
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ví dụ: Công thức pha Coffee Latte Size M"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Mô tả công thức</label>
            <Input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Ví dụ: Đổ 200ml sữa nóng tạo bọt mịn lên 1 shot espresso"
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#c8510a] uppercase">Trạng thái áp dụng</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="active">Đang áp dụng (Active)</option>
              <option value="inactive">Tạm ngưng (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Recipe Ingredients dynamic rows */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-2 select-none">
            <h4 className="text-xs font-bold text-zinc-800 uppercase font-outfit">Thành phần nguyên liệu cần dùng</h4>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddRow}
              className="h-8 text-[11px] font-bold rounded-lg border-amber-850 text-amber-850 hover:bg-amber-50 cursor-pointer"
            >
              + Thêm nguyên liệu
            </Button>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {formIngRows.map((row, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-zinc-50/50 p-2 rounded-lg border border-zinc-200">
                <div className="flex-grow text-left">
                  <select
                    value={row.ingredientId}
                    onChange={(e) => handleRowChange(idx, "ingredientId", e.target.value)}
                    className="w-full h-9 px-2 bg-background border border-border text-foreground rounded-md text-xs font-medium focus:outline-none"
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28 shrink-0">
                  <Input
                    type="number"
                    step="any"
                    value={row.quantity}
                    onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
                    placeholder="Định lượng"
                    className="h-9 text-xs bg-background text-center font-bold"
                  />
                </div>
                <div className="w-20 text-center select-none shrink-0 font-extrabold text-zinc-400 text-xs">
                  {row.unit}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
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
            {isSaving ? "Đang lưu..." : "Lưu công thức"}
          </Button>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa công thức"
        message={`Bạn có chắc chắn muốn xóa công thức pha chế "${itemToDelete?.name}"? Các cửa hàng sẽ không thể pha chế kích cỡ sản phẩm này tự động nếu thiếu công thức.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  );
}
