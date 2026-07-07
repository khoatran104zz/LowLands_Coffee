package com.lowlands.coffee.modules.report.service.impl;

import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import com.lowlands.coffee.modules.inventory.repository.GoodsReceiptRepository;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
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
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueRowResponse;
import com.lowlands.coffee.modules.report.service.ReportService;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final OrderRepository orderRepository;
    private final StockMovementRepository stockMovementRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final ManagerStoreContextService managerStoreContextService;

    public ReportServiceImpl(
            OrderRepository orderRepository,
            StockMovementRepository stockMovementRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.orderRepository = orderRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
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
        List<OrderEntity> orders = filteredOrders(window, storeId, null, null);
        List<OrderEntity> paidCompleted = orders.stream().filter(this::isPaidCompleted).toList();
        List<OrderEntity> completed = orders.stream().filter(order -> isStatus(order, "COMPLETED")).toList();
        List<OrderEntity> cancelled = orders.stream().filter(order -> isStatus(order, "CANCELLED")).toList();

        BigDecimal revenue = sumOrders(paidCompleted);
        long paidCompletedCount = paidCompleted.size();
        BigDecimal average = paidCompletedCount == 0 ? ZERO : revenue.divide(BigDecimal.valueOf(paidCompletedCount), 2, RoundingMode.HALF_UP);

        Map<String, RevenueAccumulator> grouped = new LinkedHashMap<>();
        for (OrderEntity order : orders) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            String key = date + "|" + order.getStore().getId();
            RevenueAccumulator accumulator = grouped.computeIfAbsent(key, ignored -> new RevenueAccumulator(date, order.getStore()));
            accumulator.orders++;
            if (isStatus(order, "COMPLETED")) {
                accumulator.completed++;
            }
            if (isStatus(order, "CANCELLED")) {
                accumulator.cancelled++;
            }
            if (isPaidCompleted(order)) {
                accumulator.revenue = accumulator.revenue.add(order.getTotalAmount());
            }
        }

        List<RevenueRowResponse> rows = grouped.values().stream()
                .sorted(Comparator.comparing((RevenueAccumulator row) -> row.date).reversed().thenComparing(row -> row.storeName))
                .map(accumulator -> new RevenueRowResponse(
                        accumulator.date,
                        accumulator.storeId,
                        accumulator.storeName,
                        accumulator.revenue,
                        accumulator.orders,
                        accumulator.completed,
                        accumulator.cancelled,
                        accumulator.completed == 0 ? ZERO : accumulator.revenue.divide(BigDecimal.valueOf(accumulator.completed), 2, RoundingMode.HALF_UP)
                ))
                .toList();

        return new RevenueReportResponse(
                List.of(
                        metricAmount("revenue", "Revenue", revenue),
                        metricCount("orders", "Orders", (long) orders.size()),
                        metricAmount("average", "Average order value", average),
                        metricCount("completed", "Completed orders", (long) completed.size()),
                        metricCount("cancelled", "Cancelled orders", (long) cancelled.size()),
                        metricAmount("refund", "Refund amount", ZERO)
                ),
                buildRevenueChart(paidCompleted),
                rows
        );
    }

    private OrderReportResponse buildOrderReport(DateWindow window, Long storeId, String orderStatus, String keyword) {
        List<OrderEntity> orders = filteredOrders(window, storeId, orderStatus, keyword);
        long completed = orders.stream().filter(order -> isStatus(order, "COMPLETED")).count();
        long preparing = orders.stream().filter(order -> isStatus(order, "PREPARING")).count();
        long ready = orders.stream().filter(order -> isStatus(order, "READY")).count();
        long cancelled = orders.stream().filter(order -> isStatus(order, "CANCELLED")).count();

        List<OrderRowResponse> rows = orders.stream()
                .sorted(Comparator.comparing(OrderEntity::getCreatedAt).reversed())
                .map(order -> {
                    PaymentEntity payment = order.getPayment();
                    return new OrderRowResponse(
                            order.getId(),
                            order.getOrderCode(),
                            displayCustomer(order),
                            order.getCreatedAt(),
                            order.getStore().getId(),
                            order.getStore().getName(),
                            order.getTotalAmount(),
                            order.getStatus(),
                            payment == null ? null : payment.getPaymentMethod(),
                            payment == null ? null : payment.getPaymentStatus()
                    );
                })
                .toList();

        return new OrderReportResponse(
                List.of(
                        metricCount("total", "Total orders", (long) orders.size()),
                        metricCount("completed", "Completed", completed),
                        metricCount("preparing", "Preparing", preparing),
                        metricCount("ready", "Ready", ready),
                        metricCount("cancelled", "Cancelled", cancelled)
                ),
                buildOrderChart(orders),
                rows
        );
    }

    private PaymentReportResponse buildPaymentReport(DateWindow window, Long storeId, String paymentMethod) {
        List<OrderEntity> orders = filteredOrders(window, storeId, null, null).stream()
                .filter(order -> {
                    PaymentEntity payment = order.getPayment();
                    return payment != null && (isBlank(paymentMethod) || payment.getPaymentMethod().equalsIgnoreCase(paymentMethod));
                })
                .toList();

        Map<String, PaymentAccumulator> grouped = new LinkedHashMap<>();
        for (OrderEntity order : orders) {
            PaymentEntity payment = order.getPayment();
            String key = payment.getPaymentMethod() + "|" + payment.getPaymentStatus();
            PaymentAccumulator accumulator = grouped.computeIfAbsent(key, ignored -> new PaymentAccumulator(payment.getPaymentMethod(), payment.getPaymentStatus()));
            accumulator.orderCount++;
            accumulator.amount = accumulator.amount.add(payment.getAmount());
            if (isPaidCompleted(order)) {
                accumulator.revenue = accumulator.revenue.add(order.getTotalAmount());
            }
        }

        BigDecimal totalRevenue = grouped.values().stream()
                .map(accumulator -> accumulator.revenue)
                .reduce(ZERO, BigDecimal::add);

        List<PaymentRowResponse> rows = grouped.values().stream()
                .sorted(Comparator.comparing((PaymentAccumulator row) -> row.revenue).reversed())
                .map(accumulator -> new PaymentRowResponse(
                        accumulator.paymentMethod,
                        accumulator.paymentStatus,
                        accumulator.orderCount,
                        accumulator.amount,
                        accumulator.revenue,
                        totalRevenue.compareTo(ZERO) == 0 ? ZERO : accumulator.revenue.multiply(BigDecimal.valueOf(100)).divide(totalRevenue, 2, RoundingMode.HALF_UP)
                ))
                .toList();

        BigDecimal paidRevenue = rows.stream().map(PaymentRowResponse::revenue).reduce(ZERO, BigDecimal::add);
        long paidCompletedOrders = orders.stream().filter(this::isPaidCompleted).count();
        long unpaid = orders.stream().filter(order -> order.getPayment() != null && "UNPAID".equalsIgnoreCase(order.getPayment().getPaymentStatus())).count();
        long failed = orders.stream().filter(order -> order.getPayment() != null && "FAILED".equalsIgnoreCase(order.getPayment().getPaymentStatus())).count();
        long refunded = orders.stream().filter(order -> order.getPayment() != null && "REFUNDED".equalsIgnoreCase(order.getPayment().getPaymentStatus())).count();

        return new PaymentReportResponse(
                List.of(
                        metricAmount("paidRevenue", "Paid completed revenue", paidRevenue),
                        metricCount("paidCompletedOrders", "Paid completed orders", paidCompletedOrders),
                        metricCount("unpaid", "Unpaid", unpaid),
                        metricCount("failed", "Failed", failed),
                        metricCount("refunded", "Refunded", refunded)
                ),
                rows.stream().map(row -> new ChartPointResponse(row.paymentMethod() + " " + row.paymentStatus(), row.revenue(), null)).toList(),
                rows
        );
    }

    private InventoryReportResponse buildInventoryReport(DateWindow window, Long storeId, String keyword) {
        List<Object[]> balances = stockBalances(storeId).stream()
                .filter(balance -> keywordMatches(keyword, (String) balance[3], (String) balance[4], (String) balance[1]))
                .toList();
        List<StockMovementEntity> movements = filteredMovements(window, storeId, keyword);

        List<InventoryRowResponse> rows = balances.stream()
                .map(balance -> {
                    Long balanceStoreId = (Long) balance[0];
                    Long ingredientId = (Long) balance[2];
                    List<StockMovementEntity> scopedMovements = movements.stream()
                            .filter(movement -> movement.getStore().getId().equals(balanceStoreId))
                            .filter(movement -> movement.getIngredient().getId().equals(ingredientId))
                            .toList();
                    BigDecimal inQuantity = sumMovements(scopedMovements, "IN");
                    BigDecimal outQuantity = sumMovements(scopedMovements, "OUT");
                    BigDecimal adjustment = sumMovements(scopedMovements, "ADJUSTMENT");
                    BigDecimal closing = (BigDecimal) balance[7];
                    BigDecimal opening = closing.subtract(inQuantity).add(outQuantity).subtract(adjustment);
                    return new InventoryRowResponse(
                            balanceStoreId,
                            (String) balance[1],
                            ingredientId,
                            (String) balance[3],
                            (String) balance[4],
                            opening,
                            inQuantity,
                            outQuantity,
                            adjustment,
                            closing,
                            safeBigDecimal(balance[6]),
                            (String) balance[5]
                    );
                })
                .sorted(Comparator.comparing(InventoryRowResponse::storeName).thenComparing(InventoryRowResponse::ingredientName))
                .toList();

        BigDecimal openingTotal = rows.stream().map(InventoryRowResponse::opening).reduce(ZERO, BigDecimal::add);
        BigDecimal currentTotal = rows.stream().map(InventoryRowResponse::closing).reduce(ZERO, BigDecimal::add);
        long adjustmentCount = movements.stream().filter(movement -> "ADJUSTMENT".equalsIgnoreCase(movement.getMovementType())).count();
        long lowStock = rows.stream().filter(row -> row.closing().compareTo(row.minStock()) <= 0).count();

        return new InventoryReportResponse(
                List.of(
                        metricAmount("opening", "Opening stock", openingTotal),
                        metricAmount("current", "Current stock", currentTotal),
                        metricCount("adjustment", "Adjustments", adjustmentCount),
                        metricCount("lowStock", "Low stock", lowStock)
                ),
                buildInventoryChart(movements),
                rows
        );
    }

    private GoodsReceiptReportResponse buildGoodsReceiptReport(DateWindow window, Long storeId, String keyword) {
        List<GoodsReceiptEntity> receipts = goodsReceiptRepository.findAll().stream()
                .filter(receipt -> storeMatches(receipt.getStore().getId(), storeId))
                .filter(receipt -> inWindow(receipt.getCreatedAt(), window))
                .filter(receipt -> keywordMatches(keyword, receipt.getReceiptCode(), receipt.getSupplier().getName(), receipt.getCreatedBy().getFullName()))
                .toList();

        List<GoodsReceiptRowResponse> rows = receipts.stream()
                .sorted(Comparator.comparing(GoodsReceiptEntity::getCreatedAt).reversed())
                .map(receipt -> new GoodsReceiptRowResponse(
                        receipt.getId(),
                        receipt.getReceiptCode(),
                        receipt.getSupplier().getId(),
                        receipt.getSupplier().getName(),
                        receipt.getStore().getId(),
                        receipt.getStore().getName(),
                        receipt.getCreatedBy().getFullName(),
                        receipt.getStatus(),
                        receipt.getTotalAmount(),
                        receipt.getCreatedAt()
                ))
                .toList();

        BigDecimal completedValue = receipts.stream()
                .filter(receipt -> "COMPLETED".equalsIgnoreCase(receipt.getStatus()))
                .map(GoodsReceiptEntity::getTotalAmount)
                .reduce(ZERO, BigDecimal::add);
        long completed = receipts.stream().filter(receipt -> "COMPLETED".equalsIgnoreCase(receipt.getStatus())).count();
        long suppliers = receipts.stream().map(receipt -> receipt.getSupplier().getId()).distinct().count();

        return new GoodsReceiptReportResponse(
                List.of(
                        metricCount("total", "Total receipts", (long) receipts.size()),
                        metricCount("completed", "Completed receipts", completed),
                        metricCount("suppliers", "Suppliers", suppliers),
                        metricAmount("value", "Completed value", completedValue)
                ),
                buildGoodsReceiptChart(receipts),
                rows
        );
    }

    private IngredientConsumptionReportResponse buildIngredientConsumptionReport(DateWindow window, Long storeId, String keyword) {
        List<StockMovementEntity> movements = filteredMovements(window, storeId, keyword).stream()
                .filter(movement -> "OUT".equalsIgnoreCase(movement.getMovementType()))
                .filter(movement -> "ORDER".equalsIgnoreCase(movement.getReferenceType()))
                .toList();

        Map<Long, ConsumptionAccumulator> grouped = new LinkedHashMap<>();
        for (StockMovementEntity movement : movements) {
            ConsumptionAccumulator accumulator = grouped.computeIfAbsent(
                    movement.getIngredient().getId(),
                    ignored -> new ConsumptionAccumulator(
                            movement.getIngredient().getId(),
                            movement.getIngredient().getCode(),
                            movement.getIngredient().getName(),
                            movement.getUnit()
                    )
            );
            accumulator.consumed = accumulator.consumed.add(movement.getQuantity());
        }

        Map<Long, BigDecimal> currentStockByIngredient = currentStockByIngredient(storeId);
        List<IngredientConsumptionRowResponse> rows = grouped.values().stream()
                .sorted(Comparator.comparing((ConsumptionAccumulator row) -> row.consumed).reversed())
                .map(accumulator -> new IngredientConsumptionRowResponse(
                        accumulator.ingredientId,
                        accumulator.ingredientCode,
                        accumulator.ingredientName,
                        accumulator.consumed,
                        currentStockByIngredient.getOrDefault(accumulator.ingredientId, ZERO),
                        accumulator.unit
                ))
                .toList();

        BigDecimal totalConsumed = rows.stream().map(IngredientConsumptionRowResponse::consumed).reduce(ZERO, BigDecimal::add);
        long lowStock = stockBalances(storeId).stream()
                .filter(balance -> safeBigDecimal(balance[7]).compareTo(safeBigDecimal(balance[6])) <= 0)
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

    private List<OrderEntity> filteredOrders(DateWindow window, Long storeId, String orderStatus, String keyword) {
        return orderRepository.findAll().stream()
                .filter(order -> storeMatches(order.getStore().getId(), storeId))
                .filter(order -> inWindow(order.getCreatedAt(), window))
                .filter(order -> isBlank(orderStatus) || order.getStatus().equalsIgnoreCase(orderStatus))
                .filter(order -> keywordMatches(keyword, order.getOrderCode(), order.getReceiverName(), order.getReceiverPhone(), displayCustomer(order)))
                .toList();
    }

    private List<StockMovementEntity> filteredMovements(DateWindow window, Long storeId, String keyword) {
        return stockMovementRepository.findAll().stream()
                .filter(movement -> storeMatches(movement.getStore().getId(), storeId))
                .filter(movement -> inWindow(movement.getCreatedAt(), window))
                .filter(movement -> keywordMatches(keyword, movement.getIngredient().getCode(), movement.getIngredient().getName(), movement.getStore().getName()))
                .toList();
    }

    private List<Object[]> stockBalances(Long storeId) {
        if (storeId == null) {
            return stockMovementRepository.calculateAllStockBalances();
        }
        return stockMovementRepository.calculateStockBalancesByStoreId(storeId);
    }

    private List<ChartPointResponse> buildRevenueChart(List<OrderEntity> paidCompletedOrders) {
        Map<String, BigDecimal> grouped = new LinkedHashMap<>();
        paidCompletedOrders.stream()
                .sorted(Comparator.comparing(OrderEntity::getCreatedAt))
                .forEach(order -> grouped.merge(order.getCreatedAt().toLocalDate().toString(), order.getTotalAmount(), BigDecimal::add));
        return grouped.entrySet().stream()
                .map(entry -> new ChartPointResponse(entry.getKey(), entry.getValue(), null))
                .toList();
    }

    private List<ChartPointResponse> buildOrderChart(List<OrderEntity> orders) {
        Map<String, BigDecimal> grouped = new LinkedHashMap<>();
        orders.stream()
                .sorted(Comparator.comparing(OrderEntity::getCreatedAt))
                .forEach(order -> grouped.merge(order.getCreatedAt().toLocalDate().toString(), BigDecimal.ONE, BigDecimal::add));
        return grouped.entrySet().stream()
                .map(entry -> new ChartPointResponse(entry.getKey(), entry.getValue(), null))
                .toList();
    }

    private List<ChartPointResponse> buildInventoryChart(List<StockMovementEntity> movements) {
        Map<String, InventoryMovementAccumulator> grouped = new LinkedHashMap<>();
        movements.stream()
                .sorted(Comparator.comparing(StockMovementEntity::getCreatedAt))
                .forEach(movement -> {
                    String day = movement.getCreatedAt().toLocalDate().toString();
                    InventoryMovementAccumulator accumulator = grouped.computeIfAbsent(day, ignored -> new InventoryMovementAccumulator());
                    if ("IN".equalsIgnoreCase(movement.getMovementType())) {
                        accumulator.inQuantity = accumulator.inQuantity.add(movement.getQuantity());
                    }
                    if ("OUT".equalsIgnoreCase(movement.getMovementType())) {
                        accumulator.outQuantity = accumulator.outQuantity.add(movement.getQuantity());
                    }
                });
        return grouped.entrySet().stream()
                .map(entry -> new ChartPointResponse(entry.getKey(), entry.getValue().inQuantity, entry.getValue().outQuantity))
                .toList();
    }

    private List<ChartPointResponse> buildGoodsReceiptChart(List<GoodsReceiptEntity> receipts) {
        Map<String, BigDecimal> grouped = new LinkedHashMap<>();
        receipts.stream()
                .filter(receipt -> "COMPLETED".equalsIgnoreCase(receipt.getStatus()))
                .sorted(Comparator.comparing(GoodsReceiptEntity::getCreatedAt))
                .forEach(receipt -> grouped.merge(receipt.getCreatedAt().toLocalDate().toString(), receipt.getTotalAmount(), BigDecimal::add));
        return grouped.entrySet().stream()
                .map(entry -> new ChartPointResponse(entry.getKey(), entry.getValue(), null))
                .toList();
    }

    private Map<Long, BigDecimal> currentStockByIngredient(Long storeId) {
        Map<Long, BigDecimal> result = new LinkedHashMap<>();
        for (Object[] balance : stockBalances(storeId)) {
            Long ingredientId = (Long) balance[2];
            BigDecimal currentStock = safeBigDecimal(balance[7]);
            result.merge(ingredientId, currentStock, BigDecimal::add);
        }
        return result;
    }

    private BigDecimal sumOrders(List<OrderEntity> orders) {
        return orders.stream().map(OrderEntity::getTotalAmount).reduce(ZERO, BigDecimal::add);
    }

    private BigDecimal sumMovements(List<StockMovementEntity> movements, String type) {
        return movements.stream()
                .filter(movement -> type.equalsIgnoreCase(movement.getMovementType()))
                .map(StockMovementEntity::getQuantity)
                .reduce(ZERO, BigDecimal::add);
    }

    private boolean isPaidCompleted(OrderEntity order) {
        PaymentEntity payment = order.getPayment();
        return isStatus(order, "COMPLETED")
                && payment != null
                && "PAID".equalsIgnoreCase(payment.getPaymentStatus());
    }

    private boolean isStatus(OrderEntity order, String status) {
        return status.equalsIgnoreCase(order.getStatus());
    }

    private boolean inWindow(LocalDateTime dateTime, DateWindow window) {
        return !dateTime.isBefore(window.start()) && dateTime.isBefore(window.end());
    }

    private boolean storeMatches(Long actualStoreId, Long filterStoreId) {
        return filterStoreId == null || actualStoreId.equals(filterStoreId);
    }

    private String displayCustomer(OrderEntity order) {
        if (order.getReceiverName() != null && !order.getReceiverName().isBlank()) {
            return order.getReceiverName();
        }
        if (order.getUser() != null) {
            return order.getUser().getFullName();
        }
        return "Walk-in customer";
    }

    private boolean keywordMatches(String keyword, String... candidates) {
        if (isBlank(keyword)) {
            return true;
        }
        String normalized = keyword.toLowerCase(Locale.ROOT).trim();
        for (String candidate : candidates) {
            if (candidate != null && candidate.toLowerCase(Locale.ROOT).contains(normalized)) {
                return true;
            }
        }
        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private BigDecimal safeBigDecimal(Object value) {
        return value instanceof BigDecimal decimal ? decimal : ZERO;
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

    private static class RevenueAccumulator {
        private final LocalDate date;
        private final Long storeId;
        private final String storeName;
        private BigDecimal revenue = ZERO;
        private long orders;
        private long completed;
        private long cancelled;

        private RevenueAccumulator(LocalDate date, StoreEntity store) {
            this.date = date;
            this.storeId = store.getId();
            this.storeName = store.getName();
        }
    }

    private static class PaymentAccumulator {
        private final String paymentMethod;
        private final String paymentStatus;
        private long orderCount;
        private BigDecimal amount = ZERO;
        private BigDecimal revenue = ZERO;

        private PaymentAccumulator(String paymentMethod, String paymentStatus) {
            this.paymentMethod = paymentMethod;
            this.paymentStatus = paymentStatus;
        }
    }

    private static class InventoryMovementAccumulator {
        private BigDecimal inQuantity = ZERO;
        private BigDecimal outQuantity = ZERO;
    }

    private static class ConsumptionAccumulator {
        private final Long ingredientId;
        private final String ingredientCode;
        private final String ingredientName;
        private final String unit;
        private BigDecimal consumed = ZERO;

        private ConsumptionAccumulator(Long ingredientId, String ingredientCode, String ingredientName, String unit) {
            this.ingredientId = ingredientId;
            this.ingredientCode = ingredientCode;
            this.ingredientName = ingredientName;
            this.unit = unit;
        }
    }
}
