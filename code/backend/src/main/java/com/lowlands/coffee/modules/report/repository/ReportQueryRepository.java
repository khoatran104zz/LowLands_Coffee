package com.lowlands.coffee.modules.report.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class ReportQueryRepository {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final EntityManager entityManager;

    public ReportQueryRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public RevenueSummaryRow findRevenueSummary(LocalDateTime start, LocalDateTime end, Long storeId) {
        String sql = """
                select
                    coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then o.total_amount else 0 end), 0),
                    count(o.id),
                    coalesce(sum(case when o.status = 'COMPLETED' then 1 else 0 end), 0),
                    coalesce(sum(case when o.status = 'CANCELLED' then 1 else 0 end), 0),
                    coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then 1 else 0 end), 0)
                from orders o
                left join payments p on p.order_id = o.id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId);
        Object[] row = singleRow(sql, params(start, end, storeId, null, null, null));
        return new RevenueSummaryRow(decimal(row[0]), longValue(row[1]), longValue(row[2]), longValue(row[3]), longValue(row[4]));
    }

    public List<RevenueGroupRow> findRevenueRows(LocalDateTime start, LocalDateTime end, Long storeId) {
        String sql = """
                select
                    cast(o.created_at as date),
                    s.id,
                    s.name,
                    coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then o.total_amount else 0 end), 0),
                    count(o.id),
                    coalesce(sum(case when o.status = 'COMPLETED' then 1 else 0 end), 0),
                    coalesce(sum(case when o.status = 'CANCELLED' then 1 else 0 end), 0)
                from orders o
                join stores s on s.id = o.store_id
                left join payments p on p.order_id = o.id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + """
                group by cast(o.created_at as date), s.id, s.name
                order by cast(o.created_at as date) desc, s.name
                """;
        return list(sql, params(start, end, storeId, null, null, null)).stream()
                .map(row -> new RevenueGroupRow(localDate(row[0]), longValue(row[1]), (String) row[2], decimal(row[3]), longValue(row[4]), longValue(row[5]), longValue(row[6])))
                .toList();
    }

    public List<ChartRow> findRevenueChart(LocalDateTime start, LocalDateTime end, Long storeId) {
        String sql = """
                select cast(o.created_at as date), coalesce(sum(o.total_amount), 0)
                from orders o
                join payments p on p.order_id = o.id
                where o.status = 'COMPLETED'
                  and p.payment_status = 'PAID'
                  and o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + """
                group by cast(o.created_at as date)
                order by cast(o.created_at as date)
                """;
        return list(sql, params(start, end, storeId, null, null, null)).stream()
                .map(row -> new ChartRow(localDate(row[0]).toString(), decimal(row[1]), null))
                .toList();
    }

    public OrderSummaryRow findOrderSummary(LocalDateTime start, LocalDateTime end, Long storeId, String orderStatus, String keyword) {
        String sql = """
                select
                    count(o.id),
                    coalesce(sum(case when o.status = 'COMPLETED' then 1 else 0 end), 0),
                    coalesce(sum(case when o.status = 'PREPARING' then 1 else 0 end), 0),
                    coalesce(sum(case when o.status = 'READY' then 1 else 0 end), 0),
                    coalesce(sum(case when o.status = 'CANCELLED' then 1 else 0 end), 0)
                from orders o
                left join users u on u.id = o.user_id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + orderStatusFilter(orderStatus) + orderKeywordFilter(keyword);
        Object[] row = singleRow(sql, params(start, end, storeId, orderStatus, keywordLike(keyword), null));
        return new OrderSummaryRow(longValue(row[0]), longValue(row[1]), longValue(row[2]), longValue(row[3]), longValue(row[4]));
    }

    public List<OrderReportRow> findOrderRows(LocalDateTime start, LocalDateTime end, Long storeId, String orderStatus, String keyword) {
        String sql = """
                select
                    o.id,
                    o.order_code,
                    coalesce(o.receiver_name, u.full_name, 'Walk-in customer'),
                    o.created_at,
                    s.id,
                    s.name,
                    o.total_amount,
                    o.status,
                    p.payment_method,
                    p.payment_status
                from orders o
                join stores s on s.id = o.store_id
                left join users u on u.id = o.user_id
                left join payments p on p.order_id = o.id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + orderStatusFilter(orderStatus) + orderKeywordFilter(keyword) + """
                order by o.created_at desc
                """;
        return list(sql, params(start, end, storeId, orderStatus, keywordLike(keyword), null)).stream()
                .map(row -> new OrderReportRow(longValue(row[0]), (String) row[1], (String) row[2], localDateTime(row[3]), longValue(row[4]), (String) row[5], decimal(row[6]), (String) row[7], (String) row[8], (String) row[9]))
                .toList();
    }

    public List<ChartRow> findOrderChart(LocalDateTime start, LocalDateTime end, Long storeId, String orderStatus, String keyword) {
        String sql = """
                select cast(o.created_at as date), count(o.id)
                from orders o
                left join users u on u.id = o.user_id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + orderStatusFilter(orderStatus) + orderKeywordFilter(keyword) + """
                group by cast(o.created_at as date)
                order by cast(o.created_at as date)
                """;
        return list(sql, params(start, end, storeId, orderStatus, keywordLike(keyword), null)).stream()
                .map(row -> new ChartRow(localDate(row[0]).toString(), decimal(row[1]), null))
                .toList();
    }

    public List<PaymentGroupRow> findPaymentRows(LocalDateTime start, LocalDateTime end, Long storeId, String paymentMethod) {
        String sql = """
                select
                    p.payment_method,
                    p.payment_status,
                    count(o.id),
                    coalesce(sum(p.amount), 0),
                    coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then o.total_amount else 0 end), 0)
                from payments p
                join orders o on o.id = p.order_id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + paymentMethodFilter(paymentMethod) + """
                group by p.payment_method, p.payment_status
                order by coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then o.total_amount else 0 end), 0) desc
                """;
        return list(sql, params(start, end, storeId, null, null, paymentMethod)).stream()
                .map(row -> new PaymentGroupRow((String) row[0], (String) row[1], longValue(row[2]), decimal(row[3]), decimal(row[4])))
                .toList();
    }

    public PaymentSummaryRow findPaymentSummary(LocalDateTime start, LocalDateTime end, Long storeId, String paymentMethod) {
        String sql = """
                select
                    coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then o.total_amount else 0 end), 0),
                    coalesce(sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then 1 else 0 end), 0),
                    coalesce(sum(case when p.payment_status = 'UNPAID' then 1 else 0 end), 0),
                    coalesce(sum(case when p.payment_status = 'FAILED' then 1 else 0 end), 0),
                    coalesce(sum(case when p.payment_status = 'REFUNDED' then 1 else 0 end), 0)
                from payments p
                join orders o on o.id = p.order_id
                where o.created_at >= :start
                  and o.created_at < :end
                """ + storeFilter("o", storeId) + paymentMethodFilter(paymentMethod);
        Object[] row = singleRow(sql, params(start, end, storeId, null, null, paymentMethod));
        return new PaymentSummaryRow(decimal(row[0]), longValue(row[1]), longValue(row[2]), longValue(row[3]), longValue(row[4]));
    }

    public List<InventoryAggregateRow> findInventoryRows(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select
                    s.id,
                    s.name,
                    i.id,
                    i.code,
                    i.name,
                    i.unit,
                    i.min_stock,
                    coalesce(sum(case when sm.movement_type = 'IN' then sm.quantity when sm.movement_type = 'OUT' then -sm.quantity else sm.quantity end), 0),
                    coalesce(sum(case when sm.created_at >= :start and sm.created_at < :end and sm.movement_type = 'IN' then sm.quantity else 0 end), 0),
                    coalesce(sum(case when sm.created_at >= :start and sm.created_at < :end and sm.movement_type = 'OUT' then sm.quantity else 0 end), 0),
                    coalesce(sum(case when sm.created_at >= :start and sm.created_at < :end and sm.movement_type = 'ADJUSTMENT' then sm.quantity else 0 end), 0)
                from stock_movements sm
                join stores s on s.id = sm.store_id
                join ingredients i on i.id = sm.ingredient_id
                where 1 = 1
                """ + storeFilter("sm", storeId) + inventoryKeywordFilter(keyword) + """
                group by s.id, s.name, i.id, i.code, i.name, i.unit, i.min_stock
                order by s.name, i.name
                """;
        return list(sql, params(start, end, storeId, null, keywordLike(keyword), null)).stream()
                .map(row -> new InventoryAggregateRow(longValue(row[0]), (String) row[1], longValue(row[2]), (String) row[3], (String) row[4], (String) row[5], decimal(row[6]), decimal(row[7]), decimal(row[8]), decimal(row[9]), decimal(row[10])))
                .toList();
    }

    public List<ChartRow> findInventoryChart(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select
                    cast(sm.created_at as date),
                    coalesce(sum(case when sm.movement_type = 'IN' then sm.quantity else 0 end), 0),
                    coalesce(sum(case when sm.movement_type = 'OUT' then sm.quantity else 0 end), 0)
                from stock_movements sm
                join stores s on s.id = sm.store_id
                join ingredients i on i.id = sm.ingredient_id
                where sm.created_at >= :start
                  and sm.created_at < :end
                """ + storeFilter("sm", storeId) + inventoryKeywordFilter(keyword) + """
                group by cast(sm.created_at as date)
                order by cast(sm.created_at as date)
                """;
        return list(sql, params(start, end, storeId, null, keywordLike(keyword), null)).stream()
                .map(row -> new ChartRow(localDate(row[0]).toString(), decimal(row[1]), decimal(row[2])))
                .toList();
    }

    public long countInventoryAdjustments(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select count(sm.id)
                from stock_movements sm
                join stores s on s.id = sm.store_id
                join ingredients i on i.id = sm.ingredient_id
                where sm.created_at >= :start
                  and sm.created_at < :end
                  and sm.movement_type = 'ADJUSTMENT'
                """ + storeFilter("sm", storeId) + inventoryKeywordFilter(keyword);
        Object[] row = singleRow(sql, params(start, end, storeId, null, keywordLike(keyword), null));
        return longValue(row[0]);
    }

    public List<GoodsReceiptReportRow> findGoodsReceiptRows(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select gr.id, gr.receipt_code, sup.id, sup.name, s.id, s.name, u.full_name, gr.status, gr.total_amount, gr.created_at
                from goods_receipts gr
                join suppliers sup on sup.id = gr.supplier_id
                join stores s on s.id = gr.store_id
                join users u on u.id = gr.created_by
                where gr.created_at >= :start
                  and gr.created_at < :end
                """ + storeFilter("gr", storeId) + goodsReceiptKeywordFilter(keyword) + """
                order by gr.created_at desc
                """;
        return list(sql, params(start, end, storeId, null, keywordLike(keyword), null)).stream()
                .map(row -> new GoodsReceiptReportRow(longValue(row[0]), (String) row[1], longValue(row[2]), (String) row[3], longValue(row[4]), (String) row[5], (String) row[6], (String) row[7], decimal(row[8]), localDateTime(row[9])))
                .toList();
    }

    public GoodsReceiptSummaryRow findGoodsReceiptSummary(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select
                    count(gr.id),
                    coalesce(sum(case when gr.status = 'COMPLETED' then 1 else 0 end), 0),
                    count(distinct gr.supplier_id),
                    coalesce(sum(case when gr.status = 'COMPLETED' then gr.total_amount else 0 end), 0)
                from goods_receipts gr
                join suppliers sup on sup.id = gr.supplier_id
                join users u on u.id = gr.created_by
                where gr.created_at >= :start
                  and gr.created_at < :end
                """ + storeFilter("gr", storeId) + goodsReceiptKeywordFilter(keyword);
        Object[] row = singleRow(sql, params(start, end, storeId, null, keywordLike(keyword), null));
        return new GoodsReceiptSummaryRow(longValue(row[0]), longValue(row[1]), longValue(row[2]), decimal(row[3]));
    }

    public List<ChartRow> findGoodsReceiptChart(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select cast(gr.created_at as date), coalesce(sum(gr.total_amount), 0)
                from goods_receipts gr
                join suppliers sup on sup.id = gr.supplier_id
                join users u on u.id = gr.created_by
                where gr.status = 'COMPLETED'
                  and gr.created_at >= :start
                  and gr.created_at < :end
                """ + storeFilter("gr", storeId) + goodsReceiptKeywordFilter(keyword) + """
                group by cast(gr.created_at as date)
                order by cast(gr.created_at as date)
                """;
        return list(sql, params(start, end, storeId, null, keywordLike(keyword), null)).stream()
                .map(row -> new ChartRow(localDate(row[0]).toString(), decimal(row[1]), null))
                .toList();
    }

    public List<IngredientConsumptionAggregateRow> findIngredientConsumptionRows(LocalDateTime start, LocalDateTime end, Long storeId, String keyword) {
        String sql = """
                select
                    i.id,
                    i.code,
                    i.name,
                    coalesce(sum(sm.quantity), 0),
                    sm.unit
                from stock_movements sm
                join ingredients i on i.id = sm.ingredient_id
                join stores s on s.id = sm.store_id
                where sm.created_at >= :start
                  and sm.created_at < :end
                  and sm.movement_type = 'OUT'
                  and sm.reference_type = 'ORDER'
                """ + storeFilter("sm", storeId) + inventoryKeywordFilter(keyword) + """
                group by i.id, i.code, i.name, sm.unit
                order by coalesce(sum(sm.quantity), 0) desc
                """;
        return list(sql, params(start, end, storeId, null, keywordLike(keyword), null)).stream()
                .map(row -> new IngredientConsumptionAggregateRow(longValue(row[0]), (String) row[1], (String) row[2], decimal(row[3]), (String) row[4]))
                .toList();
    }

    public List<IngredientStockRow> findCurrentStockByIngredient(Long storeId) {
        String sql = """
                select
                    sm.ingredient_id,
                    coalesce(sum(case when sm.movement_type = 'IN' then sm.quantity when sm.movement_type = 'OUT' then -sm.quantity else sm.quantity end), 0)
                from stock_movements sm
                where 1 = 1
                """ + storeFilter("sm", storeId) + """
                group by sm.ingredient_id
                """;
        return list(sql, params(null, null, storeId, null, null, null)).stream()
                .map(row -> new IngredientStockRow(longValue(row[0]), decimal(row[1])))
                .toList();
    }

    private String storeFilter(String alias, Long storeId) {
        return storeId == null ? "" : " and " + alias + ".store_id = :storeId\n";
    }

    private String orderStatusFilter(String orderStatus) {
        return isBlank(orderStatus) ? "" : " and upper(o.status) = upper(:status)\n";
    }

    private String paymentMethodFilter(String paymentMethod) {
        return isBlank(paymentMethod) ? "" : " and upper(p.payment_method) = upper(:paymentMethod)\n";
    }

    private String orderKeywordFilter(String keyword) {
        return isBlank(keyword) ? "" : " and lower(coalesce(o.order_code, '') || ' ' || coalesce(o.receiver_name, '') || ' ' || coalesce(o.receiver_phone, '') || ' ' || coalesce(u.full_name, '')) like :keyword\n";
    }

    private String inventoryKeywordFilter(String keyword) {
        return isBlank(keyword) ? "" : " and lower(coalesce(i.code, '') || ' ' || coalesce(i.name, '') || ' ' || coalesce(s.name, '')) like :keyword\n";
    }

    private String goodsReceiptKeywordFilter(String keyword) {
        return isBlank(keyword) ? "" : " and lower(coalesce(gr.receipt_code, '') || ' ' || coalesce(sup.name, '') || ' ' || coalesce(u.full_name, '')) like :keyword\n";
    }

    private QueryParams params(LocalDateTime start, LocalDateTime end, Long storeId, String status, String keyword, String paymentMethod) {
        return new QueryParams(start, end, storeId, blankToNull(status), keyword, blankToNull(paymentMethod));
    }

    private Object[] singleRow(String sql, QueryParams params) {
        List<?> rows = rawList(sql, params);
        if (rows.isEmpty()) {
            return new Object[]{ZERO, 0L, 0L, 0L, 0L};
        }
        Object row = rows.get(0);
        if (row instanceof Object[] values) {
            return values;
        }
        return new Object[]{row};
    }

    private List<Object[]> list(String sql, QueryParams params) {
        return rawList(sql, params).stream()
                .map(row -> row instanceof Object[] values ? values : new Object[]{row})
                .toList();
    }

    private List<?> rawList(String sql, QueryParams params) {
        Query query = entityManager.createNativeQuery(sql);
        if (sql.contains(":start")) {
            query.setParameter("start", params.start());
        }
        if (sql.contains(":end")) {
            query.setParameter("end", params.end());
        }
        if (sql.contains(":storeId")) {
            query.setParameter("storeId", params.storeId());
        }
        if (sql.contains(":status")) {
            query.setParameter("status", params.status());
        }
        if (sql.contains(":keyword")) {
            query.setParameter("keyword", params.keyword());
        }
        if (sql.contains(":paymentMethod")) {
            query.setParameter("paymentMethod", params.paymentMethod());
        }
        return query.getResultList();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value;
    }

    private String keywordLike(String keyword) {
        return isBlank(keyword) ? null : "%" + keyword.toLowerCase().trim() + "%";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private BigDecimal decimal(Object value) {
        if (value == null) {
            return ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(value.toString());
    }

    private long longValue(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private LocalDate localDate(Object value) {
        if (value instanceof Date date) {
            return date.toLocalDate();
        }
        if (value instanceof java.util.Date date) {
            return new Date(date.getTime()).toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }

    private LocalDateTime localDateTime(Object value) {
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        return LocalDateTime.parse(value.toString().replace(" ", "T"));
    }

    private record QueryParams(LocalDateTime start, LocalDateTime end, Long storeId, String status, String keyword, String paymentMethod) {
    }

    public record RevenueSummaryRow(BigDecimal revenue, long totalOrders, long completedOrders, long cancelledOrders, long paidCompletedOrders) {
    }

    public record RevenueGroupRow(LocalDate date, Long storeId, String storeName, BigDecimal revenue, long orders, long completed, long cancelled) {
    }

    public record OrderSummaryRow(long total, long completed, long preparing, long ready, long cancelled) {
    }

    public record OrderReportRow(Long orderId, String orderCode, String customerName, LocalDateTime createdAt, Long storeId, String storeName, BigDecimal amount, String status, String paymentMethod, String paymentStatus) {
    }

    public record PaymentGroupRow(String paymentMethod, String paymentStatus, long orderCount, BigDecimal amount, BigDecimal revenue) {
    }

    public record PaymentSummaryRow(BigDecimal paidRevenue, long paidCompletedOrders, long unpaid, long failed, long refunded) {
    }

    public record InventoryAggregateRow(Long storeId, String storeName, Long ingredientId, String ingredientCode, String ingredientName, String unit, BigDecimal minStock, BigDecimal closing, BigDecimal inQuantity, BigDecimal outQuantity, BigDecimal adjustment) {
    }

    public record GoodsReceiptReportRow(Long id, String receiptCode, Long supplierId, String supplierName, Long storeId, String storeName, String createdByName, String status, BigDecimal amount, LocalDateTime createdAt) {
    }

    public record GoodsReceiptSummaryRow(long total, long completed, long suppliers, BigDecimal completedValue) {
    }

    public record IngredientConsumptionAggregateRow(Long ingredientId, String ingredientCode, String ingredientName, BigDecimal consumed, String unit) {
    }

    public record IngredientStockRow(Long ingredientId, BigDecimal currentStock) {
    }

    public record ChartRow(String label, BigDecimal value, BigDecimal secondaryValue) {
    }
}
