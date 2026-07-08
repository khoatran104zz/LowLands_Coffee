package com.lowlands.coffee.modules.report.service.impl;

import com.lowlands.coffee.modules.report.dto.response.ReportResponses.ChartPointResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.MetricResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentDetailRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueRowResponse;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.ChartRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.GoodsReceiptSummaryRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.IngredientStockRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.InventoryAggregateRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.OrderSummaryRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.PaymentGroupRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.PaymentSummaryRow;
import com.lowlands.coffee.modules.report.repository.ReportQueryRepository.RevenueSummaryRow;
import com.lowlands.coffee.modules.report.service.ReportService;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final ReportQueryRepository reportQueryRepository;
    private final ManagerStoreContextService managerStoreContextService;

    public ReportServiceImpl(
            ReportQueryRepository reportQueryRepository,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.reportQueryRepository = reportQueryRepository;
        this.managerStoreContextService = managerStoreContextService;
    }

    @Override
    public RevenueReportResponse getAdminRevenueReport(LocalDate fromDate, LocalDate toDate, Long storeId) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildRevenueReport(window, storeId);
    }

    @Override
    public RevenueReportResponse getManagerRevenueReport(LocalDate fromDate, LocalDate toDate) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildRevenueReport(window, currentManagerStoreId());
    }

    @Override
    public OrderReportResponse getAdminOrderReport(LocalDate fromDate, LocalDate toDate, Long storeId, String orderStatus, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildOrderReport(window, storeId, orderStatus, keyword);
    }

    @Override
    public OrderReportResponse getManagerOrderReport(LocalDate fromDate, LocalDate toDate, String orderStatus, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildOrderReport(window, currentManagerStoreId(), orderStatus, keyword);
    }

    @Override
    public PaymentReportResponse getAdminPaymentReport(LocalDate fromDate, LocalDate toDate, Long storeId, String paymentMethod) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildPaymentReport(window, storeId, paymentMethod);
    }

    @Override
    public PaymentReportResponse getManagerPaymentReport(LocalDate fromDate, LocalDate toDate, String paymentMethod) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildPaymentReport(window, currentManagerStoreId(), paymentMethod);
    }

    @Override
    public InventoryReportResponse getAdminInventoryReport(LocalDate fromDate, LocalDate toDate, Long storeId, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildInventoryReport(window, storeId, keyword);
    }

    @Override
    public InventoryReportResponse getManagerInventoryReport(LocalDate fromDate, LocalDate toDate, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildInventoryReport(window, currentManagerStoreId(), keyword);
    }

    @Override
    public GoodsReceiptReportResponse getAdminGoodsReceiptReport(LocalDate fromDate, LocalDate toDate, Long storeId, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildGoodsReceiptReport(window, storeId, keyword);
    }

    @Override
    public GoodsReceiptReportResponse getManagerGoodsReceiptReport(LocalDate fromDate, LocalDate toDate, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildGoodsReceiptReport(window, currentManagerStoreId(), keyword);
    }

    @Override
    public IngredientConsumptionReportResponse getAdminIngredientConsumptionReport(LocalDate fromDate, LocalDate toDate, Long storeId, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildIngredientConsumptionReport(window, storeId, keyword);
    }

    @Override
    public IngredientConsumptionReportResponse getManagerIngredientConsumptionReport(LocalDate fromDate, LocalDate toDate, String keyword) {
        DateWindow window = resolveWindow(fromDate, toDate);
        return buildIngredientConsumptionReport(window, currentManagerStoreId(), keyword);
    }

    private RevenueReportResponse buildRevenueReport(DateWindow window, Long storeId) {
        RevenueSummaryRow summary = reportQueryRepository.findRevenueSummary(window.start(), window.end(), storeId);
        BigDecimal revenue = summary.revenue();
        long paidCompletedCount = summary.paidCompletedOrders();
        BigDecimal average = paidCompletedCount == 0 ? ZERO : revenue.divide(BigDecimal.valueOf(paidCompletedCount), 2, RoundingMode.HALF_UP);

        List<RevenueRowResponse> rows = reportQueryRepository.findRevenueRows(window.start(), window.end(), storeId).stream()
                .map(row -> new RevenueRowResponse(
                        row.date(),
                        row.storeId(),
                        row.storeName(),
                        row.revenue(),
                        row.orders(),
                        row.completed(),
                        row.cancelled(),
                        row.completed() == 0 ? ZERO : row.revenue().divide(BigDecimal.valueOf(row.completed()), 2, RoundingMode.HALF_UP)
                ))
                .toList();

        return new RevenueReportResponse(
                List.of(
                        metricAmount("revenue", "Revenue", revenue),
                        metricCount("orders", "Orders", summary.totalOrders()),
                        metricAmount("average", "Average order value", average),
                        metricCount("completed", "Completed orders", summary.completedOrders()),
                        metricCount("cancelled", "Cancelled orders", summary.cancelledOrders()),
                        metricAmount("refund", "Refund amount", ZERO)
                ),
                toChartResponses(reportQueryRepository.findRevenueChart(window.start(), window.end(), storeId)),
                rows
        );
    }

    private OrderReportResponse buildOrderReport(DateWindow window, Long storeId, String orderStatus, String keyword) {
        OrderSummaryRow summary = reportQueryRepository.findOrderSummary(window.start(), window.end(), storeId, orderStatus, keyword);

        List<OrderRowResponse> rows = reportQueryRepository.findOrderRows(window.start(), window.end(), storeId, orderStatus, keyword).stream()
                .map(order -> new OrderRowResponse(
                        order.orderId(),
                        order.orderCode(),
                        order.customerName(),
                        order.createdAt(),
                        order.storeId(),
                        order.storeName(),
                        order.amount(),
                        order.status(),
                        order.paymentMethod(),
                        order.paymentStatus(),
                        order.completedAt()
                ))
                .toList();

        return new OrderReportResponse(
                List.of(
                        metricCount("total", "Total orders", summary.total()),
                        metricCount("completed", "Completed", summary.completed()),
                        metricCount("preparing", "Preparing", summary.preparing()),
                        metricCount("ready", "Ready", summary.ready()),
                        metricCount("cancelled", "Cancelled", summary.cancelled())
                ),
                toChartResponses(reportQueryRepository.findOrderChart(window.start(), window.end(), storeId, orderStatus, keyword)),
                rows
        );
    }

    private PaymentReportResponse buildPaymentReport(DateWindow window, Long storeId, String paymentMethod) {
        PaymentSummaryRow summary = reportQueryRepository.findPaymentSummary(window.start(), window.end(), storeId, paymentMethod);
        BigDecimal totalRevenue = summary.paidRevenue();
        List<PaymentRowResponse> rows = reportQueryRepository.findPaymentRows(window.start(), window.end(), storeId, paymentMethod).stream()
                .map(row -> new PaymentRowResponse(
                        row.paymentMethod(),
                        row.paymentStatus(),
                        row.orderCount(),
                        row.amount(),
                        row.revenue(),
                        totalRevenue.compareTo(ZERO) == 0 ? ZERO : row.revenue().multiply(BigDecimal.valueOf(100)).divide(totalRevenue, 2, RoundingMode.HALF_UP)
                ))
                .toList();

        return new PaymentReportResponse(
                List.of(
                        metricAmount("paidRevenue", "Paid completed revenue", summary.paidRevenue()),
                        metricCount("paidCompletedOrders", "Paid completed orders", summary.paidCompletedOrders()),
                        metricCount("unpaid", "Unpaid", summary.unpaid()),
                        metricCount("failed", "Failed", summary.failed()),
                        metricCount("refunded", "Refunded", summary.refunded())
                ),
                rows.stream().map(row -> new ChartPointResponse(row.paymentMethod() + " " + row.paymentStatus(), row.revenue(), null)).toList(),
                rows,
                reportQueryRepository.findPaymentDetailRows(window.start(), window.end(), storeId, paymentMethod).stream()
                        .map(row -> new PaymentDetailRowResponse(
                                row.paymentId(),
                                row.paymentNumber(),
                                row.orderCode(),
                                row.storeId(),
                                row.storeName(),
                                row.paymentMethod(),
                                row.paymentStatus(),
                                row.amount(),
                                row.paidAt()
                        ))
                        .toList()
        );
    }

    private InventoryReportResponse buildInventoryReport(DateWindow window, Long storeId, String keyword) {
        List<InventoryRowResponse> rows = reportQueryRepository.findInventoryRows(window.start(), window.end(), storeId, keyword).stream()
                .map(this::toInventoryRow)
                .toList();

        BigDecimal openingTotal = rows.stream().map(InventoryRowResponse::opening).reduce(ZERO, BigDecimal::add);
        BigDecimal currentTotal = rows.stream().map(InventoryRowResponse::closing).reduce(ZERO, BigDecimal::add);
        long adjustmentCount = reportQueryRepository.countInventoryAdjustments(window.start(), window.end(), storeId, keyword);
        long lowStock = rows.stream().filter(row -> row.closing().compareTo(row.minStock()) <= 0).count();

        return new InventoryReportResponse(
                List.of(
                        metricAmount("opening", "Opening stock", openingTotal),
                        metricAmount("current", "Current stock", currentTotal),
                        metricCount("adjustment", "Adjustments", adjustmentCount),
                        metricCount("lowStock", "Low stock", lowStock)
                ),
                toChartResponses(reportQueryRepository.findInventoryChart(window.start(), window.end(), storeId, keyword)),
                rows
        );
    }

    private GoodsReceiptReportResponse buildGoodsReceiptReport(DateWindow window, Long storeId, String keyword) {
        GoodsReceiptSummaryRow summary = reportQueryRepository.findGoodsReceiptSummary(window.start(), window.end(), storeId, keyword);
        List<GoodsReceiptRowResponse> rows = reportQueryRepository.findGoodsReceiptRows(window.start(), window.end(), storeId, keyword).stream()
                .map(receipt -> new GoodsReceiptRowResponse(
                        receipt.id(),
                        receipt.receiptCode(),
                        receipt.supplierId(),
                        receipt.supplierName(),
                        receipt.storeId(),
                        receipt.storeName(),
                        receipt.createdByName(),
                        receipt.status(),
                        receipt.amount(),
                        receipt.createdAt(),
                        receipt.totalItems()
                ))
                .toList();

        return new GoodsReceiptReportResponse(
                List.of(
                        metricCount("total", "Total receipts", summary.total()),
                        metricCount("completed", "Completed receipts", summary.completed()),
                        metricCount("suppliers", "Suppliers", summary.suppliers()),
                        metricAmount("value", "Completed value", summary.completedValue())
                ),
                toChartResponses(reportQueryRepository.findGoodsReceiptChart(window.start(), window.end(), storeId, keyword)),
                rows
        );
    }

    private IngredientConsumptionReportResponse buildIngredientConsumptionReport(DateWindow window, Long storeId, String keyword) {
        Map<Long, BigDecimal> currentStockByIngredient = currentStockByIngredient(storeId);
        List<IngredientConsumptionRowResponse> rows = reportQueryRepository.findIngredientConsumptionRows(window.start(), window.end(), storeId, keyword).stream()
                .map(accumulator -> new IngredientConsumptionRowResponse(
                        accumulator.ingredientId(),
                        accumulator.ingredientCode(),
                        accumulator.ingredientName(),
                        accumulator.consumed(),
                        currentStockByIngredient.getOrDefault(accumulator.ingredientId(), ZERO),
                        accumulator.unit()
                ))
                .toList();

        BigDecimal totalConsumed = rows.stream().map(IngredientConsumptionRowResponse::consumed).reduce(ZERO, BigDecimal::add);
        long lowStock = reportQueryRepository.findInventoryRows(window.start(), window.end(), storeId, null).stream()
                .filter(row -> row.closing().compareTo(row.minStock()) <= 0)
                .count();

        return new IngredientConsumptionReportResponse(
                List.of(
                        metricAmount("total", "Total consumed", totalConsumed),
                        metricCount("ingredients", "Ingredients", (long) rows.size()),
                        metricCount("lowStock", "Low stock", lowStock)
                ),
                rows.stream().limit(10).map(row -> new ChartPointResponse(row.ingredientName(), row.consumed(), null)).toList(),
                rows
        );
    }

    private Map<Long, BigDecimal> currentStockByIngredient(Long storeId) {
        Map<Long, BigDecimal> result = new LinkedHashMap<>();
        for (IngredientStockRow stock : reportQueryRepository.findCurrentStockByIngredient(storeId)) {
            result.merge(stock.ingredientId(), stock.currentStock(), BigDecimal::add);
        }
        return result;
    }

    private MetricResponse metricAmount(String key, String label, BigDecimal amount) {
        return new MetricResponse(key, label, amount, null);
    }

    private MetricResponse metricCount(String key, String label, long count) {
        return new MetricResponse(key, label, null, count);
    }

    private Long currentManagerStoreId() {
        return managerStoreContextService.getCurrentManagerStore().getId();
    }

    private InventoryRowResponse toInventoryRow(InventoryAggregateRow row) {
        BigDecimal opening = row.closing().subtract(row.inQuantity()).add(row.outQuantity()).subtract(row.adjustment());
        return new InventoryRowResponse(
                row.storeId(),
                row.storeName(),
                row.ingredientId(),
                row.ingredientCode(),
                row.ingredientName(),
                opening,
                row.inQuantity(),
                row.outQuantity(),
                row.adjustment(),
                row.closing(),
                row.minStock(),
                row.unit()
        );
    }

    private List<ChartPointResponse> toChartResponses(List<ChartRow> rows) {
        return rows.stream()
                .map(row -> new ChartPointResponse(row.label(), row.value(), row.secondaryValue()))
                .toList();
    }

    private DateWindow resolveWindow(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        LocalDate resolvedFrom = fromDate == null ? today.withDayOfMonth(1) : fromDate;
        LocalDate resolvedTo = toDate == null ? today : toDate;
        if (resolvedTo.isBefore(resolvedFrom)) {
            resolvedTo = resolvedFrom;
        }
        return new DateWindow(resolvedFrom.atStartOfDay(), resolvedTo.atTime(LocalTime.MAX).plusNanos(1));
    }

    private record DateWindow(LocalDateTime start, LocalDateTime end) {
    }

}
