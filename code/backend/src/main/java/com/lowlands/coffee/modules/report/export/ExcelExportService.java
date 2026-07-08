package com.lowlands.coffee.modules.report.export;

import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;

public interface ExcelExportService {

    ReportExcelFile exportRevenue(RevenueReportResponse report, ReportExportMetadata metadata);

    ReportExcelFile exportOrders(OrderReportResponse report, ReportExportMetadata metadata);

    ReportExcelFile exportPayments(PaymentReportResponse report, ReportExportMetadata metadata);

    ReportExcelFile exportInventory(InventoryReportResponse report, ReportExportMetadata metadata);

    ReportExcelFile exportGoodsReceipts(GoodsReceiptReportResponse report, ReportExportMetadata metadata);

    ReportExcelFile exportIngredientConsumption(IngredientConsumptionReportResponse report, ReportExportMetadata metadata);
}
