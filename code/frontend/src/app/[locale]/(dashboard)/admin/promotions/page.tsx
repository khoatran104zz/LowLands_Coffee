"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Calendar, DollarSign, Percent, Plus, Tag, Trash2, Edit, Check } from "lucide-react";
import { Promotion, Product, Category } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { getPromotions, updatePromotionStatus } from "@/services/promotion.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { useParams } from "next/navigation";

export default function AdminPromotionsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);

  // States for server-side loading of promotions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & searches
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [applicableTypeFilter, setApplicableTypeFilter] = useState("");

  // Store data
  const products = useDashboardStore((state) => state.products);
  const categories = useDashboardStore((state) => state.categories);
  const promotions = useDashboardStore((state) => state.promotions);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);
  const hydratePromotions = useDashboardStore((state) => state.hydratePromotions);
  const addPromotion = useDashboardStore((state) => state.addPromotion);
  const updatePromotion = useDashboardStore((state) => state.updatePromotion);
  const deletePromotion = useDashboardStore((state) => state.deletePromotion);

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form fields
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"Percentage" | "Fixed Amount">("Percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0);
  const [formMinOrderVal, setFormMinOrderVal] = useState<number>(0);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | undefined>(undefined);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState<number | undefined>(undefined);
  const [formStatus, setFormStatus] = useState<Promotion["status"]>("Draft");
  const [formApplicableType, setFormApplicableType] = useState<Promotion["applicableType"]>("Entire Order");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          hydrateProductCatalog("admin"),
          hydratePromotions()
        ]);
        setError(null);
      } catch (err) {
        console.error("Failed to load promotion data", err);
        setError("Không thể kết nối đến Backend API để tải dữ liệu khuyến mãi.");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [hydrateProductCatalog, hydratePromotions]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Filter local promotions array based on selected filters
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || promo.status === statusFilter;
    const matchesApplicableType = !applicableTypeFilter || promo.applicableType === applicableTypeFilter;

    return matchesSearch && matchesStatus && matchesApplicableType;
  });

  // Date conversion helpers
  const toDateTimeLocalString = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormCode("");
    setFormName("");
    setFormDesc("");
    setFormDiscountType("Percentage");
    setFormDiscountValue(0);
    setFormMinOrderVal(0);
    setFormMaxDiscount(undefined);
    setFormStartDate("");
    setFormEndDate("");
    setFormUsageLimit(undefined);
    setFormStatus("Draft");
    setFormApplicableType("Entire Order");
    setSelectedProductIds([]);
    setSelectedCategoryIds([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormCode(promo.code);
    setFormName(promo.name);
    setFormDesc(promo.description || "");
    setFormDiscountType(promo.discountType);
    setFormDiscountValue(promo.discountValue);
    setFormMinOrderVal(promo.minimumOrderValue || 0);
    setFormMaxDiscount(promo.maximumDiscount || undefined);
    setFormStartDate(toDateTimeLocalString(promo.startDate));
    setFormEndDate(toDateTimeLocalString(promo.endDate));
    setFormUsageLimit(promo.usageLimit || undefined);
    setFormStatus(promo.status);
    setFormApplicableType(promo.applicableType);
    setSelectedProductIds(promo.applicableProductIds || []);
    setSelectedCategoryIds(promo.applicableCategoryIds || []);
    setIsFormOpen(true);
  };

  const handleOpenDelete = async (promo: Promotion) => {
    const isConfirmed = await confirm({
      title: t("admin.promotionsPage.confirmDeleteTitle"),
      message: t("admin.promotionsPage.confirmDeleteMsg").replace("{code}", promo.code),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      try {
        await deletePromotion(promo.id);
        toast.success(t("admin.promotionsPage.msgSuccessDelete"));
      } catch (err) {
        console.error(err);
        toast.error(t("admin.promotionsPage.msgErrorDelete"));
      }
    }
  };

  const handleToggleStatus = async (promo: Promotion) => {
    const nextStatus = promo.status === "Active" ? "Inactive" : "Active";
    try {
      await updatePromotionStatus(promo.id, nextStatus);
      await hydratePromotions();
      toast.success(
        t("admin.promotionsPage.msgSuccessStatusToggle")
          .replace("{code}", promo.code)
          .replace("{status}", nextStatus)
      );
    } catch (err) {
      console.error(err);
      toast.error(t("admin.promotionsPage.msgErrorStatusToggle"));
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      toast.error(t("admin.promotionsPage.validationRequired"));
      return;
    }

    if (formDiscountValue <= 0) {
      toast.error(t("admin.promotionsPage.validationDiscountValue"));
      return;
    }

    if (formDiscountType === "Percentage" && formDiscountValue > 100) {
      toast.error(t("admin.promotionsPage.validationPercentage"));
      return;
    }

    if (formApplicableType === "Product" && selectedProductIds.length === 0) {
      toast.error(t("admin.promotionsPage.validationProductRequired"));
      return;
    }

    if (formApplicableType === "Category" && selectedCategoryIds.length === 0) {
      toast.error(t("admin.promotionsPage.validationCategoryRequired"));
      return;
    }

    // Build ISO timestamps
    const startDateISO = formStartDate ? new Date(formStartDate).toISOString() : undefined;
    const endDateISO = formEndDate ? new Date(formEndDate).toISOString() : undefined;

    const payload = {
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      description: formDesc.trim(),
      discountType: formDiscountType,
      discountValue: formDiscountValue,
      minimumOrderValue: formMinOrderVal,
      maximumDiscount: formDiscountType === "Percentage" ? formMaxDiscount : undefined,
      startDate: startDateISO,
      endDate: endDateISO,
      usageLimit: formUsageLimit,
      status: formStatus,
      applicableType: formApplicableType,
      applicableProductIds: formApplicableType === "Product" ? selectedProductIds : [],
      applicableCategoryIds: formApplicableType === "Category" ? selectedCategoryIds : []
    };

    try {
      if (editingPromo) {
        await updatePromotion(editingPromo.id, payload);
        toast.success(t("admin.promotionsPage.msgSuccessUpdate"));
      } else {
        await addPromotion(payload);
        toast.success(t("admin.promotionsPage.msgSuccessCreate"));
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || (editingPromo ? t("admin.promotionsPage.msgErrorUpdate") : t("admin.promotionsPage.msgErrorCreate"));
      toast.error(msg);
    }
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  // Columns definition for DataTable
  const columns: Column<Promotion>[] = [
    {
      key: "code",
      header: t("admin.promotionsPage.colCode"),
      render: (item) => (
        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-250 uppercase">
          {item.code}
        </span>
      )
    },
    {
      key: "name",
      header: t("admin.promotionsPage.colName"),
      render: (item) => (
        <div className="text-left">
          <p className="font-bold text-xs text-amber-950 uppercase tracking-wide">{item.name}</p>
          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
      )
    },
    {
      key: "discountValue",
      header: t("admin.promotionsPage.colDiscount"),
      render: (item) => (
        <span className="font-bold text-xs text-emerald-700 flex items-center gap-1 justify-center">
          {item.discountType === "Percentage" ? (
            <>
              {item.discountValue}%
              <span className="text-[9px] text-muted-foreground font-normal">
                ({locale === "vi" ? "tối đa" : "max"} {item.maximumDiscount ? `${item.maximumDiscount.toLocaleString()}đ` : (locale === "vi" ? "ko giới hạn" : "unlimited")})
              </span>
            </>
          ) : (
            `${item.discountValue.toLocaleString()}đ`
          )}
        </span>
      )
    },
    {
      key: "applicableType",
      header: t("admin.promotionsPage.colAppliesTo"),
      render: (item) => {
        let label = t("admin.promotionsPage.typeEntireOrder");
        let colorClass = "bg-blue-50 text-blue-800 border-blue-200";
        if (item.applicableType === "Product") {
          label = t("admin.promotionsPage.typeProduct");
          colorClass = "bg-purple-50 text-purple-800 border-purple-200";
        } else if (item.applicableType === "Category") {
          label = t("admin.promotionsPage.typeCategory");
          colorClass = "bg-orange-50 text-orange-800 border-orange-200";
        }
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colorClass} font-semibold`}>
            {label}
          </span>
        );
      }
    },
    {
      key: "usedCount",
      header: t("admin.promotionsPage.colUsed"),
      render: (item) => (
        <span className="text-xs font-semibold text-amber-900">
          {item.usedCount || 0} / {item.usageLimit || "∞"}
        </span>
      )
    },
    {
      key: "startDate",
      header: t("admin.promotionsPage.colValidity"),
      render: (item) => {
        const start = item.startDate ? new Date(item.startDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US") : "N/A";
        const end = item.endDate ? new Date(item.endDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US") : "N/A";
        return (
          <div className="text-[10px] font-semibold text-muted-foreground flex flex-col items-center">
            <span>{locale === "vi" ? "Từ" : "From"}: {start}</span>
            <span>{locale === "vi" ? "Đến" : "To"}: {end}</span>
          </div>
        );
      }
    },
    {
      key: "status",
      header: t("admin.promotionsPage.colStatus"),
      render: (item) => (
        <button
          onClick={() => handleToggleStatus(item)}
          title={locale === "vi" ? "Bấm để bật/tắt hoạt động" : "Click to toggle status"}
          className="focus:outline-none transition-transform hover:scale-105"
        >
          <StatusBadge status={item.status === "Active" ? "active" : "inactive"} />
        </button>
      )
    },
    {
      key: "id",
      header: t("admin.promotionsPage.colActions"),
      render: (item) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleOpenEdit(item)}
            className="h-7 w-7 text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 rounded-md"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleOpenDelete(item)}
            className="h-7 w-7 text-destructive hover:text-red-700 hover:bg-destructive/10 rounded-md"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.promotions")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.promotionsPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.promotionsPage.createButton")}</span>
        </Button>
      </div>

      {/* Error block */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.promotionsPage.searchPlaceholder")}
        />
        <Filter
          label={t("admin.promotionsPage.filterStatus")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "Draft", label: t("admin.promotionsPage.statusDraft") },
            { value: "Active", label: t("admin.promotionsPage.statusActive") },
            { value: "Inactive", label: t("admin.promotionsPage.statusInactive") },
            { value: "Expired", label: t("admin.promotionsPage.statusExpired") }
          ]}
          placeholder={t("admin.promotionsPage.placeholderFilterStatus")}
        />
        <Filter
          label={t("admin.promotionsPage.filterAppliesTo")}
          value={applicableTypeFilter}
          onChange={setApplicableTypeFilter}
          options={[
            { value: "Entire Order", label: t("admin.promotionsPage.typeEntireOrder") },
            { value: "Product", label: t("admin.promotionsPage.typeProduct") },
            { value: "Category", label: t("admin.promotionsPage.typeCategory") }
          ]}
          placeholder={t("admin.promotionsPage.placeholderFilterAppliesTo")}
        />
      </div>

      {/* Data display table */}
      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
        </div>
      ) : (
        <DataTable
          data={filteredPromotions}
          columns={columns}
          searchKey="name"
          searchQuery={searchQuery}
        />
      )}

      {/* Promotion Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPromo ? t("admin.promotionsPage.editButton") : t("admin.promotionsPage.createButton")}
        size="md"
      >
        <form onSubmit={handleSavePromo} className="space-y-4 text-left max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formCode")}</label>
              <Input
                required
                disabled={!!editingPromo}
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder={t("admin.promotionsPage.placeholderCode")}
                className="uppercase font-mono"
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formName")}</label>
              <Input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("admin.promotionsPage.placeholderName")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formDesc")}</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder={t("admin.promotionsPage.placeholderDesc")}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500 h-16 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formDiscountType")}</label>
              <select
                value={formDiscountType}
                onChange={(e) => setFormDiscountType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Percentage">{t("admin.promotionsPage.optionPercentage")}</option>
                <option value="Fixed Amount">{t("admin.promotionsPage.optionFixedAmount")}</option>
              </select>
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formDiscountValue")}</label>
              <div className="relative">
                <Input
                  type="number"
                  required
                  min={1}
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(parseFloat(e.target.value) || 0)}
                  className="pr-10"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground">
                  {formDiscountType === "Percentage" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formMinOrder")}</label>
              <Input
                type="number"
                min={0}
                value={formMinOrderVal}
                onChange={(e) => setFormMinOrderVal(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                {t("admin.promotionsPage.formMaxDiscount")}
              </label>
              <Input
                type="number"
                min={0}
                disabled={formDiscountType !== "Percentage"}
                value={formMaxDiscount || ""}
                onChange={(e) => setFormMaxDiscount(parseFloat(e.target.value) || undefined)}
                placeholder={t("admin.promotionsPage.placeholderMaxDiscount")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formStartDate")}</label>
              <Input
                type="datetime-local"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formEndDate")}</label>
              <Input
                type="datetime-local"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formUsageLimit")}</label>
              <Input
                type="number"
                min={1}
                value={formUsageLimit || ""}
                onChange={(e) => setFormUsageLimit(parseInt(e.target.value) || undefined)}
                placeholder={t("admin.promotionsPage.placeholderUsageLimit")}
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formStatus")}</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Draft">{t("admin.promotionsPage.optionDraft")}</option>
                <option value="Active">{t("admin.promotionsPage.optionActive")}</option>
                <option value="Inactive">{t("admin.promotionsPage.optionInactive")}</option>
                <option value="Expired">{t("admin.promotionsPage.optionExpired")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.promotionsPage.formApplicableType")}</label>
            <select
              value={formApplicableType}
              onChange={(e) => setFormApplicableType(e.target.value as any)}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Entire Order">{t("admin.promotionsPage.applicableEntireOrder")}</option>
              <option value="Product">{t("admin.promotionsPage.applicableProduct")}</option>
              <option value="Category">{t("admin.promotionsPage.applicableCategory")}</option>
            </select>
          </div>

          {/* Applicable products section */}
          {formApplicableType === "Product" && (
            <div className="space-y-2 border border-dashed border-amber-200 bg-amber-50/20 p-3.5 rounded-xl">
              <label className="text-xs font-bold text-amber-900 uppercase">{t("admin.promotionsPage.formProducts")}</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {products.map((prod) => (
                  <button
                    type="button"
                    key={prod.id}
                    onClick={() => handleProductToggle(prod.id)}
                    className={`text-left text-xs p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                      selectedProductIds.includes(prod.id)
                        ? "bg-amber-100 border-amber-400 font-semibold text-amber-950"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="truncate mr-2">{prod.name}</span>
                    {selectedProductIds.includes(prod.id) && <Check className="h-3.5 w-3.5 text-amber-900 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Applicable categories section */}
          {formApplicableType === "Category" && (
            <div className="space-y-2 border border-dashed border-amber-200 bg-amber-50/20 p-3.5 rounded-xl">
              <label className="text-xs font-bold text-amber-900 uppercase">{t("admin.promotionsPage.formCategories")}</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`text-left text-xs p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                      selectedCategoryIds.includes(cat.id)
                        ? "bg-amber-100 border-amber-400 font-semibold text-amber-950"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="truncate mr-2">{cat.name}</span>
                    {selectedCategoryIds.includes(cat.id) && <Check className="h-3.5 w-3.5 text-amber-900 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-semibold h-10 px-4 rounded-lg"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white text-xs font-semibold h-10 px-4 rounded-lg"
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
