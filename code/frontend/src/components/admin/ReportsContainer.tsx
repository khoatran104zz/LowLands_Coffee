"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Inbox,
  Package,
  Search,
  ShoppingBag,
  Store as StoreIcon,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getStores } from "@/services/store.service";
import { Store } from "@/types";
import {
  exportReportExcel,
  getGoodsReceiptReport,
  getIngredientConsumptionReport,
  getInventoryReport,
  getOrderReport,
  getPaymentReport,
  getRevenueReport,
  GoodsReceiptReportResponse,
  IngredientConsumptionReportResponse,
  InventoryReportResponse,
  OrderReportResponse,
  PaymentReportResponse,
  ReportChartPoint,
  ReportFilterParams,
  ReportMetric,
  RevenueReportResponse
} from "@/services/report.service";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { BarChart, HorizontalBarChart, LineChart, PieChart } from "@/components/charts/Chart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportsContainerProps {
  isAdmin: boolean;
}

type ReportTab = "revenue" | "orders" | "inventory" | "payment" | "goods-receipt" | "consumption";

interface ReportDataState {
  revenue: RevenueReportResponse | null;
  orders: OrderReportResponse | null;
  inventory: InventoryReportResponse | null;
  payment: PaymentReportResponse | null;
  goodsReceipt: GoodsReceiptReportResponse | null;
  consumption: IngredientConsumptionReportResponse | null;
}

const DEFAULT_RANGE = "this-month";

export function ReportsContainer({ isAdmin }: ReportsContainerProps) {
  const { t } = useTranslation();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);

  const defaultRange = useMemo(() => getQuickRangeDates(DEFAULT_RANGE), []);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [quickRange, setQuickRange] = useState(DEFAULT_RANGE);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<ReportFilterParams>({
    fromDate: defaultRange.start,
    toDate: defaultRange.end
  });

  const [data, setData] = useState<ReportDataState>({
    revenue: null,
    orders: null,
    inventory: null,
    payment: null,
    goodsReceipt: null,
    consumption: null
  });

  const loadReportData = useCallback(async (nextFilters: ReportFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const reportFilters = isAdmin ? nextFilters : omitStoreId(nextFilters);
      const [revenue, orders, inventory, payment, goodsReceipt, consumption] = await Promise.all([
        getRevenueReport(isAdmin, reportFilters),
        getOrderReport(isAdmin, reportFilters),
        getInventoryReport(isAdmin, reportFilters),
        getPaymentReport(isAdmin, reportFilters),
        getGoodsReceiptReport(isAdmin, reportFilters),
        getIngredientConsumptionReport(isAdmin, reportFilters)
      ]);
      setData({ revenue, orders, inventory, payment, goodsReceipt, consumption });
    } catch (loadError) {
      console.error("Failed to load report data", loadError);
      setError("Cannot load report data from backend API.");
      setData({
        revenue: null,
        orders: null,
        inventory: null,
        payment: null,
        goodsReceipt: null,
        consumption: null
      });
    } finally {
      setIsLoading(false);
      setHasHydrated(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void getStores()
        .then(setStores)
        .catch(() => setStores([]));
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadReportData(filters);
  }, [filters, loadReportData]);

  const handleQuickRangeChange = (value: string) => {
    setQuickRange(value);
    if (value !== "custom") {
      const range = getQuickRangeDates(value);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  };

  const handleApplyFilters = () => {
    setFilters({
      fromDate: startDate,
      toDate: endDate,
      storeId: selectedStoreId,
      paymentMethod,
      orderStatus,
      keyword
    });
  };

  const handleResetFilters = () => {
    const range = getQuickRangeDates(DEFAULT_RANGE);
    setStartDate(range.start);
    setEndDate(range.end);
    setQuickRange(DEFAULT_RANGE);
    setSelectedStoreId("");
    setPaymentMethod("");
    setOrderStatus("");
    setKeyword("");
    setFilters({
      fromDate: range.start,
      toDate: range.end
    });
  };

  const handleExport = async (format: "EXCEL" | "PDF") => {
    if (format !== "EXCEL") {
      toast.error("PDF export is not available in this sprint.");
      return;
    }

    setIsExporting(true);
    try {
      const reportFilters = isAdmin ? filters : omitStoreId(filters);
      const file = await exportReportExcel(isAdmin, activeTab, reportFilters);
      downloadBlob(file.blob, file.filename);
      toast.success("Export Excel successful.");
    } catch (exportError) {
      console.error("Failed to export report", exportError);
      toast.error("Export Excel failed.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasHydrated && isLoading) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center text-muted-foreground">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-amber-900 mb-4" />
        <p className="text-xs font-bold">{t("admin.reports.loadingData")}</p>
      </div>
    );
  }

  const tabs: { id: ReportTab; label: string }[] = [
    { id: "revenue", label: t("admin.reports.tabRevenue") },
    { id: "orders", label: t("admin.reports.tabOrders") },
    { id: "inventory", label: t("admin.reports.tabInventory") },
    { id: "payment", label: t("admin.reports.tabPayment") },
    { id: "goods-receipt", label: t("admin.reports.tabGoodsReceipt") },
    { id: "consumption", label: t("admin.reports.tabConsumption") }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-900/70 mb-2">
            <FileText className="h-3.5 w-3.5" />
            {isAdmin ? "Admin" : "Manager"} / {t("admin.reports.title")}
          </div>
          <h1 className="text-xl font-black text-amber-950 dark:text-amber-100 font-outfit uppercase tracking-wide">
            {t("admin.reports.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.reports.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={() => void loadReportData(filters)} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => void handleExport("EXCEL")} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {t("admin.reports.btnExportExcel")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void handleExport("PDF")} disabled>
            <Download className="h-4 w-4 mr-2" />
            {t("admin.reports.btnExportPdf")}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-xs no-print">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-amber-900" />
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
            {t("admin.reports.filterTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          <FilterField label={t("admin.reports.period")}>
            <select value={quickRange} onChange={(event) => handleQuickRangeChange(event.target.value)} className={inputClassName}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this-week">This week</option>
              <option value="last-week">Last week</option>
              <option value="this-month">This month</option>
              <option value="last-month">Last month</option>
              <option value="custom">Custom</option>
            </select>
          </FilterField>

          <FilterField label={t("admin.reports.fromDate")}>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClassName} />
          </FilterField>

          <FilterField label={t("admin.reports.toDate")}>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={inputClassName} />
          </FilterField>

          {isAdmin ? (
            <FilterField label={t("admin.reports.store")}>
              <select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)} className={inputClassName}>
                <option value="">{t("admin.stockPage.allBranches")}</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </FilterField>
          ) : (
            <FilterField label={t("admin.reports.store")}>
              <div className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 px-3 flex items-center gap-2 text-xs font-bold text-zinc-500">
                <StoreIcon className="h-3.5 w-3.5" />
                Manager store
              </div>
            </FilterField>
          )}

          <FilterField label={t("admin.reports.paymentMethod")}>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={inputClassName}>
              <option value="">All</option>
              <option value="CASH">Cash</option>
              <option value="BANKING">Banking</option>
              <option value="MOMO">MoMo</option>
              <option value="CARD">Card</option>
            </select>
          </FilterField>

          <FilterField label={t("admin.reports.orderStatus")}>
            <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className={inputClassName}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FilterField>
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1fr_auto_auto] gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("admin.reports.searchKeywordPlaceholder")}
            className={inputClassName}
          />
          <Button variant="outline" onClick={handleResetFilters}>{t("admin.reports.btnReset")}</Button>
          <Button onClick={handleApplyFilters}>{t("admin.reports.btnFilter")}</Button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-1 no-print">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide border transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-amber-900 text-white border-amber-900"
                : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-amber-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="min-h-[320px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900" />
        </div>
      ) : (
        <ReportContent activeTab={activeTab} data={data} />
      )}
    </div>
  );
}

