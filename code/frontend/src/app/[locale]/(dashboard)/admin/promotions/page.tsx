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

export default function AdminPromotionsPage() {
  const { t } = useTranslation();
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
      title: "Xác nhận xóa khuyến mãi",
      message: `Bạn có chắc chắn muốn xóa mã khuyến mãi "${promo.code}"?`,
      confirmText: t("common.delete"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      try {
        await deletePromotion(promo.id);
        toast.success("Xóa khuyến mãi thành công");
      } catch (err) {
        console.error(err);
        toast.error("Không thể xóa khuyến mãi");
      }
    }
  };

  const handleToggleStatus = async (promo: Promotion) => {
    const nextStatus = promo.status === "Active" ? "Inactive" : "Active";
    try {
      await updatePromotionStatus(promo.id, nextStatus);
      await hydratePromotions();
      toast.success(`Đã chuyển trạng thái mã ${promo.code} sang ${nextStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể thay đổi trạng thái khuyến mãi");
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      toast.error("Vui lòng điền đầy đủ mã và tên khuyến mãi");
      return;
    }

    if (formDiscountValue <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    if (formDiscountType === "Percentage" && formDiscountValue > 100) {
      toast.error("Tỷ lệ giảm giá (%) không được lớn hơn 100");
      return;
    }

    if (formApplicableType === "Product" && selectedProductIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm áp dụng");
      return;
    }

    if (formApplicableType === "Category" && selectedCategoryIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một danh mục áp dụng");
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
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await addPromotion(payload);
        toast.success("Tạo khuyến mãi thành công");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Không thể lưu thông tin khuyến mãi";
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
      header: "Mã khuyến mãi",
      render: (item) => (
        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-250 uppercase">
          {item.code}
        </span>
      )
    },
    {
      key: "name",
      header: "Tên chương trình",
      render: (item) => (
        <div className="text-left">
          <p className="font-bold text-xs text-amber-950 uppercase tracking-wide">{item.name}</p>
          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
      )
    },
    {
      key: "discountValue",
      header: "Mức giảm",
      render: (item) => (
        <span className="font-bold text-xs text-emerald-700 flex items-center gap-1 justify-center">
          {item.discountType === "Percentage" ? (
            <>
              {item.discountValue}%
              <span className="text-[9px] text-muted-foreground font-normal">
                (tối đa {item.maximumDiscount ? `${item.maximumDiscount.toLocaleString()}đ` : "ko giới hạn"})
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
      header: "Áp dụng cho",
      render: (item) => {
        let label = "Toàn bộ đơn hàng";
        let colorClass = "bg-blue-50 text-blue-800 border-blue-200";
        if (item.applicableType === "Product") {
          label = "Sản phẩm chọn lọc";
          colorClass = "bg-purple-50 text-purple-800 border-purple-200";
        } else if (item.applicableType === "Category") {
          label = "Danh mục nhóm";
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
      header: "Lượt dùng",
      render: (item) => (
        <span className="text-xs font-semibold text-amber-900">
          {item.usedCount || 0} / {item.usageLimit || "∞"}
        </span>
      )
    },
    {
      key: "startDate",
      header: "Thời gian hiệu lực",
      render: (item) => {
        const start = item.startDate ? new Date(item.startDate).toLocaleDateString("vi-VN") : "N/A";
        const end = item.endDate ? new Date(item.endDate).toLocaleDateString("vi-VN") : "N/A";
        return (
          <div className="text-[10px] font-semibold text-muted-foreground flex flex-col items-center">
            <span>Từ: {start}</span>
            <span>Đến: {end}</span>
          </div>
        );
      }
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => (
        <button
          onClick={() => handleToggleStatus(item)}
          title="Bấm để bật/tắt hoạt động"
          className="focus:outline-none transition-transform hover:scale-105"
        >
          <StatusBadge status={item.status === "Active" ? "active" : "inactive"} />
        </button>
      )
    },
    {
      key: "id",
      header: "Hành động",
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
            Quản lý và theo dõi các chương trình ưu đãi, mã giảm giá cho cửa hàng.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo khuyến mãi mới</span>
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
          placeholder="Tìm theo mã hoặc tên..."
        />
        <Filter
          label="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "Draft", label: "Nháp (Draft)" },
            { value: "Active", label: "Kích hoạt (Active)" },
            { value: "Inactive", label: "Ngưng hoạt động (Inactive)" },
            { value: "Expired", label: "Hết hạn (Expired)" }
          ]}
          placeholder="Tất cả trạng thái"
        />
        <Filter
          label="Đối tượng áp dụng"
          value={applicableTypeFilter}
          onChange={setApplicableTypeFilter}
          options={[
            { value: "Entire Order", label: "Toàn bộ hóa đơn" },
            { value: "Product", label: "Sản phẩm cụ thể" },
            { value: "Category", label: "Danh mục nhóm" }
          ]}
          placeholder="Tất cả đối tượng"
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
        title={editingPromo ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}
        size="md"
      >
        <form onSubmit={handleSavePromo} className="space-y-4 text-left max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mã code</label>
              <Input
                required
                disabled={!!editingPromo}
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="Mã giảm giá (ví dụ: ALL10)"
                className="uppercase font-mono"
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tên chương trình</label>
              <Input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Tên chương trình khuyến mãi"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Mô tả</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Chi tiết chương trình khuyến mãi..."
              className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500 h-16 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Hình thức giảm</label>
              <select
                value={formDiscountType}
                onChange={(e) => setFormDiscountType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Percentage">Theo phần trăm (%)</option>
                <option value="Fixed Amount">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mức giảm giá</label>
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
              <label className="text-xs font-bold text-muted-foreground uppercase">Đơn hàng tối thiểu (VNĐ)</label>
              <Input
                type="number"
                min={0}
                value={formMinOrderVal}
                onChange={(e) => setFormMinOrderVal(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Mức giảm tối đa (Chỉ áp dụng %)
              </label>
              <Input
                type="number"
                min={0}
                disabled={formDiscountType !== "Percentage"}
                value={formMaxDiscount || ""}
                onChange={(e) => setFormMaxDiscount(parseFloat(e.target.value) || undefined)}
                placeholder="Để trống nếu không giới hạn"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ngày bắt đầu</label>
              <Input
                type="datetime-local"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ngày kết thúc</label>
              <Input
                type="datetime-local"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Giới hạn số lượt dùng</label>
              <Input
                type="number"
                min={1}
                value={formUsageLimit || ""}
                onChange={(e) => setFormUsageLimit(parseInt(e.target.value) || undefined)}
                placeholder="Không giới hạn"
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Draft">Draft (Lưu nháp)</option>
                <option value="Active">Active (Hoạt động)</option>
                <option value="Inactive">Inactive (Tạm ngưng)</option>
                <option value="Expired">Expired (Hết hạn)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Đối tượng áp dụng</label>
            <select
              value={formApplicableType}
              onChange={(e) => setFormApplicableType(e.target.value as any)}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Entire Order">Toàn bộ đơn hàng</option>
              <option value="Product">Sản phẩm cụ thể</option>
              <option value="Category">Danh mục nhóm</option>
            </select>
          </div>

          {/* Applicable products section */}
          {formApplicableType === "Product" && (
            <div className="space-y-2 border border-dashed border-amber-200 bg-amber-50/20 p-3.5 rounded-xl">
              <label className="text-xs font-bold text-amber-900 uppercase">Chọn sản phẩm áp dụng</label>
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
              <label className="text-xs font-bold text-amber-900 uppercase">Chọn danh mục áp dụng</label>
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
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white text-xs font-semibold h-10 px-4 rounded-lg"
            >
              Xác nhận lưu
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
