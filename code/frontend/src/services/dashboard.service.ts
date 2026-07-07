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
  completedOrders?: number;
  cancelledOrders?: number;
  lowStockCount?: number;
  paymentBreakdown?: DashboardPaymentBreakdown[];
  topProducts?: DashboardTopProduct[];
  topCategories?: DashboardTopCategory[];
  storeRanking?: DashboardStoreRanking[];
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
  completedOrders: number;
  activeStaff: number;
  staffCount?: number;
  todayGoodsReceipts: number;
  todayStockAdjustments?: number;
  yesterdayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  topProducts?: DashboardTopProduct[];
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

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<AdminDashboardSummary>>("/admin/dashboard/summary");
  return response.data.data;
};

export const getManagerDashboardSummary = async (): Promise<ManagerDashboardSummary> => {
  const response = await axiosInstance.get<ApiResponse<ManagerDashboardSummary>>("/manager/dashboard/summary");
  return response.data.data;
};
