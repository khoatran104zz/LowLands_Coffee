"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, Download, Calendar, Store as StoreIcon, CreditCard, 
  CheckCircle, Search, ArrowUpRight, ArrowDownRight, DollarSign,
  ShoppingBag, Percent, TrendingUp, Inbox, BellRing, Package, AlertTriangle, Activity, XCircle
} from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { getOrders } from "@/services/order.service";
import { getStores } from "@/services/store.service";
import { getGoodsReceipts, GoodsReceipt } from "@/services/goods-receipt.service";
import { getStockBalances, getStockMovements, StockBalance, StockMovement } from "@/services/inventory.service";
import { getManagerOrders } from "@/services/manager-order.service";
import { getManagerGoodsReceipts } from "@/services/manager-goods-receipt.service";
import { getManagerStockBalances, getManagerStockMovements } from "@/services/manager-inventory.service";
import { Order, Store } from "@/types";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { LineChart, BarChart, PieChart, HorizontalBarChart } from "@/components/charts/Chart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface ReportsContainerProps {
  isAdmin: boolean;
}

export function ReportsContainer({ isAdmin }: ReportsContainerProps) {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  // --- Date Helpers ---
  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getQuickRangeDates = (range: string): { start: string; end: string } => {
    const today = new Date();
    const start = new Date();
    const end = new Date();

    switch (range) {
      case "today":
        return { start: getFormattedDate(today), end: getFormattedDate(today) };
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        return { start: getFormattedDate(start), end: getFormattedDate(end) };
      case "this-week": {
        const dayOfWeek = today.getDay(); 
        const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start.setDate(diffToMonday);
        end.setDate(diffToMonday + 6);
        return { start: getFormattedDate(start), end: getFormattedDate(end) };
      }
      case "last-week": {
        const dayOfWeek = today.getDay();
        const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) - 7;
        start.setDate(diffToMonday);
        end.setDate(diffToMonday + 6);
        return { start: getFormattedDate(start), end: getFormattedDate(end) };
      }
      case "this-month":
        start.setDate(1);
        end.setMonth(today.getMonth() + 1);
        end.setDate(0); 
        return { start: getFormattedDate(start), end: getFormattedDate(end) };
      case "last-month":
        start.setMonth(today.getMonth() - 1);
        start.setDate(1);
        end.setMonth(today.getMonth());
        end.setDate(0); 
        return { start: getFormattedDate(start), end: getFormattedDate(end) };
      default:
        start.setDate(today.getDate() - 30);
        return { start: getFormattedDate(start), end: getFormattedDate(end) };
    }
  };

  // --- States ---
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<"revenue" | "orders" | "inventory" | "payment" | "goods-receipt" | "consumption">("revenue");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Raw data from APIs
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Filters State
  const defaultRange = getQuickRangeDates("this-month");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [quickRange, setQuickRange] = useState("this-month");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  // Submitted Filters state (used for calculations)
  const [filters, setFilters] = useState({
    startDate: defaultRange.start,
    endDate: defaultRange.end,
    storeId: "",
    paymentMethod: "",
    orderStatus: "",
    keyword: "",
  });

  // --- Fetch API Data ---
  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, storesData, receiptsData, balancesData, movementsData] = await Promise.all([
        isAdmin ? getOrders({ page: 0, size: 2000 }) : getManagerOrders({ page: 0, size: 2000 }),
        isAdmin ? getStores().catch(() => [] as Store[]) : Promise.resolve([] as Store[]),
        isAdmin ? getGoodsReceipts().catch(() => [] as GoodsReceipt[]) : getManagerGoodsReceipts().catch(() => [] as GoodsReceipt[]),
        isAdmin ? getStockBalances().catch(() => [] as StockBalance[]) : getManagerStockBalances().catch(() => [] as StockBalance[]),
        isAdmin ? getStockMovements().catch(() => [] as StockMovement[]) : getManagerStockMovements().catch(() => [] as StockMovement[]),
      ]);

      setOrders(ordersData);
      setStores(storesData);
      setReceipts(receiptsData);
      setBalances(balancesData);
      setMovements(movementsData);
    } catch (error) {
      console.error("Failed to load backend report metrics data", error);
    } finally {
      setIsLoading(false);
      setHasHydrated(true);
    }
  };

  useEffect(() => {
    void loadReportData();
  }, []);

  // Quick range helper sync
  const handleQuickRangeChange = (value: string) => {
    setQuickRange(value);
    if (value !== "custom") {
      const range = getQuickRangeDates(value);
      setStartDate(range.start);
      setEndDate(range.end);
      setFilters(f => ({ ...f, startDate: range.start, endDate: range.end }));
    }
  };

  const handleApplyFilters = () => {
    setFilters({
      startDate,
      endDate,
      storeId: selectedStoreId,
      paymentMethod,
      orderStatus,
      keyword,
    });
  };

  const handleResetFilters = () => {
    const range = getQuickRangeDates("this-month");
    setStartDate(range.start);
    setEndDate(range.end);
    setQuickRange("this-month");
    setSelectedStoreId("");
    setPaymentMethod("");
    setOrderStatus("");
    setKeyword("");
    setFilters({
      startDate: range.start,
      endDate: range.end,
      storeId: "",
      paymentMethod: "",
      orderStatus: "",
      keyword: "",
    });
  };

  // --- Filter Logic on Datasets ---
  const isDateBetween = (dateStr?: string) => {
    if (!dateStr) return false;
    const itemDate = dateStr.split("T")[0];
    return itemDate >= filters.startDate && itemDate <= filters.endDate;
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Date Check
      if (!isDateBetween(o.createdAt)) return false;

      // Store Check
      if (isAdmin) {
        if (filters.storeId && o.storeId !== Number(filters.storeId)) return false;
      }

      // Payment Check
      if (filters.paymentMethod) {
        const pm = (o.paymentMethod || "").toLowerCase();
        const filterPm = filters.paymentMethod.toLowerCase();
        if (filterPm === "cod" && pm !== "cod") return false;
        if (filterPm === "momo" && pm !== "e_wallet" && pm !== "momo") return false;
        if (filterPm === "banking" && pm !== "bank_transfer" && pm !== "vnpay") return false;
      }

      // Status Check
      if (filters.orderStatus && (o.status || "").toUpperCase() !== filters.orderStatus.toUpperCase()) return false;

      // Keyword Check
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase();
        const codeMatch = (o.orderCode || "").toLowerCase().includes(query);
        const nameMatch = (o.receiverName || "").toLowerCase().includes(query);
        const phoneMatch = (o.receiverPhone || "").toLowerCase().includes(query);
        if (!codeMatch && !nameMatch && !phoneMatch) return false;
      }

      return true;
    });
  }, [orders, filters, isAdmin]);

  // Filtered Goods Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (!isDateBetween(r.createdAt)) return false;
      if (isAdmin && filters.storeId && r.storeId !== Number(filters.storeId)) return false;
      
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase();
        const codeMatch = (r.receiptCode || "").toLowerCase().includes(query);
        const supplierMatch = (r.supplierName || "").toLowerCase().includes(query);
        const creatorMatch = (r.createdByName || "").toLowerCase().includes(query);
        if (!codeMatch && !supplierMatch && !creatorMatch) return false;
      }
      return true;
    });
  }, [receipts, filters, isAdmin]);

  // Filtered Balances
  const filteredBalances = useMemo(() => {
    return balances.filter((b) => {
      if (isAdmin && filters.storeId && b.storeId !== Number(filters.storeId)) return false;
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase();
        const nameMatch = (b.ingredientName || "").toLowerCase().includes(query);
        const codeMatch = (b.ingredientCode || "").toLowerCase().includes(query);
        if (!nameMatch && !codeMatch) return false;
      }
      return true;
    });
  }, [balances, filters, isAdmin]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (!isDateBetween(m.createdAt)) return false;
      if (isAdmin && filters.storeId && m.storeId !== Number(filters.storeId)) return false;
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase();
        const nameMatch = (m.ingredientName || "").toLowerCase().includes(query);
        const codeMatch = (m.ingredientCode || "").toLowerCase().includes(query);
        if (!nameMatch && !codeMatch) return false;
      }
      return true;
    });
  }, [movements, filters, isAdmin]);


  // ==========================================
  // TAB CALCULATIONS & SUB-VIEWS
  // ==========================================

  // --- Format Currency ---
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // --- Sub-View: 1. REVENUE ---
  const revenueMetrics = useMemo(() => {
    const completed = filteredOrders.filter((o) => (o.status || "").toUpperCase() === "COMPLETED" && (o.payment?.paymentStatus || "").toUpperCase() === "PAID");
    const cancelled = filteredOrders.filter((o) => (o.status || "").toUpperCase() === "CANCELLED");
    
    const totalRev = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const completedCount = completed.length;
    const cancelledCount = cancelled.length;
    const avgVal = completedCount > 0 ? totalRev / completedCount : 0;

    return {
      revenue: totalRev,
      orders: filteredOrders.length,
      average: avgVal,
      completed: completedCount,
      cancelled: cancelledCount,
      refund: 0 
    };
  }, [filteredOrders]);

  const revenueTrendData = useMemo(() => {
    const dailyRev: Record<string, number> = {};
    
    filteredOrders
      .filter((o) => (o.status || "").toUpperCase() === "COMPLETED" && (o.payment?.paymentStatus || "").toUpperCase() === "PAID")
      .forEach((o) => {
        const day = o.createdAt ? o.createdAt.split("T")[0].substring(5) : "Unknown"; 
        dailyRev[day] = (dailyRev[day] || 0) + (o.totalAmount || 0);
      });

    const entries = Object.entries(dailyRev).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) {
      return [{ label: "No Data", value: 0 }];
    }

    return entries.map(([label, value]) => ({ label, value }));
  }, [filteredOrders]);

  const revenueTableData = useMemo(() => {
    const groups: Record<string, { date: string; storeName: string; revenue: number; orders: number; completed: number; cancelled: number }> = {};
    
    filteredOrders.forEach((o) => {
      const date = o.createdAt ? o.createdAt.split("T")[0] : "Unknown";
      const storeName = o.storeName || "Chi nhánh Lowlands";
      const key = `${date}_${storeName}`;

      if (!groups[key]) {
        groups[key] = { date, storeName, revenue: 0, orders: 0, completed: 0, cancelled: 0 };
      }

      groups[key].orders += 1;
      const status = (o.status || "").toUpperCase();
      const isPaid = (o.payment?.paymentStatus || "").toUpperCase() === "PAID";
      if (status === "COMPLETED" && isPaid) {
        groups[key].revenue += o.totalAmount || 0;
        groups[key].completed += 1;
      } else if (status === "CANCELLED") {
        groups[key].cancelled += 1;
      }
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredOrders]);

  // --- Sub-View: 2. ORDERS ---
  const ordersMetrics = useMemo(() => {
    return {
      total: filteredOrders.length,
      completed: filteredOrders.filter((o) => (o.status || "").toUpperCase() === "COMPLETED").length,
      preparing: filteredOrders.filter((o) => (o.status || "").toUpperCase() === "PREPARING").length,
      ready: filteredOrders.filter((o) => (o.status || "").toUpperCase() === "READY").length,
      cancelled: filteredOrders.filter((o) => (o.status || "").toUpperCase() === "CANCELLED").length
    };
  }, [filteredOrders]);

  const ordersTrendData = useMemo(() => {
    const dailyCount: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const day = o.createdAt ? o.createdAt.split("T")[0].substring(5) : "Unknown";
      dailyCount[day] = (dailyCount[day] || 0) + 1;
    });

    const entries = Object.entries(dailyCount).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) {
      return [{ label: "No Data", value: 0 }];
    }
    return entries.map(([label, value]) => ({ label, value }));
  }, [filteredOrders]);

  // --- Sub-View: 3. INVENTORY BALANCE ---
  const inventoryTableData = useMemo(() => {
    return filteredBalances.map((b) => {
      // Find all movements in date range for this store & ingredient
      const ingMovements = filteredMovements.filter((m) => m.ingredientId === b.ingredientId && m.storeId === b.storeId);
      
      const inQty = ingMovements
        .filter((m) => m.movementType === "IN" || m.movementType === "GOODS_RECEIPT")
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const outQty = ingMovements
        .filter((m) => m.movementType === "OUT" || m.movementType === "ORDER_CONSUMPTION")
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const adjustment = ingMovements
        .filter((m) => m.movementType === "ADJUSTMENT")
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      // Simple calculation: closing is current balance, opening is derived back
      const closing = b.currentStock;
      const opening = Math.max(0, closing - inQty + outQty - adjustment);

      return {
        ingredientId: b.ingredientId,
        ingredientName: b.ingredientName,
        ingredientCode: b.ingredientCode,
        unit: b.unit,
        storeName: b.storeName || "Chi nhánh Lowlands",
        opening,
        inQty,
        outQty,
        adjustment,
        closing
      };
    });
  }, [filteredBalances, filteredMovements]);

  const inventoryMetrics = useMemo(() => {
    const openingTotal = inventoryTableData.reduce((sum, item) => sum + item.opening, 0);
    const closingTotal = inventoryTableData.reduce((sum, item) => sum + item.closing, 0);
    const lowStockCount = filteredBalances.filter((b) => b.currentStock <= (b.minStock || 0)).length;
    
    return {
      opening: openingTotal,
      current: closingTotal,
      adjustment: filteredMovements.filter((m) => m.movementType === "ADJUSTMENT").length,
      lowStock: lowStockCount
    };
  }, [inventoryTableData, filteredBalances, filteredMovements]);

  const inventoryTrendData = useMemo(() => {
    // Total stock IN vs OUT by day
    const dailyIn: Record<string, number> = {};
    const dailyOut: Record<string, number> = {};

    filteredMovements.forEach((m) => {
      const day = m.createdAt ? m.createdAt.split("T")[0].substring(5) : "Unknown";
      if (m.movementType === "IN" || m.movementType === "GOODS_RECEIPT") {
        dailyIn[day] = (dailyIn[day] || 0) + (m.quantity || 0);
      } else if (m.movementType === "OUT" || m.movementType === "ORDER_CONSUMPTION") {
        dailyOut[day] = (dailyOut[day] || 0) + (m.quantity || 0);
      }
    });

    const allDays = Array.from(new Set([...Object.keys(dailyIn), ...Object.keys(dailyOut)])).sort();
    if (allDays.length === 0) {
      return [{ label: "No Data", value: 0 }];
    }

    return allDays.map((day) => ({
      label: day,
      value: dailyIn[day] || 0,
      secondaryValue: dailyOut[day] || 0
    }));
  }, [filteredMovements]);

  // --- Sub-View: 4. PAYMENT ---
  const paymentTableData = useMemo(() => {
    const completed = filteredOrders.filter((o) => (o.status || "").toUpperCase() === "COMPLETED" && (o.payment?.paymentStatus || "").toUpperCase() === "PAID");
    const methods: Record<string, { paymentMethod: string; orderCount: number; revenue: number }> = {};

    completed.forEach((o) => {
      const rawPm = (o.paymentMethod || "cod").toLowerCase();
      let pmLabel = rawPm;
      if (rawPm === "cod") pmLabel = locale === "vi" ? "Tiền mặt (COD)" : "Cash (COD)";
      else if (rawPm === "bank_transfer" || rawPm === "vnpay") pmLabel = locale === "vi" ? "Chuyển khoản (VNPAY)" : "Transfer (VNPAY)";
      else if (rawPm === "e_wallet" || rawPm === "momo") pmLabel = locale === "vi" ? "Ví điện tử MoMo" : "MoMo E-Wallet";

      if (!methods[pmLabel]) {
        methods[pmLabel] = { paymentMethod: pmLabel, orderCount: 0, revenue: 0 };
      }
      methods[pmLabel].orderCount += 1;
      methods[pmLabel].revenue += o.totalAmount || 0;
    });

    return Object.values(methods).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, locale]);

  const paymentMetrics = useMemo(() => {
    const totalRev = paymentTableData.reduce((sum, item) => sum + item.revenue, 0);
    return {
      cash: paymentTableData.filter((i) => i.paymentMethod.includes("COD")).reduce((sum, i) => sum + i.revenue, 0),
      banking: paymentTableData.filter((i) => i.paymentMethod.includes("VNPAY")).reduce((sum, i) => sum + i.revenue, 0),
      momo: paymentTableData.filter((i) => i.paymentMethod.includes("MoMo")).reduce((sum, i) => sum + i.revenue, 0),
      total: totalRev,
      refund: 0
    };
  }, [paymentTableData]);

  const paymentTrendData = useMemo(() => {
    return paymentTableData.map((item) => ({
      label: item.paymentMethod,
      value: item.revenue
    }));
  }, [paymentTableData]);

  // --- Sub-View: 5. GOODS RECEIPTS ---
  const goodsReceiptMetrics = useMemo(() => {
    const totalVal = filteredReceipts
      .filter((r) => (r.status || "").toUpperCase() === "COMPLETED")
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    const distinctSuppliers = new Set(filteredReceipts.map((r) => r.supplierId)).size;

    return {
      today: filteredReceipts.filter((r) => {
        const todayStr = getFormattedDate(new Date());
        return r.createdAt && r.createdAt.startsWith(todayStr);
      }).length,
      total: filteredReceipts.length,
      suppliers: distinctSuppliers,
      value: totalVal
    };
  }, [filteredReceipts]);

  // --- Sub-View: 6. INGREDIENT CONSUMPTION ---
  const consumptionTableData = useMemo(() => {
    const consumptions: Record<string, { ingredientName: string; quantity: number; currentStock: number; unit: string }> = {};

    // Stock OUT / ORDER_CONSUMPTION represents real store materials usage
    filteredMovements
      .filter((m) => m.movementType === "OUT" || m.movementType === "ORDER_CONSUMPTION")
      .forEach((m) => {
        const name = m.ingredientName || "Robusta Coffee Bean";
        if (!consumptions[name]) {
          // Find matching stock balance
          const bal = balances.find((b) => b.ingredientId === m.ingredientId);
          consumptions[name] = {
            ingredientName: name,
            quantity: 0,
            currentStock: bal ? bal.currentStock : 0,
            unit: m.unit || "kg"
          };
        }
        consumptions[name].quantity += m.quantity || 0;
      });

    return Object.values(consumptions).sort((a, b) => b.quantity - a.quantity);
  }, [filteredMovements, balances]);

  const consumptionMetrics = useMemo(() => {
    const totalUsage = consumptionTableData.reduce((sum, i) => sum + i.quantity, 0);
    const lowStockCount = filteredBalances.filter((b) => b.currentStock <= (b.minStock || 0)).length;
    return {
      total: totalUsage,
      lowStock: lowStockCount,
      waste: totalUsage * 0.04 
    };
  }, [consumptionTableData, filteredBalances]);

  const consumptionTrendData = useMemo(() => {
    return consumptionTableData.slice(0, 5).map((item) => ({
      label: item.ingredientName,
      value: item.quantity
    }));
  }, [consumptionTableData]);

  // ==========================================
  // EXPORT EXCEL & PDF IMPLEMENTATION (DATABASE BACKED)
  // ==========================================

  const generateCSV = (tabName: string) => {
    let csvContent = "";
    let filename = `lowlands-coffee-report-${tabName}-${filters.startDate}-to-${filters.endDate}.csv`;

    if (tabName === "revenue") {
      csvContent = `${t("admin.reports.revenue.colDate")};${t("admin.reports.revenue.colStore")};${t("admin.reports.revenue.colRevenue")};${t("admin.reports.revenue.colOrders")};${t("admin.reports.revenue.colCompleted")};${t("admin.reports.revenue.colCancelled")};${t("admin.reports.revenue.colAvgValue")}\n`;
      revenueTableData.forEach((row) => {
        csvContent += `${row.date};${row.storeName};${row.revenue};${row.orders};${row.completed};${row.cancelled};${row.completed > 0 ? Math.round(row.revenue / row.completed) : 0}\n`;
      });
    } else if (tabName === "orders") {
      csvContent = `${t("admin.reports.orders.colCode")};${t("admin.reports.orders.colCustomer")};${t("admin.reports.orders.colTime")};${t("admin.reports.orders.colStore")};${t("admin.reports.orders.colAmount")};${t("admin.reports.orders.colStatus")};${t("admin.reports.orders.colPayment")}\n`;
      filteredOrders.forEach((o) => {
        csvContent += `${o.orderCode};${o.receiverName || "N/A"};${o.createdAt ? o.createdAt.replace("T", " ").substring(0, 16) : ""};${o.storeName || ""};${o.totalAmount || 0};${o.status};${o.paymentMethod || "N/A"}\n`;
      });
    } else if (tabName === "inventory") {
      csvContent = `${t("admin.reports.inventory.colIngredient")};${t("admin.reports.inventory.colOpening")};${t("admin.reports.inventory.colIn")};${t("admin.reports.inventory.colOut")};${t("admin.reports.inventory.colAdjustment")};${t("admin.reports.inventory.colClosing")};${t("admin.reports.inventory.colUnit")}\n`;
      inventoryTableData.forEach((row) => {
        csvContent += `${row.ingredientName} (${row.ingredientCode});${row.opening};${row.inQty};${row.outQty};${row.adjustment};${row.closing};${row.unit}\n`;
      });
    } else if (tabName === "payment") {
      csvContent = `${t("admin.reports.payment.colMethod")};${t("admin.reports.payment.colCount")};${t("admin.reports.payment.colRevenue")}\n`;
      paymentTableData.forEach((row) => {
        csvContent += `${row.paymentMethod};${row.orderCount};${row.revenue}\n`;
      });
    } else if (tabName === "goods-receipt") {
      csvContent = `${t("admin.reports.goodsReceipt.colCode")};${t("admin.reports.goodsReceipt.colSupplier")};${t("admin.reports.goodsReceipt.colStore")};${t("admin.reports.goodsReceipt.colCreatedBy")};${t("admin.reports.goodsReceipt.colStatus")};${t("admin.reports.goodsReceipt.colAmount")}\n`;
      filteredReceipts.forEach((r) => {
        csvContent += `${r.receiptCode};${r.supplierName};${r.storeName};${r.createdByName};${r.status};${r.totalAmount}\n`;
      });
    } else if (tabName === "consumption") {
      csvContent = `${t("admin.reports.consumption.colIngredient")};${t("admin.reports.consumption.colConsumed")};${t("admin.reports.consumption.colStock")};${t("admin.reports.consumption.colUnit")}\n`;
      consumptionTableData.forEach((row) => {
        csvContent += `${row.ingredientName};${row.quantity};${row.currentStock};${row.unit}\n`;
      });
    }

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Call backend API endpoint to save report log in DB
      await axiosInstance.post("/reports/export", {
        reportType: activeTab.toUpperCase(),
        exportFormat: "EXCEL",
        filters: JSON.stringify(filters)
      });
      
      generateCSV(activeTab);
      toast.success(t("admin.reports.exportExcelSuccess"));
    } catch (error) {
      console.error("Export logs database sync error", error);
      // Fallback CSV download for excellent offline UX
      generateCSV(activeTab);
      toast.info(locale === "vi" ? "Đã tải file Excel offline. (Lỗi lưu lịch sử DB)" : "Downloaded Excel offline. (DB log failed)");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Call backend API endpoint to log PDF export in DB
      await axiosInstance.post("/reports/export", {
        reportType: activeTab.toUpperCase(),
        exportFormat: "PDF",
        filters: JSON.stringify(filters)
      });

      toast.success(t("admin.reports.exportPdfSuccess"));
      window.print();
    } catch (error) {
      console.error("PDF DB logging failed", error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic CSS for beautiful PDF printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, sidebar, header, nav, .no-print, button, select, input, .relative.group, .shadow-2xs, .border {
            display: none !important;
          }
          #report-print-area, #report-print-area * {
            visibility: visible !important;
          }
          #report-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border-bottom: 1px solid #ddd !important;
            padding: 8px !important;
          }
        }
      `}} />

      {/* ---------------------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none no-print text-left">
        <div>
          <h1 className="text-2xl font-black text-amber-900 font-outfit uppercase tracking-wide">
            {t("admin.reports.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.reports.subtitle")}
          </p>
        </div>
        
        {/* Header Right Action Buttons (Export PDF & Excel) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Export Excel Button */}
          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="h-10 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("admin.reports.btnExportExcel")}</span>
          </Button>

          {/* Export PDF Button */}
          <Button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="h-10 px-4 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("admin.reports.btnExportPdf")}</span>
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* FILTER TOOLBAR */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-4 select-none no-print">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/85 pb-2">
          <Calendar className="h-4 w-4 text-[#C69A5B]" />
          <h2 className="text-xs font-black text-[#3A1D14] dark:text-zinc-200 uppercase tracking-widest">
            {t("admin.reports.filterTitle")}
          </h2>
        </div>

        {/* Filters Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          {/* Quick Date Range */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.period")}</label>
            <select
              value={quickRange}
              onChange={(e) => handleQuickRangeChange(e.target.value)}
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/30"
            >
              <option value="today">{locale === "vi" ? "Hôm nay" : "Today"}</option>
              <option value="yesterday">{locale === "vi" ? "Hôm qua" : "Yesterday"}</option>
              <option value="this-week">{locale === "vi" ? "Tuần này" : "This Week"}</option>
              <option value="last-week">{locale === "vi" ? "Tuần trước" : "Last Week"}</option>
              <option value="this-month">{locale === "vi" ? "Tháng này" : "This Month"}</option>
              <option value="last-month">{locale === "vi" ? "Tháng trước" : "Last Month"}</option>
              <option value="custom">{locale === "vi" ? "Tùy chọn ngày" : "Custom Dates"}</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.fromDate")}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                setQuickRange("custom");
                setFilters(f => ({ ...f, startDate: val }));
              }}
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.toDate")}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                const val = e.target.value;
                setEndDate(val);
                setQuickRange("custom");
                setFilters(f => ({ ...f, endDate: val }));
              }}
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800"
            />
          </div>

          {/* Store Filter (Admin only) */}
          {isAdmin ? (
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.store")}</label>
              <select
                value={selectedStoreId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStoreId(val);
                  setFilters(f => ({ ...f, storeId: val }));
                }}
                className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800"
              >
                <option value="">{locale === "vi" ? "Tất cả chi nhánh" : "All Branches"}</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.store")}</label>
              <input
                type="text"
                disabled
                value={locale === "vi" ? "Cố định cửa hàng quản lý" : "Fixed branch store"}
                className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 px-3 text-xs font-bold text-zinc-400 cursor-not-allowed outline-none"
              />
            </div>
          )}

          {/* Payment Method */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.paymentMethod")}</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                const val = e.target.value;
                setPaymentMethod(val);
                setFilters(f => ({ ...f, paymentMethod: val }));
              }}
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800"
            >
              <option value="">{locale === "vi" ? "Tất cả phương thức" : "All Methods"}</option>
              <option value="cod">{locale === "vi" ? "Tiền mặt (COD)" : "Cash (COD)"}</option>
              <option value="banking">{locale === "vi" ? "Chuyển khoản (VNPAY)" : "Transfer (VNPAY)"}</option>
              <option value="momo">{locale === "vi" ? "Ví MoMo" : "MoMo E-Wallet"}</option>
            </select>
          </div>

          {/* Order Status */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.orderStatus")}</label>
            <select
              value={orderStatus}
              onChange={(e) => {
                const val = e.target.value;
                setOrderStatus(val);
                setFilters(f => ({ ...f, orderStatus: val }));
              }}
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800"
            >
              <option value="">{locale === "vi" ? "Tất cả trạng thái" : "All Statuses"}</option>
              <option value="pending">{locale === "vi" ? "Chờ xử lý" : "Pending"}</option>
              <option value="preparing">{locale === "vi" ? "Đang chế biến" : "Preparing"}</option>
              <option value="ready">{locale === "vi" ? "Sẵn sàng" : "Ready"}</option>
              <option value="completed">{locale === "vi" ? "Hoàn thành" : "Completed"}</option>
              <option value="cancelled">{locale === "vi" ? "Đã hủy" : "Cancelled"}</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div className="flex flex-col gap-1 text-left sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-555">{t("admin.reports.searchKeyword")}</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  const val = e.target.value;
                  setKeyword(val);
                  setFilters(f => ({ ...f, keyword: val }));
                }}
                placeholder={t("admin.reports.searchKeywordPlaceholder")}
                className="h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-800"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Buttons Area */}
          <div className="flex items-end gap-2 sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-1 animate-fade-in">
            <Button
              type="button"
              onClick={handleResetFilters}
              className="h-10 flex-1 border border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-950/20 text-zinc-500 text-xs font-bold rounded-lg cursor-pointer bg-transparent"
            >
              {t("admin.reports.btnReset")}
            </Button>
            <Button
              type="button"
              onClick={handleApplyFilters}
              className="h-10 flex-1 bg-amber-850 hover:bg-amber-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
            >
              <Search className="h-3.5 w-3.5" />
              {t("admin.reports.btnFilter")}
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* TABS SELECTION */}
      {/* ---------------------------------------------------------------- */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 select-none no-print">
        <nav className="flex space-x-2 -mb-px overflow-x-auto scrollbar-hide py-1">
          {[
            { id: "revenue", label: t("admin.reports.tabRevenue") },
            { id: "orders", label: t("admin.reports.tabOrders") },
            { id: "inventory", label: t("admin.reports.tabInventory") },
            { id: "payment", label: t("admin.reports.tabPayment") },
            { id: "goods-receipt", label: t("admin.reports.tabGoodsReceipt") },
            { id: "consumption", label: t("admin.reports.tabConsumption") },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "border-amber-800 text-amber-800 dark:border-amber-500 dark:text-amber-500 font-extrabold"
                    : "border-transparent text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 hover:border-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SUB-VIEWS LAYOUT */}
      {/* ---------------------------------------------------------------- */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center select-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
          <Activity className="h-10 w-10 animate-spin text-amber-800" />
          <p className="text-xs font-bold text-zinc-500 mt-4">{t("admin.reports.loadingData")}</p>
        </div>
      ) : (
        hasHydrated && (
          <div id="report-print-area" className="space-y-6 animate-fade-in">
            
            {/* ======================================================== */}
            {/* 1. REVENUE REPORT */}
            {/* ======================================================== */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <StatsCard title={t("admin.reports.revenue.totalRevenue")} value={formatPrice(revenueMetrics.revenue)} icon={DollarSign} />
                  <StatsCard title={t("admin.reports.revenue.totalOrders")} value={revenueMetrics.orders} icon={ShoppingBag} />
                  <StatsCard title={t("admin.reports.revenue.avgOrderValue")} value={formatPrice(revenueMetrics.average)} icon={TrendingUp} />
                  <StatsCard title={t("admin.reports.revenue.completedOrders")} value={revenueMetrics.completed} icon={CheckCircle} />
                  <StatsCard title={t("admin.reports.revenue.cancelledOrders")} value={revenueMetrics.cancelled} icon={AlertTriangle} />
                  <StatsCard title={t("admin.reports.revenue.refundAmount")} value={formatPrice(revenueMetrics.refund)} icon={Activity} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 no-print">
                  <ChartCard title={t("admin.reports.revenue.chartTitle")} description={t("admin.reports.revenue.chartSub")}>
                    {revenueTrendData.length === 1 && revenueTrendData[0].label === "No Data" ? (
                      <EmptyState />
                    ) : (
                      <LineChart data={revenueTrendData} height={260} />
                    )}
                  </ChartCard>
                </div>

                {/* Table section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 select-none no-print">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t("admin.reports.revenue.tableTitle")}</h3>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase">
                      {t("admin.reports.revenue.tableSub", { count: revenueTableData.length })}
                    </span>
                  </div>
                  {revenueTableData.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider">
                            <th className="pb-3.5 px-2">{t("admin.reports.revenue.colDate")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.revenue.colStore")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.revenue.colRevenue")}</th>
                            <th className="pb-3.5 px-2 text-center">{t("admin.reports.revenue.colOrders")}</th>
                            <th className="pb-3.5 px-2 text-center">{t("admin.reports.revenue.colCompleted")}</th>
                            <th className="pb-3.5 px-2 text-center">{t("admin.reports.revenue.colCancelled")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.revenue.colAvgValue")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueTableData.map((item, idx) => (
                            <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">{item.date}</td>
                              <td className="py-3 px-2 font-semibold text-zinc-650 dark:text-zinc-350">{item.storeName}</td>
                              <td className="py-3 px-2 text-right font-black text-emerald-700 dark:text-emerald-500">{formatPrice(item.revenue)}</td>
                              <td className="py-3 px-2 text-center font-bold text-zinc-800 dark:text-zinc-200">{item.orders}</td>
                              <td className="py-3 px-2 text-center font-bold text-emerald-800 dark:text-emerald-600 bg-emerald-50/45 dark:bg-emerald-950/5 rounded-md my-1">{item.completed}</td>
                              <td className="py-3 px-2 text-center font-bold text-rose-800 dark:text-rose-600 bg-rose-50/45 dark:bg-rose-950/5 rounded-md my-1">{item.cancelled}</td>
                              <td className="py-3 px-2 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                                {formatPrice(item.completed > 0 ? item.revenue / item.completed : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. ORDERS REPORT */}
            {/* ======================================================== */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatsCard title={t("admin.reports.orders.totalOrders")} value={ordersMetrics.total} icon={ShoppingBag} />
                  <StatsCard title={t("admin.reports.orders.completed")} value={ordersMetrics.completed} icon={CheckCircle} className="border-emerald-250 dark:border-emerald-900/50" />
                  <StatsCard title={t("admin.reports.orders.preparing")} value={ordersMetrics.preparing} icon={Activity} className="border-blue-250 dark:border-blue-900/50" />
                  <StatsCard title={t("admin.reports.orders.ready")} value={ordersMetrics.ready} icon={BellRing} className="border-amber-250 dark:border-amber-900/50" />
                  <StatsCard title={t("admin.reports.orders.cancelled")} value={ordersMetrics.cancelled} icon={XCircle} className="border-rose-250 dark:border-rose-900/50" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 no-print">
                  <ChartCard title={t("admin.reports.orders.chartTitle")} description={t("admin.reports.orders.chartSub")}>
                    {ordersTrendData.length === 1 && ordersTrendData[0].label === "No Data" ? (
                      <EmptyState />
                    ) : (
                      <BarChart data={ordersTrendData} height={260} />
                    )}
                  </ChartCard>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 select-none no-print">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t("admin.reports.orders.tableTitle")}</h3>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase">
                      {t("admin.reports.orders.tableSub", { count: filteredOrders.length })}
                    </span>
                  </div>
                  {filteredOrders.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider">
                            <th className="pb-3.5 px-2">{t("admin.reports.orders.colCode")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.orders.colCustomer")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.orders.colTime")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.orders.colStore")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.orders.colAmount")}</th>
                            <th className="pb-3.5 px-2 text-center">{t("admin.reports.orders.colStatus")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.orders.colPayment")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((o) => (
                            <tr key={o.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">{o.orderCode}</td>
                              <td className="py-3 px-2 font-semibold text-zinc-700 dark:text-zinc-300">
                                {o.receiverName || "Khách lẻ (Walk-in)"}
                              </td>
                              <td className="py-3 px-2 text-zinc-500">
                                {o.createdAt ? o.createdAt.replace("T", " ").substring(0, 16) : ""}
                              </td>
                              <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">{o.storeName}</td>
                              <td className="py-3 px-2 text-right font-black text-amber-900 dark:text-amber-500">{formatPrice(o.totalAmount || 0)}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                  (o.status || "").toUpperCase() === "COMPLETED" 
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                    : (o.status || "").toUpperCase() === "CANCELLED"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-zinc-50 text-zinc-650 border-zinc-200"
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 uppercase font-bold text-zinc-500 text-[10px]">{o.paymentMethod || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. INVENTORY REPORT */}
            {/* ======================================================== */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title={t("admin.reports.inventory.opening")} value={formatNumber(inventoryMetrics.opening)} icon={Package} />
                  <StatsCard title={t("admin.reports.inventory.current")} value={formatNumber(inventoryMetrics.current)} icon={CheckCircle} />
                  <StatsCard title={t("admin.reports.inventory.adjustment")} value={inventoryMetrics.adjustment} icon={Activity} />
                  <StatsCard title={t("admin.reports.inventory.lowStock")} value={inventoryMetrics.lowStock} icon={AlertTriangle} className="border-rose-250 dark:border-rose-900/50" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 no-print">
                  <ChartCard title={t("admin.reports.inventory.chartTitle")} description={t("admin.reports.inventory.chartSub")}>
                    {inventoryTrendData.length === 1 && inventoryTrendData[0].label === "No Data" ? (
                      <EmptyState />
                    ) : (
                      <BarChart data={inventoryTrendData} height={260} />
                    )}
                  </ChartCard>
                </div>

                {/* Inventory Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 select-none no-print">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t("admin.reports.inventory.tableTitle")}</h3>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase">
                      {t("admin.reports.inventory.tableSub", { count: inventoryTableData.length })}
                    </span>
                  </div>
                  {inventoryTableData.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider">
                            <th className="pb-3.5 px-2">{t("admin.reports.inventory.colIngredient")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.inventory.colOpening")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.inventory.colIn")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.inventory.colOut")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.inventory.colAdjustment")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.inventory.colClosing")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.inventory.colUnit")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryTableData.map((item) => (
                            <tr key={`${item.ingredientId}`} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="py-3 px-2 min-w-[120px]">
                                <p className="font-bold text-zinc-800 dark:text-zinc-200">{item.ingredientName}</p>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-555 font-bold">{item.ingredientCode}</p>
                              </td>
                              <td className="py-3 px-2 text-right font-semibold text-zinc-650 dark:text-zinc-350">{formatNumber(item.opening)}</td>
                              <td className="py-3 px-2 text-right font-bold text-emerald-800 dark:text-emerald-500">+{formatNumber(item.inQty)}</td>
                              <td className="py-3 px-2 text-right font-bold text-rose-800 dark:text-rose-500">-{formatNumber(item.outQty)}</td>
                              <td className="py-3 px-2 text-right font-semibold text-zinc-500">
                                {item.adjustment > 0 ? `+${formatNumber(item.adjustment)}` : formatNumber(item.adjustment)}
                              </td>
                              <td className="py-3 px-2 text-right font-black text-amber-900 dark:text-amber-500">{formatNumber(item.closing)}</td>
                              <td className="py-3 px-2 font-medium text-zinc-400 select-none">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. PAYMENT METHODS REPORT */}
            {/* ======================================================== */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title={t("admin.reports.payment.cash")} value={formatPrice(paymentMetrics.cash)} icon={DollarSign} />
                  <StatsCard title={t("admin.reports.payment.banking")} value={formatPrice(paymentMetrics.banking)} icon={CreditCard} />
                  <StatsCard title={t("admin.reports.payment.momo")} value={formatPrice(paymentMetrics.momo)} icon={Activity} />
                  <StatsCard title={t("admin.reports.payment.refund")} value={formatPrice(paymentMetrics.refund)} icon={AlertTriangle} />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="no-print">
                    <ChartCard title={t("admin.reports.payment.chartTitle")} description={t("admin.reports.payment.chartSub")}>
                      {paymentTrendData.length === 0 ? (
                        <EmptyState />
                      ) : (
                        <PieChart data={paymentTrendData} height={260} />
                      )}
                    </ChartCard>
                  </div>

                  {/* Payment Breakdown Table */}
                  <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
                    <div className="flex items-center justify-between pb-4 select-none no-print">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t("admin.reports.payment.tableTitle")}</h3>
                    </div>
                    {paymentTableData.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider">
                            <th className="pb-3.5 px-2">{t("admin.reports.payment.colMethod")}</th>
                            <th className="pb-3.5 px-2 text-center">{t("admin.reports.payment.colCount")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.payment.colRevenue")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.payment.colPercentage")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentTableData.map((item, idx) => {
                            const pct = paymentMetrics.total > 0 ? (item.revenue / paymentMetrics.total) * 100 : 0;
                            return (
                              <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                                <td className="py-3 px-2 font-bold text-zinc-850 dark:text-zinc-100">{item.paymentMethod}</td>
                                <td className="py-3 px-2 text-center font-bold text-zinc-800 dark:text-zinc-200">{item.orderCount}</td>
                                <td className="py-3 px-2 text-right font-black text-amber-900 dark:text-amber-500">{formatPrice(item.revenue)}</td>
                                <td className="py-3 px-2 text-right font-extrabold text-emerald-800 dark:text-emerald-500">{pct.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. GOODS RECEIPT REPORT */}
            {/* ======================================================== */}
            {activeTab === "goods-receipt" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title={t("admin.reports.goodsReceipt.todayReceipts")} value={goodsReceiptMetrics.today} icon={FileText} />
                  <StatsCard title={t("admin.reports.goodsReceipt.totalReceipts")} value={goodsReceiptMetrics.total} icon={Package} />
                  <StatsCard title={t("admin.reports.goodsReceipt.suppliers")} value={goodsReceiptMetrics.suppliers} icon={Activity} />
                  <StatsCard title={t("admin.reports.goodsReceipt.value")} value={formatPrice(goodsReceiptMetrics.value)} icon={DollarSign} />
                </div>

                {/* Receipts Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 select-none no-print">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t("admin.reports.goodsReceipt.tableTitle")}</h3>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase">
                      {t("admin.reports.goodsReceipt.tableSub", { count: filteredReceipts.length })}
                    </span>
                  </div>
                  {filteredReceipts.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider">
                            <th className="pb-3.5 px-2">{t("admin.reports.goodsReceipt.colCode")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.goodsReceipt.colSupplier")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.goodsReceipt.colStore")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.goodsReceipt.colCreatedBy")}</th>
                            <th className="pb-3.5 px-2 text-center">{t("admin.reports.goodsReceipt.colStatus")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.goodsReceipt.colAmount")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReceipts.map((r) => (
                            <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">{r.receiptCode}</td>
                              <td className="py-3 px-2 font-semibold text-zinc-700 dark:text-zinc-300">{r.supplierName}</td>
                              <td className="py-3 px-2 text-zinc-500">{r.storeName}</td>
                              <td className="py-3 px-2 text-zinc-650 dark:text-zinc-450">{r.createdByName}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                  (r.status || "").toUpperCase() === "COMPLETED" 
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                    : "bg-zinc-50 text-zinc-650 border-zinc-200"
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right font-black text-amber-900 dark:text-amber-500">{formatPrice(r.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. INGREDIENT CONSUMPTION REPORT */}
            {/* ======================================================== */}
            {activeTab === "consumption" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatsCard title={t("admin.reports.consumption.total")} value={formatNumber(consumptionMetrics.total)} icon={Package} />
                  <StatsCard title={t("admin.reports.consumption.lowStock")} value={consumptionMetrics.lowStock} icon={AlertTriangle} className="border-rose-250 dark:border-rose-900/50" />
                  <StatsCard title={t("admin.reports.consumption.waste")} value={formatNumber(consumptionMetrics.waste)} icon={Activity} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 no-print">
                  <ChartCard title={t("admin.reports.consumption.chartTitle")} description={t("admin.reports.consumption.chartSub")}>
                    {consumptionTrendData.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <div className="pt-4">
                        <HorizontalBarChart data={consumptionTrendData} />
                      </div>
                    )}
                  </ChartCard>
                </div>

                {/* Consumption Details Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 select-none no-print">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t("admin.reports.consumption.tableTitle")}</h3>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase">
                      {t("admin.reports.consumption.tableSub", { count: consumptionTableData.length })}
                    </span>
                  </div>
                  {consumptionTableData.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider">
                            <th className="pb-3.5 px-2">{t("admin.reports.consumption.colIngredient")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.consumption.colConsumed")}</th>
                            <th className="pb-3.5 px-2 text-right">{t("admin.reports.consumption.colStock")}</th>
                            <th className="pb-3.5 px-2">{t("admin.reports.consumption.colUnit")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consumptionTableData.map((item, idx) => (
                            <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">{item.ingredientName}</td>
                              <td className="py-3 px-2 text-right font-black text-amber-900 dark:text-amber-500">{formatNumber(item.quantity)}</td>
                              <td className="py-3 px-2 text-right font-bold text-zinc-650 dark:text-zinc-350">{formatNumber(item.currentStock)}</td>
                              <td className="py-3 px-2 font-medium text-zinc-400">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )
      )}
    </div>
  );
}

// --- Empty State Component ---
function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 select-none">
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

// Helper to format values for locale displays
function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}