function ReportContent({ activeTab, data }: { activeTab: ReportTab; data: ReportDataState }) {
  if (activeTab === "revenue") {
    return <RevenueView report={data.revenue} />;
  }
  if (activeTab === "orders") {
    return <OrdersView report={data.orders} />;
  }
  if (activeTab === "inventory") {
    return <InventoryView report={data.inventory} />;
  }
  if (activeTab === "payment") {
    return <PaymentView report={data.payment} />;
  }
  if (activeTab === "goods-receipt") {
    return <GoodsReceiptView report={data.goodsReceipt} />;
  }
  return <ConsumptionView report={data.consumption} />;
}

function RevenueView({ report }: { report: RevenueReportResponse | null }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={report?.summary ?? []} icons={[DollarSign, ShoppingBag, Activity, CheckCircle, XCircle, AlertTriangle]} />
      <ChartCard title="Revenue trend">
        {hasChart(report?.chart) ? <LineChart data={toChartData(report?.chart ?? [])} height={260} /> : <EmptyState />}
      </ChartCard>
      <TableShell count={report?.rows.length ?? 0}>
        <thead><tr className={headRowClassName}><Th>Date</Th><Th>Store</Th><Th align="right">Revenue</Th><Th align="center">Orders</Th><Th align="center">Completed</Th><Th align="center">Cancelled</Th><Th align="right">Average</Th></tr></thead>
        <tbody>
          {(report?.rows ?? []).map((row) => (
            <tr key={`${row.date}-${row.storeId}`} className={bodyRowClassName}>
              <Td>{row.date}</Td><Td>{row.storeName}</Td><Td align="right">{formatPrice(row.revenue)}</Td><Td align="center">{row.orders}</Td><Td align="center">{row.completed}</Td><Td align="center">{row.cancelled}</Td><Td align="right">{formatPrice(row.averageOrderValue)}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function OrdersView({ report }: { report: OrderReportResponse | null }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={report?.summary ?? []} icons={[ShoppingBag, CheckCircle, Activity, AlertTriangle, XCircle]} />
      <ChartCard title="Orders trend">
        {hasChart(report?.chart) ? <BarChart data={toChartData(report?.chart ?? [])} height={260} /> : <EmptyState />}
      </ChartCard>
      <TableShell count={report?.rows.length ?? 0}>
        <thead><tr className={headRowClassName}><Th>Code</Th><Th>Customer</Th><Th>Time</Th><Th>Store</Th><Th align="right">Amount</Th><Th align="center">Status</Th><Th>Payment</Th></tr></thead>
        <tbody>
          {(report?.rows ?? []).map((row) => (
            <tr key={row.orderId} className={bodyRowClassName}>
              <Td>{row.orderCode}</Td><Td>{row.customerName}</Td><Td>{formatDateTime(row.createdAt)}</Td><Td>{row.storeName}</Td><Td align="right">{formatPrice(row.amount)}</Td><Td align="center">{row.status}</Td><Td>{row.paymentMethod ?? "N/A"} / {row.paymentStatus ?? "N/A"}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function InventoryView({ report }: { report: InventoryReportResponse | null }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={report?.summary ?? []} icons={[Package, CheckCircle, Activity, AlertTriangle]} />
      <ChartCard title="Inventory movement">
        {hasChart(report?.chart) ? <BarChart data={toChartData(report?.chart ?? [])} height={260} /> : <EmptyState />}
      </ChartCard>
      <TableShell count={report?.rows.length ?? 0}>
        <thead><tr className={headRowClassName}><Th>Ingredient</Th><Th>Store</Th><Th align="right">Opening</Th><Th align="right">IN</Th><Th align="right">OUT</Th><Th align="right">Adjustment</Th><Th align="right">Closing</Th><Th>Unit</Th></tr></thead>
        <tbody>
          {(report?.rows ?? []).map((row) => (
            <tr key={`${row.storeId}-${row.ingredientId}`} className={bodyRowClassName}>
              <Td>{row.ingredientName}<div className="text-[10px] text-zinc-400">{row.ingredientCode}</div></Td><Td>{row.storeName}</Td><Td align="right">{formatNumber(row.opening)}</Td><Td align="right">{formatNumber(row.inQuantity)}</Td><Td align="right">{formatNumber(row.outQuantity)}</Td><Td align="right">{formatNumber(row.adjustment)}</Td><Td align="right">{formatNumber(row.closing)}</Td><Td>{row.unit}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function PaymentView({ report }: { report: PaymentReportResponse | null }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={report?.summary ?? []} icons={[DollarSign, CheckCircle, AlertTriangle, XCircle, CreditCard]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Payment breakdown">
          {hasChart(report?.chart) ? <PieChart data={toChartData(report?.chart ?? [])} height={260} /> : <EmptyState />}
        </ChartCard>
        <div className="lg:col-span-2">
          <TableShell count={report?.rows.length ?? 0}>
            <thead><tr className={headRowClassName}><Th>Method</Th><Th>Status</Th><Th align="center">Orders</Th><Th align="right">Amount</Th><Th align="right">Revenue</Th><Th align="right">%</Th></tr></thead>
            <tbody>
              {(report?.rows ?? []).map((row) => (
                <tr key={`${row.paymentMethod}-${row.paymentStatus}`} className={bodyRowClassName}>
                  <Td>{row.paymentMethod}</Td><Td>{row.paymentStatus}</Td><Td align="center">{row.orderCount}</Td><Td align="right">{formatPrice(row.amount)}</Td><Td align="right">{formatPrice(row.revenue)}</Td><Td align="right">{row.percentage.toFixed(1)}%</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </div>
      </div>
    </div>
  );
}

function GoodsReceiptView({ report }: { report: GoodsReceiptReportResponse | null }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={report?.summary ?? []} icons={[FileText, CheckCircle, Activity, DollarSign]} />
      <ChartCard title="Goods receipt value">
        {hasChart(report?.chart) ? <BarChart data={toChartData(report?.chart ?? [])} height={260} /> : <EmptyState />}
      </ChartCard>
      <TableShell count={report?.rows.length ?? 0}>
        <thead><tr className={headRowClassName}><Th>Code</Th><Th>Supplier</Th><Th>Store</Th><Th>Created By</Th><Th align="center">Status</Th><Th align="right">Amount</Th></tr></thead>
        <tbody>
          {(report?.rows ?? []).map((row) => (
            <tr key={row.id} className={bodyRowClassName}>
              <Td>{row.receiptCode}</Td><Td>{row.supplierName}</Td><Td>{row.storeName}</Td><Td>{row.createdByName}</Td><Td align="center">{row.status}</Td><Td align="right">{formatPrice(row.amount)}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function ConsumptionView({ report }: { report: IngredientConsumptionReportResponse | null }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={report?.summary ?? []} icons={[Package, Activity, AlertTriangle]} />
      <ChartCard title="Top consumed ingredients">
        {hasChart(report?.chart) ? <HorizontalBarChart data={toChartData(report?.chart ?? [])} /> : <EmptyState />}
      </ChartCard>
      <TableShell count={report?.rows.length ?? 0}>
        <thead><tr className={headRowClassName}><Th>Ingredient</Th><Th align="right">Consumed</Th><Th align="right">Current Stock</Th><Th>Unit</Th></tr></thead>
        <tbody>
          {(report?.rows ?? []).map((row) => (
            <tr key={row.ingredientId} className={bodyRowClassName}>
              <Td>{row.ingredientName}<div className="text-[10px] text-zinc-400">{row.ingredientCode}</div></Td><Td align="right">{formatNumber(row.consumed)}</Td><Td align="right">{formatNumber(row.currentStock)}</Td><Td>{row.unit}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function MetricGrid({ metrics, icons }: { metrics: ReportMetric[]; icons: LucideIcon[] }) {
  if (metrics.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => {
        const Icon = icons[index % icons.length];
        return (
          <StatsCard
            key={metric.key}
            title={metric.label}
            value={metric.amount != null ? formatPrice(metric.amount) : formatNumber(metric.count ?? 0)}
            icon={Icon}
          />
        );
      })}
    </div>
  );
}

function TableShell({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
      <div className="flex items-center justify-between pb-3 select-none no-print">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Details</h3>
        <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase">{count} rows</span>
      </div>
      {count === 0 ? <EmptyState /> : <div className="overflow-x-auto"><table className="w-full text-xs text-left">{children}</table></div>}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{label}</span>
      {children}
    </label>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-[190px] flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-950/30 text-zinc-400 flex items-center justify-center mb-3 border border-dashed border-zinc-200 dark:border-zinc-800">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {t("admin.reports.noData")}
      </p>
      <p className="text-[10px] text-zinc-400 mt-1 max-w-[280px]">
        {t("admin.reports.noDataSub")}
      </p>
    </div>
  );
}

function getQuickRangeDates(range: string): { start: string; end: string } {
  const today = new Date();
  const start = new Date();
  const end = new Date();

  switch (range) {
    case "today":
      return { start: formatDate(today), end: formatDate(today) };
    case "yesterday":
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      return { start: formatDate(start), end: formatDate(end) };
    case "this-week": {
      const dayOfWeek = today.getDay();
      const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(diffToMonday);
      end.setDate(diffToMonday + 6);
      return { start: formatDate(start), end: formatDate(end) };
    }
    case "last-week": {
      const dayOfWeek = today.getDay();
      const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) - 7;
      start.setDate(diffToMonday);
      end.setDate(diffToMonday + 6);
      return { start: formatDate(start), end: formatDate(end) };
    }
    case "last-month":
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end.setMonth(today.getMonth());
      end.setDate(0);
      return { start: formatDate(start), end: formatDate(end) };
    case "this-month":
    default:
      start.setDate(1);
      end.setMonth(today.getMonth() + 1);
      end.setDate(0);
      return { start: formatDate(start), end: formatDate(end) };
  }
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function toChartData(points: ReportChartPoint[]) {
  return points.map((point) => ({
    label: point.label,
    value: Number(point.value ?? 0),
    secondaryValue: point.secondaryValue == null ? undefined : Number(point.secondaryValue)
  }));
}

function hasChart(points?: ReportChartPoint[]) {
  return Boolean(points && points.length > 0 && points.some((point) => Number(point.value) > 0 || Number(point.secondaryValue ?? 0) > 0));
}

function omitStoreId(params: ReportFilterParams): ReportFilterParams {
  return {
    fromDate: params.fromDate,
    toDate: params.toDate,
    paymentMethod: params.paymentMethod,
    orderStatus: params.orderStatus,
    keyword: params.keyword
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

const inputClassName = "w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold outline-none focus:border-amber-700";
const headRowClassName = "border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider";
const bodyRowClassName = "border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10";

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  const alignment = align === "right" ? "text-right" : align === "center" ? "text-center" : "";
  return <th className={`pb-3.5 px-2 ${alignment}`}>{children}</th>;
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  const alignment = align === "right" ? "text-right" : align === "center" ? "text-center" : "";
  return <td className={`py-3 px-2 font-semibold text-zinc-700 dark:text-zinc-300 ${alignment}`}>{children}</td>;
}
