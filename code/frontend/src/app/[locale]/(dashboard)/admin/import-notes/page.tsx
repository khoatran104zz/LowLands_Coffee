"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Store } from "@/types";
import { getStores } from "@/services/store.service";
import { getSuppliers, Supplier } from "@/services/supplier.service";
import { getIngredients, Ingredient } from "@/services/ingredient.service";
import {
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
  completeGoodsReceipt,
  deleteGoodsReceipt,
  GoodsReceipt,
  GoodsReceiptItem
} from "@/services/goods-receipt.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

interface FormItem {
  ingredientId: number;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export default function AdminImportNotesPage() {
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [branches, setBranches] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // States from Auth store
  const currentUser = useAuthStore((state) => state.user);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Modals controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [viewingReceipt, setViewingReceipt] = useState<GoodsReceipt | null>(null);
  const [receiptToComplete, setReceiptToComplete] = useState<GoodsReceipt | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<GoodsReceipt | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [formSupplierId, setFormSupplierId] = useState("");
  const [formStoreId, setFormStoreId] = useState("");
  const [formReceiptCode, setFormReceiptCode] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formItems, setFormItems] = useState<FormItem[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recList, supList, ingList, storeList] = await Promise.all([
        getGoodsReceipts(),
        getSuppliers(),
        getIngredients(),
        getStores()
      ]);
      setReceipts(recList);
      setSuppliers(supList);
      setIngredients(ingList);
      setBranches(storeList);
    } catch (error) {
      console.error("Failed to load import notes data", error);
      toast.error("Không thể tải danh sách phiếu nhập kho từ máy chủ.");
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
  const filteredData = receipts.filter((item) => {
    const matchesSupplier = !supplierFilter || String(item.supplierId) === supplierFilter;
    const matchesSearch = !searchQuery ||
      item.receiptCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplierName && item.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.createdByName && item.createdByName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSupplier && matchesSearch;
  });

  const columns: Column<GoodsReceipt>[] = [
    { key: "id", header: t("admin.importNotesPage.colId") },
    { key: "receiptCode", header: t("admin.importNotesPage.colCode") },
    { key: "supplierName", header: t("admin.importNotesPage.colSupplier"), render: (item) => item.supplierName || `ID: ${item.supplierId}` },
    { key: "storeName", header: t("admin.importNotesPage.colBranch"), render: (item) => item.storeName || `ID: ${item.storeId}` },
    { key: "createdByName", header: t("admin.importNotesPage.colCreator") },
    {
      key: "totalAmount",
      header: t("admin.importNotesPage.colTotal"),
      render: (item) => `${item.totalAmount.toLocaleString("vi-VN")}đ`
    },
    {
      key: "createdAt",
      header: t("admin.importNotesPage.colDate"),
      render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "N/A"
    },
    {
      key: "status",
      header: t("admin.importNotesPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    if (suppliers.length === 0) {
      toast.error(t("admin.importNotesPage.toastNoSuppliers"));
      return;
    }
    if (ingredients.length === 0) {
      toast.error(t("admin.importNotesPage.toastNoIngredients"));
      return;
    }
    if (branches.length === 0) {
      toast.error(t("admin.importNotesPage.toastNoBranches"));
      return;
    }
    if (!currentUser?.id) {
      toast.error(t("admin.dashboardPage.summaryError"));
      return;
    }

    // Auto generate receipt code
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = `GR-${dateStr}-${randomNum}`;

    setFormSupplierId(String(suppliers[0].id));
    setFormStoreId(String(branches[0].id));
    setFormReceiptCode(code);
    setFormNote("");
    setFormItems([{ ingredientId: ingredients[0].id, quantity: 1, unit: ingredients[0].unit, unitPrice: 10000 }]);
    setIsFormOpen(true);
  };

  const handleAddItemRow = () => {
    setFormItems([
      ...formItems,
      { ingredientId: ingredients[0].id, quantity: 1, unit: ingredients[0].unit, unitPrice: 10000 }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (formItems.length === 1) {
      toast.error("Phiếu nhập kho phải chứa ít nhất 1 nguyên liệu!");
      return;
    }
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof FormItem, val: string | number) => {
    const updated = [...formItems];
    if (field === "ingredientId") {
      const ingId = parseInt(val as string);
      const ing = ingredients.find(i => i.id === ingId);
      updated[idx].ingredientId = ingId;
      updated[idx].unit = ing ? ing.unit : "";
    } else if (field === "quantity") {
      updated[idx].quantity = Math.max(0.01, parseFloat(val as string) || 0);
    } else if (field === "unitPrice") {
      updated[idx].unitPrice = Math.max(0, parseInt(val as string) || 0);
    }
    setFormItems(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierId || !formStoreId || !formReceiptCode.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin chung!");
      return;
    }

    if (!currentUser?.id) {
      toast.error("Khong xac dinh duoc nguoi tao phieu. Vui long dang nhap lai.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        supplierId: parseInt(formSupplierId),
        storeId: parseInt(formStoreId),
        createdById: currentUser.id,
        receiptCode: formReceiptCode.trim(),
        note: formNote.trim(),
        items: formItems
      };

      await createGoodsReceipt(payload);
      toast.success("Tạo phiếu nhập kho nháp thành công!");
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create goods receipt", error);
      toast.error("Thao tác thất bại. Vui lòng kiểm tra lại thông tin phiếu nhập.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDetail = async (item: GoodsReceipt) => {
    try {
      const fullDetail = await getGoodsReceiptById(item.id);
      setViewingReceipt(fullDetail);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết phiếu nhập kho.");
    }
  };

  const handleOpenComplete = (item: GoodsReceipt) => {
    setReceiptToComplete(item);
    setIsCompleteOpen(true);
  };

  const handleComplete = async () => {
    if (!receiptToComplete) return;
    setIsSaving(true);
    try {
      await completeGoodsReceipt(receiptToComplete.id);
      toast.success(`Đã hoàn tất phiếu nhập ${receiptToComplete.receiptCode}. Số lượng tồn kho đã được cập nhật!`);
      setIsCompleteOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to complete receipt", error);
      toast.error("Thao tác thất bại. Không thể hoàn tất phiếu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (item: GoodsReceipt) => {
    setReceiptToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!receiptToDelete) return;
    setIsSaving(true);
    try {
      await deleteGoodsReceipt(receiptToDelete.id);
      toast.success("Xóa phiếu nhập nháp thành công!");
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to delete receipt", error);
      toast.error("Thao tác thất bại. Chỉ có thể xóa phiếu nháp.");
    } finally {
      setIsSaving(false);
    }
  };

  // Compute total for form
  const formTotalAmount = formItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            {t("admin.importNotesPage.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.importNotesPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.createImportNote")}</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.importNotesPage.searchPlaceholder")}
        />
        <Filter
          label={t("admin.importNotesPage.supplierFilter")}
          value={supplierFilter}
          onChange={setSupplierFilter}
          options={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
          placeholder={t("admin.importNotesPage.allSuppliers")}
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          {t("admin.importNotesPage.loading")}
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          searchKey="receiptCode"
          searchQuery={searchQuery}
          onView={handleOpenDetail}
          onEdit={(item) => {
            if (item.status === "DRAFT") {
              handleOpenComplete(item);
            } else {
              toast.info("Chỉ có thể xác nhận hoàn tất đối với phiếu nháp.");
            }
          }}
          onDelete={(item) => {
            if (item.status === "DRAFT") {
              handleOpenDelete(item);
            } else {
              toast.error("Không thể xóa phiếu nhập kho đã hoàn tất!");
            }
          }}
        />
      )}

      {/* Form Modal (Create Import Note) */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={t("admin.createImportNote")}
        onSubmit={handleSave}
        size="lg"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Mã phiếu *</label>
            <Input
              required
              value={formReceiptCode}
              onChange={(e) => setFormReceiptCode(e.target.value)}
              className="h-10 text-xs border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#c8510a] uppercase font-outfit">Nhà cung cấp *</label>
            <select
              value={formSupplierId}
              onChange={(e) => setFormSupplierId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#c8510a] uppercase font-outfit">Chi nhánh nhận *</label>
            <select
              value={formStoreId}
              onChange={(e) => setFormStoreId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Ghi chú phiếu nhập</label>
          <Input
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
            placeholder="Ví dụ: Nhập bổ sung cà phê và sữa đặc cho tuần 1 tháng 7"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        {/* Dynamic Items Selection Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-2 select-none">
            <h4 className="text-xs font-bold text-zinc-800 uppercase font-outfit">Danh sách nguyên vật liệu</h4>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItemRow}
              className="h-8 text-[11px] font-bold rounded-lg border-amber-850 text-amber-850 hover:bg-amber-50 cursor-pointer"
            >
              + Thêm dòng
            </Button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {formItems.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 bg-zinc-50/50 p-2 rounded-lg border border-zinc-200">
                <div className="flex-grow">
                  <select
                    value={item.ingredientId}
                    onChange={(e) => handleItemChange(idx, "ingredientId", e.target.value)}
                    className="w-full h-9 px-2 bg-background border border-border text-foreground rounded-md text-xs font-medium focus:outline-none"
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 shrink-0">
                  <Input
                    type="number"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    placeholder="S.lượng"
                    className="h-9 text-xs bg-background text-center"
                  />
                </div>
                <div className="w-16 text-center select-none">
                  <span className="text-xs font-bold text-zinc-400 block truncate">{item.unit}</span>
                </div>
                <div className="w-32 shrink-0">
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                    placeholder="Đơn giá"
                    className="h-9 text-xs bg-background text-right pr-6"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItemRow(idx)}
                  className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Form Total Check */}
          <div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-lg border border-amber-100 mt-2 select-none">
            <span className="text-xs font-bold text-amber-950 font-outfit uppercase">Tổng giá trị đơn nhập:</span>
            <span className="text-sm font-extrabold text-[#c8510a]">{formTotalAmount.toLocaleString("vi-VN")}đ</span>
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
            {isSaving ? "Đang lưu..." : "Lưu nháp"}
          </Button>
        </div>
      </FormModal>

      {/* Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`${t("admin.editImportNote")}: ${viewingReceipt?.receiptCode}`}
        size="md"
      >
        {viewingReceipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs select-none">
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Nhà cung cấp</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">{viewingReceipt.supplierName}</span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Chi nhánh nhận</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">{viewingReceipt.storeName}</span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Người lập phiếu</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">{viewingReceipt.createdByName}</span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Thời gian lập</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">
                  {viewingReceipt.createdAt ? new Date(viewingReceipt.createdAt).toLocaleString("vi-VN") : "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Ghi chú</span>
                <span className="font-medium text-zinc-600 mt-0.5 block italic">{viewingReceipt.note || "(Không có)"}</span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Trạng thái</span>
                <div className="mt-1"><StatusBadge status={viewingReceipt.status} /></div>
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-150 pt-3">
              <h5 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-left">Danh sách hàng hóa nhập</h5>
              <div className="border border-zinc-150 rounded-lg overflow-hidden divide-y divide-zinc-100">
                {viewingReceipt.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                    <div className="text-left">
                      <span className="font-bold text-zinc-800 block">{item.ingredientName}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Mã: {item.ingredientCode}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-zinc-700 block">{item.quantity} {item.unit} x {item.unitPrice.toLocaleString("vi-VN")}đ</span>
                      <span className="text-[10px] font-extrabold text-[#c8510a] block">{(item.totalPrice || (item.quantity * item.unitPrice)).toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-lg border border-amber-100 select-none">
              <span className="text-xs font-bold text-amber-950 font-outfit uppercase">Tổng cộng:</span>
              <span className="text-sm font-extrabold text-[#c8510a]">{viewingReceipt.totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>

            <div className="flex justify-end space-x-2 border-t border-zinc-100 pt-3 mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="h-9 text-xs font-semibold rounded-lg"
              >
                Đóng
              </Button>
              {viewingReceipt.status === "DRAFT" && (
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenComplete(viewingReceipt);
                  }}
                  className="bg-emerald-650 hover:bg-emerald-600 text-white rounded-lg h-9 text-xs font-semibold px-4 flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Xác nhận hoàn tất</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </FormModal>

      {/* Complete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={handleComplete}
        title="Xác nhận hoàn tất nhập kho"
        message={`Bạn có chắc chắn muốn hoàn tất phiếu nhập "${receiptToComplete?.receiptCode}"? Thao tác này sẽ chính thức cộng số lượng nguyên vật liệu vào Tồn kho hệ thống và KHÔNG THỂ HOÀN TÁC.`}
        confirmText="Xác nhận hoàn tất"
        cancelText="Quay lại"
        variant="info"
        isLoading={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa phiếu nhập nháp"
        message={`Bạn có chắc chắn muốn xóa phiếu nhập nháp "${receiptToDelete?.receiptCode}"?`}
        confirmText="Xác nhận xóa"
        cancelText="Quay lại"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  );
}
