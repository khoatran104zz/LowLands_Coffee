"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, CheckCircle, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
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

export default function ManagerImportNotesPage() {
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // States from Auth store
  const currentUser = useAuthStore((state) => state.user);
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

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
  const [formReceiptCode, setFormReceiptCode] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formItems, setFormItems] = useState<FormItem[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recList, supList, ingList] = await Promise.all([
        getGoodsReceipts(),
        getSuppliers(),
        getIngredients()
      ]);
      setReceipts(recList);
      setSuppliers(supList);
      setIngredients(ingList);
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

  // Filters logic - Filter by manager's storeId ONLY
  const filteredData = receipts.filter((item) => {
    const matchesBranch = item.storeId === myBranchId;
    const matchesSupplier = !supplierFilter || String(item.supplierId) === supplierFilter;
    const matchesSearch = !searchQuery ||
      item.receiptCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplierName && item.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.createdByName && item.createdByName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBranch && matchesSupplier && matchesSearch;
  });

  const columns: Column<GoodsReceipt>[] = [
    { key: "id", header: t("admin.importNotesPage.colId") || "ID" },
    { key: "receiptCode", header: t("admin.importNotesPage.colCode") || "Mã phiếu" },
    { key: "supplierName", header: t("admin.importNotesPage.colSupplier") || "Nhà cung cấp", render: (item) => item.supplierName || `ID: ${item.supplierId}` },
    { key: "createdByName", header: t("admin.importNotesPage.colCreator") || "Người lập phiếu" },
    {
      key: "totalAmount",
      header: t("admin.importNotesPage.colTotal") || "Tổng giá trị",
      render: (item) => `${item.totalAmount.toLocaleString()}đ`
    },
    {
      key: "createdAt",
      header: t("admin.importNotesPage.colDate") || "Ngày lập",
      render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "N/A"
    },
    {
      key: "status",
      header: t("admin.importNotesPage.colStatus") || "Trạng thái",
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    if (suppliers.length === 0) {
      toast.error(t("admin.importNotesPage.toastNoSuppliers") || "Vui lòng thêm Nhà cung cấp trước!");
      return;
    }
    if (ingredients.length === 0) {
      toast.error(t("admin.importNotesPage.toastNoIngredients") || "Vui lòng thêm Nguyên liệu trước!");
      return;
    }
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập lại.");
      return;
    }

    // Auto generate receipt code
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormReceiptCode(`GRN-${randomNum}`);
    setFormSupplierId(String(suppliers[0].id));
    setFormNote("");
    
    // Add one default empty row
    const defaultIng = ingredients[0];
    setFormItems([
      {
        ingredientId: defaultIng.id,
        quantity: defaultIng.unit === "ml" || defaultIng.unit === "gram" ? 1000 : 10,
        unit: defaultIng.unit,
        unitPrice: 15000
      }
    ]);
    setIsFormOpen(true);
  };

  const handleAddItemRow = () => {
    const defaultIng = ingredients[0];
    setFormItems([
      ...formItems,
      {
        ingredientId: defaultIng.id,
        quantity: defaultIng.unit === "ml" || defaultIng.unit === "gram" ? 1000 : 10,
        unit: defaultIng.unit,
        unitPrice: 15000
      }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (formItems.length === 1) {
      toast.error("Phiếu nhập kho phải có ít nhất một mặt hàng nguyên liệu.");
      return;
    }
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof FormItem, val: string | number) => {
    const updated = [...formItems];
    if (field === "ingredientId") {
      const ingId = Number(val);
      const ing = ingredients.find(i => i.id === ingId);
      updated[idx].ingredientId = ingId;
      if (ing) updated[idx].unit = ing.unit;
    } else if (field === "quantity") {
      updated[idx].quantity = parseFloat(String(val)) || 0;
    } else if (field === "unitPrice") {
      updated[idx].unitPrice = parseInt(String(val)) || 0;
    }
    setFormItems(updated);
  };

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReceiptCode.trim()) {
      toast.error("Vui lòng điền mã phiếu nhập.");
      return;
    }
    if (formItems.some(i => i.quantity <= 0 || i.unitPrice <= 0)) {
      toast.error("Số lượng và đơn giá của các nguyên liệu phải lớn hơn 0.");
      return;
    }

    setIsSaving(true);
    try {
      await createGoodsReceipt({
        receiptCode: formReceiptCode,
        supplierId: Number(formSupplierId),
        storeId: myBranchId, // Always preset to manager's branch
        note: formNote,
        createdById: currentUser!.id,
        items: formItems.map(i => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice
        }))
      });
      toast.success("Tạo phiếu nhập kho nháp thành công!");
      setIsFormOpen(false);
      loadData();
    } catch {
      toast.error("Không thể tạo phiếu nhập kho.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = async (receipt: GoodsReceipt) => {
    try {
      const detail = await getGoodsReceiptById(receipt.id);
      setViewingReceipt(detail);
      setIsDetailOpen(true);
    } catch {
      toast.error("Không thể tải chi tiết phiếu nhập.");
    }
  };

  const handleOpenComplete = (receipt: GoodsReceipt) => {
    setReceiptToComplete(receipt);
    setIsCompleteOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!receiptToComplete) return;
    try {
      await completeGoodsReceipt(receiptToComplete.id);
      toast.success(`Duyệt hoàn thành và cộng kho phiếu ${receiptToComplete.receiptCode} thành công!`);
      setIsCompleteOpen(false);
      loadData();
    } catch {
      toast.error("Không thể hoàn thành phiếu nhập kho.");
    }
  };

  const handleOpenDelete = (receipt: GoodsReceipt) => {
    setReceiptToDelete(receipt);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return;
    try {
      await deleteGoodsReceipt(receiptToDelete.id);
      toast.success(`Xóa thành công phiếu nhập ${receiptToDelete.receiptCode}.`);
      setIsDeleteOpen(false);
      loadData();
    } catch {
      toast.error("Không thể xóa phiếu nhập kho.");
    }
  };

  const formTotalAmount = formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            {t("admin.importNotesPage.title")} - {branchName}
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
          <span>Lập phiếu nhập</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.importNotesPage.searchPlaceholder") || "Tìm theo mã phiếu, nhà cung cấp..."}
        />
        <Filter
          label={t("admin.importNotesPage.supplierFilter") || "Nhà cung cấp"}
          value={supplierFilter}
          onChange={setSupplierFilter}
          options={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
          placeholder={t("admin.importNotesPage.allSuppliers") || "Tất cả nhà cung cấp"}
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
          onView={handleViewDetails}
          onEdit={viewingReceipt?.status === "draft" ? handleViewDetails : undefined}
          onDelete={currentUser?.roleName === "admin" ? handleOpenDelete : undefined}
          extraActions={[
            {
              icon: CheckCircle,
              onClick: handleOpenComplete,
              color: "text-emerald-600 hover:bg-emerald-50",
              title: "Hoàn tất phiếu nhập",
              visible: (item: GoodsReceipt) => item.status === "draft"
            }
          ]}
        />
      )}

      {/* Create Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Lập phiếu nhập kho nguyên liệu"
        size="lg"
      >
        <form onSubmit={handleSaveReceipt} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 select-none">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mã số phiếu nhập *</label>
              <Input
                required
                value={formReceiptCode}
                onChange={(e) => setFormReceiptCode(e.target.value)}
                placeholder="Ví dụ: GRN-010"
                className="h-10 text-xs border-border bg-background"
              />
            </div>

            <div className="space-y-1.5 select-none">
              <label className="text-xs font-bold text-muted-foreground uppercase">Đối tác Nhà cung cấp *</label>
              <select
                value={formSupplierId}
                onChange={(e) => setFormSupplierId(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">Ghi chú nhập kho</label>
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
              <span className="text-sm font-extrabold text-[#c8510a]">{formTotalAmount.toLocaleString()}đ</span>
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
        </form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Chi tiết phiếu nhập: ${viewingReceipt?.receiptCode}`}
        size="lg"
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
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <h4 className="text-xs font-bold text-zinc-800 uppercase font-outfit select-none">Mặt hàng chi tiết</h4>
              <div className="mt-2 border border-zinc-200 rounded-lg overflow-hidden select-none">
                <table className="w-full text-left text-xs font-semibold text-zinc-650">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Nguyên liệu</th>
                      <th className="p-3 text-center">Số lượng</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {viewingReceipt.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50">
                        <td className="p-3">{item.ingredientName || `ID: ${item.ingredientId}`}</td>
                        <td className="p-3 text-center">{item.quantity} {item.unit}</td>
                        <td className="p-3 text-right">{item.unitPrice.toLocaleString()}đ</td>
                        <td className="p-3 text-right">{(item.quantity * item.unitPrice).toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#FAF7F2] p-4 rounded-xl border border-amber-900/10 select-none">
              <div className="text-left">
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Ghi chú phiếu nhập</span>
                <span className="text-xs font-semibold text-zinc-700 block mt-0.5">{viewingReceipt.note || "Không ghi chú"}</span>
              </div>
              <div className="text-right">
                <span className="block text-zinc-400 font-bold uppercase text-[9px]">Tổng thanh toán</span>
                <span className="text-base font-extrabold text-[#c8510a] block">{viewingReceipt.totalAmount.toLocaleString()}đ</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-zinc-100 pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="h-10 text-xs font-semibold rounded-lg"
              >
                Đóng
              </Button>
              {viewingReceipt.status === "draft" && (
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenComplete(viewingReceipt);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                >
                  Duyệt hoàn thành
                </Button>
              )}
            </div>
          </div>
        )}
      </FormModal>

      {/* Complete Confirm Modal */}
      <ConfirmDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={handleConfirmComplete}
        title="Duyệt hoàn tất phiếu nhập kho"
        message={`Bạn có chắc chắn muốn duyệt hoàn tất phiếu nhập kho ${receiptToComplete?.receiptCode}? Hành động này sẽ cộng trực tiếp nguyên liệu vào tồn kho của chi nhánh và không thể hoàn tác.`}
        confirmText="Xác nhận duyệt"
        cancelText="Hủy bỏ"
      />

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa phiếu nhập kho"
        message={`Bạn có chắc chắn muốn xóa phiếu nhập kho ${receiptToDelete?.receiptCode}? LƯU Ý: Thao tác này sẽ xóa vĩnh viễn phiếu nháp này.`}
        confirmText="Xóa phiếu"
        cancelText="Hủy bỏ"
      />
    </div>
  );
}
