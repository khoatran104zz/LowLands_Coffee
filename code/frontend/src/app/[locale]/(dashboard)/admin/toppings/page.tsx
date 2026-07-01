"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Topping } from "@/types";
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

export default function AdminToppingsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");

  const toppings = useDashboardStore((state) => state.toppings) || [];
  const productCatalogError = useDashboardStore((state) => state.productCatalogError);
  const hydrateToppings = useDashboardStore((state) => state.hydrateToppings);
  const addTopping = useDashboardStore((state) => state.addTopping);
  const updateTopping = useDashboardStore((state) => state.updateTopping);
  const deleteTopping = useDashboardStore((state) => state.deleteTopping);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);

  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("0");
  const [formStatus, setFormStatus] = useState("active");

  useEffect(() => {
    void hydrateToppings();
  }, [hydrateToppings]);

  const columns: Column<Topping>[] = [
    { key: "id", header: t("admin.toppingsPage.colId") },
    { key: "name", header: t("admin.toppingsPage.colName") },
    {
      key: "price",
      header: t("admin.toppingsPage.colPrice"),
      render: (item) => (
        <span className="font-semibold text-zinc-800">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("admin.toppingsPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
    },
  ];

  const handleOpenCreate = () => {
    setEditingTopping(null);
    setFormName("");
    setFormPrice("0");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (topping: Topping) => {
    setEditingTopping(topping);
    setFormName(topping.name);
    setFormPrice(topping.price.toString());
    setFormStatus(topping.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = async (topping: Topping) => {
    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle"),
      message: "Bạn có chắc chắn muốn xóa topping này?",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    });
    if (isConfirmed) {
      try {
        await deleteTopping(topping.id);
        toast.success("Xóa topping thành công!");
      } catch {
        toast.error("Không thể xóa topping qua Backend API.");
      }
    }
  };

  const handleSaveTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Vui lòng điền tên topping!");
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Đơn giá không hợp lệ!");
      return;
    }

    try {
      if (editingTopping) {
        await updateTopping({
          id: editingTopping.id,
          name: formName.trim(),
          price: priceNum,
          status: formStatus,
        });
        toast.success("Cập nhật topping thành công!");
      } else {
        await addTopping({
          name: formName.trim(),
          price: priceNum,
          status: formStatus,
        });
        toast.success("Thêm topping mới thành công!");
      }
    } catch {
      toast.error("Không thể lưu topping qua Backend API.");
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
            {t("common.toppings")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.toppingsPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.createTopping")}</span>
        </Button>
      </div>

      {productCatalogError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{productCatalogError}</span>
        </div>
      )}

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.toppingsPage.searchPlaceholder")}
        />
      </div>

      {/* Table list */}
      <DataTable
        data={toppings}
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
        title={editingTopping ? t("admin.editTopping") : t("admin.createTopping")}
        size="md"
      >
        <form onSubmit={handleSaveTopping} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.toppingsPage.labelName")}</label>
            <Input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t("admin.toppingsPage.placeholderName")}
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.toppingsPage.labelPrice")}</label>
            <Input
              required
              type="number"
              min="0"
              step="1000"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder={t("admin.toppingsPage.placeholderPrice")}
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.toppingsPage.labelStatus")}</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full h-10 border border-border bg-background text-foreground text-xs font-semibold rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-amber-800 transition-colors"
            >
              <option value="active">{t("common.active")}</option>
              <option value="inactive">{t("common.inactive")}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="h-10 text-xs font-bold px-4 border-border rounded-lg"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="h-10 text-xs font-bold px-5 bg-amber-850 hover:bg-amber-800 text-white rounded-lg"
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
