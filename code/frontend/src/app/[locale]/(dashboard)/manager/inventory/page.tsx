"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Ingredient } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/auth.store";
import { createStockAdjustment, getStockBalances, StockBalance } from "@/services/inventory.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { FormModal } from "@/components/admin/FormModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/admin/StatusBadge";

const toInventoryRow = (balance: StockBalance): Ingredient => {
  const quantity = Number(balance.currentStock);
  const minAlertLevel = Number(balance.minStock ?? 0);
  return {
    id: balance.ingredientId,
    storeId: balance.storeId,
    name: balance.ingredientName,
    quantity,
    unit: balance.unit,
    minAlertLevel,
    status: quantity <= 0 ? "out_of_stock" : minAlertLevel > 0 && quantity <= minAlertLevel ? "low_stock" : "in_stock",
  };
};

export default function ManagerInventoryPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const branchName = user?.branchName || "Hồ Con Rùa";

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const loadInventory = async () => {
    try {
      const balances = await getStockBalances();
      const myBranchId = user?.branchId || 2;
      const myBalances = balances.filter((b) => b.storeId === myBranchId);
      setIngredients(myBalances.map(toInventoryRow));
      setInventoryError(null);
    } catch (error) {
      console.error("Failed to load stock balances from backend", error);
      setIngredients([]);
      setInventoryError(t("manager.inventory.balance.loadingError") || "Không thể tải tồn kho từ Backend API.");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    void loadInventory();
  }, [user]);

  if (!isMounted) {
    return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;
  }

  const columns: Column<Ingredient>[] = [
    { key: "id", header: t("manager.inventory.balance.colId") || "ID" },
    { key: "name", header: t("manager.inventory.balance.colName") || "Tên nguyên liệu" },
    {
      key: "minAlertLevel",
      header: t("manager.inventory.balance.colMinStock") || "Tồn tối thiểu",
      render: (item) => (
        <span className="font-bold text-xs text-zinc-500">
          {item.minAlertLevel} {item.unit}
        </span>
      ),
    },
    {
      key: "quantity",
      header: t("manager.inventory.balance.colStock") || "Tồn kho thực tế",
      render: (item) => (
        <span className="font-extrabold text-sm text-zinc-800">
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      key: "status",
      header: t("manager.inventory.balance.colAlert") || "Cảnh báo tồn",
      render: (item) => {
        const status = item.quantity <= 0 ? "out_of_stock" : item.minAlertLevel > 0 && item.quantity <= item.minAlertLevel ? "low_stock" : "in_stock";
        return <StatusBadge status={status} />;
      },
    },
  ];

  const handleOpenRestock = (ingredient: Ingredient) => {
    setSelectedIngId(ingredient.id);
    setRestockQty(ingredient.unit === "ml" || ingredient.unit === "g" ? 500 : 10);
    setIsRestockOpen(true);
  };

  const handleSaveRestock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedIngId || restockQty <= 0) {
      toast.error(t("manager.inventory.balance.toastValidQty"));
      return;
    }
    if (!user?.id) {
      toast.error(t("manager.inventory.balance.toastNoLogin"));
      return;
    }

    const selectedIngredient = ingredients.find((ingredient) => ingredient.id === selectedIngId);
    if (!selectedIngredient?.storeId) {
      toast.error(t("manager.inventory.balance.toastNoStore"));
      return;
    }

    try {
      await createStockAdjustment({
        storeId: selectedIngredient.storeId,
        ingredientId: selectedIngredient.id,
        quantity: restockQty,
        unit: selectedIngredient.unit,
        note: "Manager inventory restock adjustment",
        createdById: user.id,
      });
      await loadInventory();
      toast.success(t("manager.inventory.balance.toastRestockSuccess", { qty: restockQty, name: selectedIngredient.name }));
      setIsRestockOpen(false);
    } catch (error) {
      console.error("Failed to create stock adjustment", error);
      toast.error(t("manager.inventory.balance.toastRestockError"));
    }
  };

  const selectedIngredient = ingredients.find((ingredient) => ingredient.id === selectedIngId);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.sidebar.stockBalance")} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("manager.inventory.balance.subtitle")}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("manager.inventory.balance.searchPlaceholder") || "Tìm tên nguyên liệu..."}
        />
      </div>

      {inventoryError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{inventoryError}</span>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        data={ingredients}
        columns={columns}
        searchKey="name"
        searchQuery={searchQuery}
        onEdit={handleOpenRestock}
      />

      {/* Adjustment Form Modal */}
      <FormModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title={t("manager.inventory.balance.adjustBtn") || "Điều chỉnh kho"}
        size="md"
      >
        {selectedIngredient && (
          <form onSubmit={handleSaveRestock} className="space-y-4 text-left">
            <div className="bg-muted/40 p-4 rounded-xl border border-border/50 text-xs text-foreground/80 space-y-1.5">
              <div>
                {t("manager.inventory.balance.modalIngLabel")} <span className="font-extrabold text-amber-900">{selectedIngredient.name}</span>
              </div>
              <div>
                {t("manager.inventory.balance.modalCurrentStock")} <span className="font-extrabold text-zinc-900">{selectedIngredient.quantity} {selectedIngredient.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("manager.inventory.balance.modalAdjustLabel")}</label>
              <div className="flex items-center space-x-2">
                <Input
                  required
                  type="number"
                  step="any"
                  value={restockQty || ""}
                  onChange={(event) => setRestockQty(parseFloat(event.target.value) || 0)}
                  className="h-10 text-sm border-border bg-background font-bold text-amber-900"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {selectedIngredient.unit}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-border/40 pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRestockOpen(false)}
                className="h-10 text-xs font-semibold rounded-lg"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4"
              >
                {t("manager.inventory.balance.modalSaveBtn")}
              </Button>
            </div>
          </form>
        )}
      </FormModal>
    </div>
  );
}
