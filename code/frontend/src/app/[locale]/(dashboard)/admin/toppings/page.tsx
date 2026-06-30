"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Topping } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminToppingsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toppings = useDashboardStore((state) => state.toppings) || [];
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);
  const addTopping = useDashboardStore((state) => state.addTopping);
  const updateTopping = useDashboardStore((state) => state.updateTopping);
  const deleteTopping = useDashboardStore((state) => state.deleteTopping);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);

  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("0");
  const [formStatus, setFormStatus] = useState("active");

  useEffect(() => {
    setIsMounted(true);
    void hydrateProductCatalog("admin");
  }, [hydrateProductCatalog]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const columns: Column<Topping>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Tên Topping" },
    {
      key: "price",
      header: "Đơn giá",
      render: (item) => (
        <span className="font-semibold text-zinc-800">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
        </span>
      ),
    },
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
          {item.status === "active" ? t("common.active") : t("common.inactive")}
        </span>
      ),
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
            Thiết lập danh mục các loại thạch, trân châu, kem béo đi kèm cho thức uống.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm topping</span>
        </Button>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên topping..."
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
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTopping ? "Chỉnh sửa Topping" : "Thêm Topping Mới"}
        size="md"
      >
        <form onSubmit={handleSaveTopping} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tên Topping *</label>
            <Input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ví dụ: Thạch Cà Phê"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Đơn giá (VND) *</label>
            <Input
              required
              type="number"
              min="0"
              step="1000"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="Ví dụ: 10000"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái</label>
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
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-10 text-xs font-bold px-5 bg-amber-850 hover:bg-amber-800 text-white rounded-lg"
            >
              Lưu lại
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
