package com.lowlands.coffee.modules.report.service;

import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;

import java.time.LocalDate;

public interface ReportService {

    RevenueReportResponse getAdminRevenueReport(LocalDate fromDate, LocalDate toDate, Long storeId);

    RevenueReportResponse getManagerRevenueReport(LocalDate fromDate, LocalDate toDate);

    OrderReportResponse getAdminOrderReport(LocalDate fromDate, LocalDate toDate, Long storeId, String orderStatus, String keyword);

    OrderReportResponse getManagerOrderReport(LocalDate fromDate, LocalDate toDate, String orderStatus, String keyword);

    PaymentReportResponse getAdminPaymentReport(LocalDate fromDate, LocalDate toDate, Long storeId, String paymentMethod);

    PaymentReportResponse getManagerPaymentReport(LocalDate fromDate, LocalDate toDate, String paymentMethod);

    InventoryReportResponse getAdminInventoryReport(LocalDate fromDate, LocalDate toDate, Long storeId, String keyword);

    InventoryReportResponse getManagerInventoryReport(LocalDate fromDate, LocalDate toDate, String keyword);

    GoodsReceiptReportResponse getAdminGoodsReceiptReport(LocalDate fromDate, LocalDate toDate, Long storeId, String keyword);

    GoodsReceiptReportResponse getManagerGoodsReceiptReport(LocalDate fromDate, LocalDate toDate, String keyword);

    IngredientConsumptionReportResponse getAdminIngredientConsumptionReport(LocalDate fromDate, LocalDate toDate, Long storeId, String keyword);

    IngredientConsumptionReportResponse getManagerIngredientConsumptionReport(LocalDate fromDate, LocalDate toDate, String keyword);
}
