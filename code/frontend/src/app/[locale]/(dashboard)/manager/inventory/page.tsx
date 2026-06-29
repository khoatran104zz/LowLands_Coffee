"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Ingredient } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/auth.store";
import { createStockAdjustment, getStockBalances, StockBalance } from "@/services/inventory.service";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const LOW_STOCK_THRESHOLD = 500;

const toInventoryRow = (balance: StockBalance): Ingredient => {
  const quantity = Number(balance.currentStock);
  return {
    id: balance.ingredientId,
    storeId: balance.storeId,
    name: balance.ingredientName,
    quantity,
    unit: balance.unit,
    minAlertLevel: LOW_STOCK_THRESHOLD,
    status: quantity <= 0 ? "out_of_stock" : quantity <= LOW_STOCK_THRESHOLD ? "low_stock" : "in_stock",
  };
};

export default function ManagerInventoryPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);

  const loadInventory = async () => {
    try {
      const balances = await getStockBalances();
      setIngredients(balances.map(toInventoryRow));
      setInventoryError(null);
    } catch (error) {
      console.error("Failed to load stock balances from backend", error);
      setIngredients([]);
      setInventoryError("Khong the tai ton kho tu Backend API.");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    void loadInventory();
  }, []);

  if (!isMounted) {
    return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;
  }

  const columns: Column<Ingredient>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Ten nguyen lieu" },
    {
      key: "quantity",
      header: "So luong ton",
      render: (item) => (
        <span className="font-bold">
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      key: "minAlertLevel",
      header: "Han muc toi thieu",
      render: (item) => (
        <span className="text-muted-foreground text-xs font-semibold">
          {item.minAlertLevel} {item.unit}
        </span>
      ),
    },
    {
      key: "status",
      header: "Tinh trang kho",
      render: (item) => {
        const styles = {
          in_stock: "bg-emerald-500/10 text-emerald-700",
          low_stock: "bg-amber-500/10 text-amber-700 animate-pulse",
          out_of_stock: "bg-rose-500/10 text-rose-700 animate-bounce",
        };
        const labels = {
          in_stock: "Con hang",
          low_stock: "Sap het hang",
          out_of_stock: "Het hang",
        };
        const icons = {
          in_stock: CheckCircle2,
          low_stock: AlertTriangle,
          out_of_stock: XCircle,
        };
        const Icon = icons[item.status];
        return (
          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${styles[item.status]}`}>
            <Icon className="h-3 w-3 shrink-0" />
            <span>{labels[item.status]}</span>
          </span>
        );
      },
    },
  ];

  const handleOpenRestock = (ingredient: Ingredient) => {
    setSelectedIngId(ingredient.id);
    setRestockQty(ingredient.unit === "ml" || ingredient.unit === "gram" ? 500 : 10);
    setIsRestockOpen(true);
  };

  const handleSaveRestock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedIngId || restockQty <= 0) {
      toast.error("Vui long dien so luong nhap hop le.");
      return;
    }
    if (!user?.id) {
      toast.error("Khong tim thay thong tin nguoi dung dang nhap.");
      return;
    }

    const selectedIngredient = ingredients.find((ingredient) => ingredient.id === selectedIngId);
    if (!selectedIngredient?.storeId) {
      toast.error("Khong tim thay cua hang cua nguyen lieu.");
      return;
    }

    try {
      await createStockAdjustment({
        storeId: selectedIngredient.storeId,
        ingredientId: selectedIngredient.id,
        quantity: restockQty,
        unit: selectedIngredient.unit,
        note: "Manager inventory restock",
        createdById: user.id,
      });
      await loadInventory();
      toast.success(`Da bo sung thanh cong +${restockQty} vao ${selectedIngredient.name}.`);
      setIsRestockOpen(false);
    } catch (error) {
      console.error("Failed to create stock adjustment", error);
      toast.error("Khong the nhap kho qua Backend API.");
    }
  };

  const selectedIngredient = ingredients.find((ingredient) => ingredient.id === selectedIngId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("staff.manager.ingredientList")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Theo doi kiem kho, dinh muc nguyen vat lieu pha che va tao phieu nhap kho bo sung.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tim ten nguyen lieu..."
        />
      </div>

      {inventoryError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{inventoryError}</span>
        </div>
      )}

      <DataTable
        data={ingredients}
        columns={columns}
        searchKey="name"
        searchQuery={searchQuery}
        onEdit={handleOpenRestock}
      />

      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title={t("staff.manager.importStockTitle")}
        size="sm"
      >
        {selectedIngredient && (
          <form onSubmit={handleSaveRestock} className="space-y-4 text-left">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/40 text-xs text-foreground/80 space-y-1">
              <div>
                Nguyen lieu: <span className="font-bold text-foreground">{selectedIngredient.name}</span>
              </div>
              <div>
                Ton hien tai: <span className="font-bold text-foreground">{selectedIngredient.quantity} {selectedIngredient.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">So luong nhap them *</label>
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
                Nhap kho bo sung
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
