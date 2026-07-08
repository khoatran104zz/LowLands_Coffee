import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReportFilterParams {
  fromDate?: string;
  toDate?: string;
  storeId?: string;
  paymentMethod?: string;
  orderStatus?: string;
  keyword?: string;
}

export interface ReportExcelDownload {
  blob: Blob;
  filename: string;
}

export interface ReportMetric {
  key: string;
  label: string;
  amount?: number | null;
  count?: number | null;
}

export interface ReportChartPoint {
  label: string;
  value: number;
  secondaryValue?: number | null;
}

export interface RevenueReportRow {
  date: string;
  storeId: number;
  storeName: string;
  revenue: number;
  orders: number;
  completed: number;
  cancelled: number;
  averageOrderValue: number;
}

export interface RevenueReportResponse {
  summary: ReportMetric[];
  chart: ReportChartPoint[];
  rows: RevenueReportRow[];
}

export interface OrderReportRow {
  orderId: number;
  orderCode: string;
  customerName: string;
  createdAt: string;
  storeId: number;
  storeName: string;
  amount: number;
  status: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}

export interface OrderReportResponse {
  summary: ReportMetric[];
  chart: ReportChartPoint[];
  rows: OrderReportRow[];
}

export interface PaymentReportRow {
  paymentMethod: string;
  paymentStatus: string;
  orderCount: number;
  amount: number;
  revenue: number;
  percentage: number;
}

export interface PaymentReportResponse {
  summary: ReportMetric[];
  chart: ReportChartPoint[];
  rows: PaymentReportRow[];
}

export interface InventoryReportRow {
  storeId: number;
  storeName: string;
  ingredientId: number;
  ingredientCode: string;
  ingredientName: string;
  opening: number;
  inQuantity: number;
  outQuantity: number;
  adjustment: number;
  closing: number;
  minStock: number;
  unit: string;
}

export interface InventoryReportResponse {
  summary: ReportMetric[];
  chart: ReportChartPoint[];
  rows: InventoryReportRow[];
}

export interface GoodsReceiptReportRow {
  id: number;
  receiptCode: string;
  supplierId: number;
  supplierName: string;
  storeId: number;
  storeName: string;
  createdByName: string;
  status: string;
  amount: number;
  createdAt: string;
}

export interface GoodsReceiptReportResponse {
  summary: ReportMetric[];
  chart: ReportChartPoint[];
  rows: GoodsReceiptReportRow[];
}

export interface IngredientConsumptionReportRow {
  ingredientId: number;
  ingredientCode: string;
  ingredientName: string;
  consumed: number;
  currentStock: number;
  unit: string;
}

export interface IngredientConsumptionReportResponse {
  summary: ReportMetric[];
  chart: ReportChartPoint[];
  rows: IngredientConsumptionReportRow[];
}

const cleanParams = (params: ReportFilterParams): ReportFilterParams => {
  return {
    ...(params.fromDate ? { fromDate: params.fromDate } : {}),
    ...(params.toDate ? { toDate: params.toDate } : {}),
    ...(params.storeId ? { storeId: params.storeId } : {}),
    ...(params.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
    ...(params.orderStatus ? { orderStatus: params.orderStatus } : {}),
    ...(params.keyword ? { keyword: params.keyword } : {})
  };
};

const scopePrefix = (isAdmin: boolean) => (isAdmin ? "/admin/reports" : "/manager/reports");

const excelFilenameFromHeader = (contentDisposition: string | undefined): string => {
  if (!contentDisposition) {
    return "Report_Export.xlsx";
  }
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? "Report_Export.xlsx";
};

export const getRevenueReport = async (
  isAdmin: boolean,
  params: ReportFilterParams
): Promise<RevenueReportResponse> => {
  const response = await axiosInstance.get<ApiResponse<RevenueReportResponse>>(`${scopePrefix(isAdmin)}/revenue`, {
    params: cleanParams(params)
  });
  return response.data.data;
};

export const getOrderReport = async (
  isAdmin: boolean,
  params: ReportFilterParams
): Promise<OrderReportResponse> => {
  const response = await axiosInstance.get<ApiResponse<OrderReportResponse>>(`${scopePrefix(isAdmin)}/orders`, {
    params: cleanParams(params)
  });
  return response.data.data;
};

export const getPaymentReport = async (
  isAdmin: boolean,
  params: ReportFilterParams
): Promise<PaymentReportResponse> => {
  const response = await axiosInstance.get<ApiResponse<PaymentReportResponse>>(`${scopePrefix(isAdmin)}/payments`, {
    params: cleanParams(params)
  });
  return response.data.data;
};

export const getInventoryReport = async (
  isAdmin: boolean,
  params: ReportFilterParams
): Promise<InventoryReportResponse> => {
  const response = await axiosInstance.get<ApiResponse<InventoryReportResponse>>(`${scopePrefix(isAdmin)}/inventory`, {
    params: cleanParams(params)
  });
  return response.data.data;
};

export const getGoodsReceiptReport = async (
  isAdmin: boolean,
  params: ReportFilterParams
): Promise<GoodsReceiptReportResponse> => {
  const response = await axiosInstance.get<ApiResponse<GoodsReceiptReportResponse>>(`${scopePrefix(isAdmin)}/goods-receipts`, {
    params: cleanParams(params)
  });
  return response.data.data;
};

export const getIngredientConsumptionReport = async (
  isAdmin: boolean,
  params: ReportFilterParams
): Promise<IngredientConsumptionReportResponse> => {
  const response = await axiosInstance.get<ApiResponse<IngredientConsumptionReportResponse>>(
    `${scopePrefix(isAdmin)}/ingredient-consumption`,
    { params: cleanParams(params) }
  );
  return response.data.data;
};

export const exportReportExcel = async (
  isAdmin: boolean,
  reportType: string,
  params: ReportFilterParams
): Promise<ReportExcelDownload> => {
  const response = await axiosInstance.get<Blob>(`${scopePrefix(isAdmin)}/export/excel`, {
    params: {
      reportType,
      ...cleanParams(params)
    },
    responseType: "blob"
  });

  return {
    blob: response.data,
    filename: excelFilenameFromHeader(response.headers["content-disposition"])
  };
};
