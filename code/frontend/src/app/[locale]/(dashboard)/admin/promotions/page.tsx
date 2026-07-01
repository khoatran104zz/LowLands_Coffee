"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tag } from "lucide-react";
import { Promotion } from "@/types";
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

export default function AdminPromotionsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const promotions = useDashboardStore((state) => state.promotions);
  const addPromotion = useDashboardStore((state) => state.addPromotion);
  const updatePromotion = useDashboardStore((state) => state.updatePromotion);
  const deletePromotion = useDashboardStore((state) => state.deletePromotion);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<Promotion["discountType"]>("percentage");
  const [formVal, setFormVal] = useState<number>(0);
  const [formMin, setFormMin] = useState<number>(0);
  const [formStatus, setFormStatus] = useState("active");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const columns: Column<Promotion>[] = [
    { key: "id", header: "ID" },
    {
      key: "code",
      header: "Mã Code",
      render: (item) => (
        <span className="font-mono font-bold text-amber-800 bg-amber-800/10 border border-amber-800/20 px-2 py-0.5 rounded text-xs select-none">
          {item.code}
        </span>
      )
    },
    { key: "name", header: "Tên chương trình" },
    {
      key: "discountValue",
      header: "Trị giá giảm",
      render: (item) => {
        if (item.discountType === "percentage") return <span>Giảm {item.discountValue}%</span>;
        return <span>Giảm {item.discountValue.toLocaleString()}đ</span>;
      }
    },
    {
      key: "minOrderAmount",
      header: "Đơn tối thiểu",
      render: (item) => <span>{item.minOrderAmount.toLocaleString()}đ</span>
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormCode("");
    setFormName("");
    setFormType("percentage");
    setFormVal(10);
    setFormMin(50000);
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormCode(promo.code);
    setFormName(promo.name);
    setFormType(promo.discountType);
    setFormVal(promo.discountValue);
    setFormMin(promo.minOrderAmount);
    setFormStatus(promo.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = async (promo: Promotion) => {
    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle"),
      message: t("admin.deletePromotionConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      deletePromotion(promo.id);
      toast.success("Xóa chương trình khuyến mãi thành công!");
    }
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim() || formVal <= 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }

    if (editingPromo) {
      updatePromotion({
        id: editingPromo.id,
        code: formCode.toUpperCase().trim(),
        name: formName.trim(),
        discountType: formType,
        discountValue: formVal,
        minOrderAmount: formMin,
        status: formStatus
      });
      toast.success("Cập nhật mã khuyến mãi thành công!");
    } else {
      addPromotion({
        code: formCode.toUpperCase().trim(),
        name: formName.trim(),
        discountType: formType,
        discountValue: formVal,
        minOrderAmount: formMin,
        status: formStatus
      });
      toast.success("Tạo mã khuyến mãi mới thành công!");
    }
    setIsFormOpen(false);
  };



  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.promotions")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Quản lý các chương trình ưu đãi, mã giảm giá trực tuyến &amp; tại quầy của Lowlands Coffee.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("common.add")} mã giảm giá</span>
        </Button>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm mã code, tên sự kiện..."
        />
      </div>

      {/* Table list */}
      <DataTable
        data={promotions}
        columns={columns}
        searchKey="code"
        searchQuery={searchQuery}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPromo ? t("admin.editPromotion") : t("admin.createPromotion")}
        size="md"
      >
        <form onSubmit={handleSavePromo} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mã CODE giảm giá *</label>
              <Input
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="Ví dụ: LOWLANDS20"
                className="h-10 text-xs border-border bg-background uppercase font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tên sự kiện / ưu đãi *</label>
              <Input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Giảm 20k đơn từ 100k"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Loại giảm giá</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as Promotion["discountType"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Trị giá giảm giá *</label>
              <Input
                required
                type="number"
                value={formVal || ""}
                onChange={(e) => setFormVal(parseFloat(e.target.value) || 0)}
                placeholder="Ví dụ: 20000"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Giá trị đơn hàng tối thiểu *</label>
              <Input
                required
                type="number"
                value={formMin || ""}
                onChange={(e) => setFormMin(parseFloat(e.target.value) || 0)}
                placeholder="Ví dụ: 100000"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái mã</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Tạm ngưng (Inactive)</option>
              </select>
            </div>
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
