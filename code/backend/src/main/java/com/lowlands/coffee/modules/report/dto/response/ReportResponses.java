package com.lowlands.coffee.modules.report.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ReportResponses {

    private ReportResponses() {
    }

    public record MetricResponse(String key, String label, BigDecimal amount, Long count) {
    }

    public record ChartPointResponse(String label, BigDecimal value, BigDecimal secondaryValue) {
    }

    public record RevenueRowResponse(
            LocalDate date,
            Long storeId,
            String storeName,
            BigDecimal revenue,
            long orders,
            long completed,
            long cancelled,
            BigDecimal averageOrderValue
    ) {
    }

    public record RevenueReportResponse(
            List<MetricResponse> summary,
            List<ChartPointResponse> chart,
            List<RevenueRowResponse> rows
    ) {
    }

    public record OrderRowResponse(
            Long orderId,
            String orderCode,
            String customerName,
            LocalDateTime createdAt,
            Long storeId,
            String storeName,
            BigDecimal amount,
            String status,
            String paymentMethod,
            String paymentStatus
    ) {
    }

    public record OrderReportResponse(
            List<MetricResponse> summary,
            List<ChartPointResponse> chart,
            List<OrderRowResponse> rows
    ) {
    }

    public record PaymentRowResponse(
            String paymentMethod,
            String paymentStatus,
            long orderCount,
            BigDecimal amount,
            BigDecimal revenue,
            BigDecimal percentage
    ) {
    }

    public record PaymentReportResponse(
            List<MetricResponse> summary,
            List<ChartPointResponse> chart,
            List<PaymentRowResponse> rows
    ) {
    }

    public record InventoryRowResponse(
            Long storeId,
            String storeName,
            Long ingredientId,
            String ingredientCode,
            String ingredientName,
            BigDecimal opening,
            BigDecimal inQuantity,
            BigDecimal outQuantity,
            BigDecimal adjustment,
            BigDecimal closing,
            BigDecimal minStock,
            String unit
    ) {
    }

    public record InventoryReportResponse(
            List<MetricResponse> summary,
            List<ChartPointResponse> chart,
            List<InventoryRowResponse> rows
    ) {
    }

    public record GoodsReceiptRowResponse(
            Long id,
            String receiptCode,
            Long supplierId,
            String supplierName,
            Long storeId,
            String storeName,
            String createdByName,
            String status,
            BigDecimal amount,
            LocalDateTime createdAt
    ) {
    }

    public record GoodsReceiptReportResponse(
            List<MetricResponse> summary,
            List<ChartPointResponse> chart,
            List<GoodsReceiptRowResponse> rows
    ) {
    }

    public record IngredientConsumptionRowResponse(
            Long ingredientId,
            String ingredientCode,
            String ingredientName,
            BigDecimal consumed,
            BigDecimal currentStock,
            String unit
    ) {
    }

    public record IngredientConsumptionReportResponse(
            List<MetricResponse> summary,
            List<ChartPointResponse> chart,
            List<IngredientConsumptionRowResponse> rows
    ) {
    }
}
