"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Ingredient, useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";

export default function ManagerInventoryPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const ingredients = useDashboardStore((state) => state.ingredients);
  const importStock = useDashboardStore((state) => state.importStock);

  // Modal restock state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  const columns: Column<Ingredient>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Tên nguyên liệu" },
    {
      key: "quantity",
      header: "Số lượng tồn",
      render: (item) => (
        <span className="font-bold">
          {item.quantity} {item.unit}
        </span>
      )
    },
    {
      key: "minAlertLevel",
      header: "Hạn mức tối thiểu",
      render: (item) => (
        <span className="text-muted-foreground text-xs font-semibold">
          {item.minAlertLevel} {item.unit}
        </span>
      )
    },
    {
      key: "status",
      header: "Tình trạng kho",
      render: (item) => {
        const styles = {
          in_stock: "bg-emerald-500/10 text-emerald-700",
          low_stock: "bg-amber-500/10 text-amber-700 animate-pulse",
          out_of_stock: "bg-rose-500/10 text-rose-700 animate-bounce"
        };
        const labels = {
          in_stock: "Còn hàng",
          low_stock: "Sắp hết hàng",
          out_of_stock: "Hết hàng"
        };
        const icons = {
          in_stock: CheckCircle2,
          low_stock: AlertTriangle,
          out_of_stock: XCircle
        };
        const Icon = icons[item.status];
        return (
          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${styles[item.status]}`}>
            <Icon className="h-3 w-3 shrink-0" />
            <span>{labels[item.status]}</span>
          </span>
        );
      }
    }
  ];

  const handleOpenRestock = (ing: Ingredient) => {
    setSelectedIngId(ing.id);
    setRestockQty(ing.unit === "lon" || ing.unit === "cái" || ing.unit === "hộp" ? 10 : 5);
    setIsRestockOpen(true);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngId || restockQty <= 0) {
      toast.error("Vui lòng điền số lượng nhập hợp lệ!");
      return;
    }

    importStock(selectedIngId, restockQty);
    const ingName = ingredients.find(i => i.id === selectedIngId)?.name || "nguyên liệu";
    toast.success(`Đã bổ sung thành công +${restockQty} vào ${ingName}!`);
    setIsRestockOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {UI_TEXT.manager.ingredientList}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Theo dõi kiểm kho, định mức nguyên vật liệu pha chế và tạo phiếu nhập kho bổ sung.
          </p>
        </div>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên nguyên liệu..."
        />
      </div>

      {/* Table list */}
      <DataTable
        data={ingredients}
        columns={columns}
        searchKey="name"
        searchQuery={searchQuery}
        onEdit={handleOpenRestock} // map edit action to Restock action!
      />

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title={UI_TEXT.manager.importStockTitle}
        size="sm"
      >
        {selectedIngId && (
          <form onSubmit={handleSaveRestock} className="space-y-4 text-left">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/40 text-xs text-foreground/80 space-y-1">
              <div>Nguyên liệu: <span className="font-bold text-foreground">{ingredients.find(i => i.id === selectedIngId)?.name}</span></div>
              <div>Tồn hiện tại: <span className="font-bold text-foreground">
                {ingredients.find(i => i.id === selectedIngId)?.quantity} {ingredients.find(i => i.id === selectedIngId)?.unit}
              </span></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số lượng nhập thêm *</label>
              <div className="flex items-center space-x-2">
                <Input
                  required
                  type="number"
                  step="any"
                  value={restockQty || ""}
                  onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  className="h-10 text-sm border-border bg-background font-bold text-amber-900"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {ingredients.find(i => i.id === selectedIngId)?.unit}
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
                {UI_TEXT.common.cancel}
              </Button>
              <Button
                type="submit"
                className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4"
              >
                Nhập kho bổ sung
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
