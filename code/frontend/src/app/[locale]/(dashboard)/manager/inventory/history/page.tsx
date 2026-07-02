"use client";

import React, { useState, useEffect } from "react";
import { History, AlertCircle } from "lucide-react";
import { getStockMovements, StockMovement } from "@/services/inventory.service";
import { useAuthStore } from "@/store/auth.store";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

import { useParams } from "next/navigation";

export default function ManagerInventoryHistoryPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const currentUser = useAuthStore((state) => state.user);
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allMovements = await getStockMovements();
      // Filter by manager's storeId only
      const myMovements = allMovements.filter((m) => m.storeId === myBranchId);
      setMovements(myMovements);
    } catch (error) {
      console.error("Failed to load inventory movements history", error);
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
  const filteredData = movements.filter((item) => {
    const matchesType = !typeFilter || item.movementType === typeFilter;
    const matchesSearch = !searchQuery ||
      (item.ingredientName && item.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.ingredientCode && item.ingredientCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.createdByName && item.createdByName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const columns: Column<StockMovement>[] = [
    { key: "id", header: "ID" },
    { key: "ingredientCode", header: t("manager.inventory.history.colIngCode") || "Mã NL" },
    { key: "ingredientName", header: t("manager.inventory.history.colIngName") || "Tên nguyên liệu", render: (item) => item.ingredientName || `ID: ${item.ingredientId}` },
    {
      key: "movementType",
      header: t("manager.inventory.history.colType") || "Phân loại giao dịch",
      render: (item) => {
        const type = item.movementType?.toLowerCase();
        let badgeStatus = "active";
        let label = t("manager.inventory.history.typeImport") || "Nhập kho";
        if (type === "export" || type === "deduct") {
          badgeStatus = "inactive";
          label = t("manager.inventory.history.typeExport") || "Xuất kho / Bán hàng";
        } else if (type === "adjustment" || type === "adjust") {
          badgeStatus = "warning";
          label = t("manager.inventory.history.typeAdjust") || "Cân bằng kho";
        }
        return <StatusBadge status={badgeStatus} customLabel={label} />;
      }
    },
    {
      key: "quantity",
      header: t("manager.inventory.history.colQtyChange") || "Lượng thay đổi",
      render: (item) => {
        const qty = item.quantity;
        const isDeduct = item.movementType?.toLowerCase() === "export" || item.movementType?.toLowerCase() === "deduct";
        const sign = isDeduct ? "-" : "+";
        const color = isDeduct ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold";
        return <span className={color}>{sign}{qty} {item.unit}</span>;
      }
    },
    {
      key: "referenceType",
      header: t("manager.inventory.history.colRefSource") || "Nguồn tham chiếu",
      render: (item) => item.referenceType ? `${item.referenceType} (ID: ${item.referenceId})` : (t("manager.inventory.history.refManual") || "Nhập thủ công")
    },
    { key: "createdByName", header: t("manager.inventory.history.colCreator") || "Người thực hiện" },
    {
      key: "createdAt",
      header: t("manager.inventory.history.colTime") || "Thời gian",
      render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US") : "N/A"
    },
    { key: "note", header: t("manager.inventory.history.colNote") || "Lý do / Ghi chú" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            {t("manager.inventory.history.title")} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("manager.inventory.history.subtitle")}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("manager.inventory.history.searchPlaceholder") || "Tìm theo tên nguyên liệu, ghi chú, người lập..."}
        />
        <Filter
          label={t("manager.inventory.history.filterLabel") || "Phân loại giao dịch"}
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "import", label: t("manager.inventory.history.filterImport") || "Nhập kho (Goods Receipt)" },
            { value: "export", label: t("manager.inventory.history.filterExport") || "Xuất kho (Sales)" },
            { value: "adjustment", label: t("manager.inventory.history.filterAdjust") || "Điều chỉnh kho" }
          ]}
          placeholder={t("manager.inventory.history.filterAll") || "Tất cả biến động"}
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          {t("manager.inventory.history.loadingHistory") || "Đang tải dữ liệu lịch sử kho từ máy chủ..."}
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          searchKey="ingredientName"
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}
