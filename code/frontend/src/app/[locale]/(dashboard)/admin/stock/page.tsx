"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftRight, AlertTriangle, ShieldAlert, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useDashboardStore } from "@/store/dashboardStore";
import { getIngredients, Ingredient } from "@/services/ingredient.service";
import {
  getStockBalances,
  createStockAdjustment,
  StockBalance
} from "@/services/inventory.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatsCard } from "@/components/admin/StatsCard";

interface StockBalanceWithId extends StockBalance {
  id: string;
}

export default function AdminStockPage() {
  const [stockBalances, setStockBalances] = useState<StockBalanceWithId[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // States from Auth and Dashboard stores
  const currentUser = useAuthStore((state) => state.user);
  const branches = useDashboardStore((state) => state.branches);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [alertFilter, setAlertFilter] = useState("");

  // Modal controls
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [formStoreId, setFormStoreId] = useState("");
  const [formIngredientId, setFormIngredientId] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formNote, setFormNote] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [balances, ingList] = await Promise.all([
        getStockBalances(),
        getIngredients()
      ]);
      const mapped = balances.map((b) => ({
        ...b,
        id: `${b.storeId}-${b.ingredientId}`
      }));
      setStockBalances(mapped);
      setIngredients(ingList);
    } catch (error) {
      console.error("Failed to load inventory stock balances", error);
      toast.error("Không thể tải thông tin tồn kho từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  if (!isMounted) return null;

  const getStockStatus = (balance: StockBalance) => {
    const qty = balance.currentStock;
    if (qty <= 0) return "out_of_stock";
    if (qty <= 5) return "low_stock";
    return "in_stock";
  };

  // Filters logic
  const filteredData = stockBalances.filter((item) => {
    const status = getStockStatus(item);
    const matchesBranch = !branchFilter || String(item.storeId) === branchFilter;
    const matchesAlert = !alertFilter || status === alertFilter;
    const matchesSearch = !searchQuery ||
      item.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ingredientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesAlert && matchesSearch;
  });

  // Calculate statistics
  const totalItemsCount = stockBalances.length;
  const outOfStockCount = stockBalances.filter(b => b.currentStock <= 0).length;
  const lowStockCount = stockBalances.filter(b => b.currentStock > 0 && b.currentStock <= 5).length;
  const inStockCount = stockBalances.filter(b => b.currentStock > 5).length;

  const columns: Column<StockBalanceWithId>[] = [
    { key: "storeName", header: "Cửa hàng / Chi nhánh" },
    { key: "ingredientCode", header: "Mã nguyên liệu" },
    { key: "ingredientName", header: "Tên nguyên liệu" },
    {
      key: "currentStock",
      header: "Tồn kho thực tế",
      render: (item) => (
        <span className="font-extrabold text-sm">{item.currentStock}</span>
      )
    },
    { key: "unit", header: "Đơn vị" },
    {
      key: "status",
      header: "Cảnh báo tồn",
      render: (item) => <StatusBadge status={getStockStatus(item)} />
    }
  ];

  const handleOpenAdjust = () => {
    if (ingredients.length === 0) {
      toast.error("Vui lòng thêm nguyên liệu trước!");
      return;
    }
    setFormStoreId(branches[0]?.id ? String(branches[0].id) : "1");
    setFormIngredientId(String(ingredients[0].id));
    setFormQuantity("");
    setFormNote("");
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStoreId || !formIngredientId || !formQuantity.trim()) {
      toast.error("Vui lòng điền đầy đủ các thông tin điều chỉnh!");
      return;
    }

    const qtyVal = parseFloat(formQuantity);
    if (isNaN(qtyVal) || qtyVal === 0) {
      toast.error("Số lượng điều chỉnh phải khác 0!");
      return;
    }

    setIsSaving(true);
    try {
      const selectedIng = ingredients.find(i => i.id === parseInt(formIngredientId));
      const payload = {
        storeId: parseInt(formStoreId),
        ingredientId: parseInt(formIngredientId),
        quantity: qtyVal,
        unit: selectedIng ? selectedIng.unit : "kg",
        note: formNote.trim(),
        createdById: currentUser?.id || 1
      };

      await createStockAdjustment(payload);
      toast.success("Điều chỉnh số lượng tồn kho thành công!");
      setIsAdjustOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to adjust stock", error);
      toast.error("Không thể ghi nhận điều chỉnh. Vui lòng kiểm tra lại quyền và dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            Kiểm kê & Điều chỉnh Tồn kho
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Theo dõi số lượng tồn thực tế của nguyên liệu tại các chi nhánh cửa hàng. Tạo phiếu điều chỉnh sai lệch kho.
          </p>
        </div>
        <Button
          onClick={handleOpenAdjust}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Điều chỉnh kho</span>
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng mặt hàng tồn"
          value={totalItemsCount}
          icon={Warehouse}
          description="Sản phẩm nguyên vật liệu"
        />
        <StatsCard
          title="Tồn kho an toàn"
          value={inStockCount}
          icon={Warehouse}
          description="Số lượng ổn định"
          className="hover:border-emerald-500/30"
        />
        <StatsCard
          title="Mức cảnh báo thấp"
          value={lowStockCount}
          icon={AlertTriangle}
          description="Cần chuẩn bị nhập hàng"
          trend={lowStockCount > 0 ? { type: "up", value: "Cần chú ý" } : undefined}
          className="hover:border-amber-500/30"
        />
        <StatsCard
          title="Hết hàng hoàn toàn"
          value={outOfStockCount}
          icon={ShieldAlert}
          description="Cần đặt hàng khẩn cấp"
          trend={outOfStockCount > 0 ? { type: "down", value: "Nghiêm trọng" } : undefined}
          className="hover:border-rose-500/30"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm theo tên nguyên liệu, mã hoặc chi nhánh..."
        />
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Filter
            label="Chi nhánh"
            value={branchFilter}
            onChange={setBranchFilter}
            options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
            placeholder="Tất cả chi nhánh"
          />
          <Filter
            label="Cảnh báo tồn"
            value={alertFilter}
            onChange={setAlertFilter}
            options={[
              { value: "in_stock", label: "Tồn kho an toàn" },
              { value: "low_stock", label: "Sắp hết hàng" },
              { value: "out_of_stock", label: "Hết hàng hoàn toàn" }
            ]}
            placeholder="Mọi trạng thái"
          />
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          Đang tải dữ liệu số dư tồn kho từ máy chủ...
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          searchKey="ingredientName"
          searchQuery={searchQuery}
        />
      )}

      {/* Stock Adjustment Form Modal */}
      <FormModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Tạo phiếu điều chỉnh tồn kho thủ công"
        onSubmit={handleAdjustSubmit}
        size="md"
      >
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#c8510a] uppercase font-outfit">Chi nhánh áp dụng *</label>
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

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#c8510a] uppercase font-outfit">Nguyên liệu điều chỉnh *</label>
          <select
            value={formIngredientId}
            onChange={(e) => setFormIngredientId(e.target.value)}
            className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
          >
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.code}) - Đơn vị: {ing.unit}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
            Số lượng điều chỉnh * (Dùng số âm để giảm tồn kho, số dương để tăng tồn kho)
          </label>
          <Input
            required
            type="number"
            step="any"
            value={formQuantity}
            onChange={(e) => setFormQuantity(e.target.value)}
            placeholder="Ví dụ: -2.5 (giảm 2.5 đơn vị), hoặc 10 (tăng thêm 10)"
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Lý do điều chỉnh / Ghi chú *</label>
          <Input
            required
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
            placeholder="Ví dụ: Hao hụt tự nhiên, kiểm kho định kỳ lệch 2.5kg,..."
            className="h-10 text-xs border-border bg-background"
          />
        </div>

        <div className="flex justify-end space-x-2 border-t border-zinc-100 pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdjustOpen(false)}
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
            {isSaving ? "Đang lưu..." : "Xác nhận điều chỉnh"}
          </Button>
        </div>
      </FormModal>
    </div>
  );
}
