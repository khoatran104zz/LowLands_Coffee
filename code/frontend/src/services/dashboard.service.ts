import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayRevenue?: number;
  weekRevenue?: number;
  monthRevenue?: number;
  yearRevenue?: number;
  ordersToday?: number;
  completedOrdersToday?: number;
  cancelledOrdersToday?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  lowStockCount?: number;
  paymentBreakdown?: DashboardPaymentBreakdown[];
  topProducts?: DashboardTopProduct[];
  topCategories?: DashboardTopCategory[];
  storeRanking?: DashboardStoreRanking[];
  revenueTrend?: DashboardTrendPoint[];
  orderTrend?: DashboardTrendPoint[];
  lowStockItems?: DashboardLowStockItem[];
  recentActivities?: DashboardRecentActivity[];
}

export interface ManagerDashboardSummary {
  storeId: number;
  storeName?: string;
  totalProducts: number;
  inventoryItems: number;
  lowStockItems: number;
  lowStockCount?: number;
  inventoryAlerts?: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  preparingOrders: number;
  readyOrders?: number;
  completedOrders: number;
  activeStaff: number;
  staffCount?: number;
  todayGoodsReceipts: number;
  todayStockAdjustments?: number;
  yesterdayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  topProducts?: DashboardTopProduct[];
  paymentBreakdown?: DashboardPaymentBreakdown[];
  revenueTrend?: DashboardTrendPoint[];
  orderTrend?: DashboardTrendPoint[];
  lowStockItemsList?: DashboardLowStockItem[];
  ingredientConsumption?: DashboardIngredientConsumption[];
  recentActivities?: DashboardRecentActivity[];
}

export interface DashboardPaymentBreakdown {
  paymentMethod: string;
  orderCount: number;
  revenue: number;
}

export interface DashboardTopProduct {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface DashboardTopCategory {
  categoryId: number;
  categoryName: string;
  quantity: number;
  revenue: number;
}

export interface DashboardStoreRanking {
  storeId: number;
  storeName: string;
  completedOrders: number;
  revenue: number;
}

export interface DashboardTrendPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface DashboardLowStockItem {
  storeId: number;
  storeName: string;
  ingredientId: number;
  ingredientCode: string;
  ingredientName: string;
  unit: string;
  minStock: number;
  currentStock: number;
}

export interface DashboardRecentActivity {
  type: string;
  title: string;
  description: string;
  createdAt: string;
  amount?: number | null;
  storeName?: string | null;
}

export interface DashboardIngredientConsumption {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  quantity: number;
}

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<AdminDashboardSummary>>("/admin/dashboard/summary");
  return response.data.data;
};

export const getManagerDashboardSummary = async (): Promise<ManagerDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<ManagerDashboardSummary>>("/manager/dashboard/summary");
  return response.data.data;
};
