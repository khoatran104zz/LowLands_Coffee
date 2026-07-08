# Report Query Performance Gap Report

## Scope

Audit Report V1 and Dashboard backend performance after Business Rules Freeze.

No production code was changed before this report.

Primary target:

- Replace report-side `findAll()` + Java aggregation with repository/database queries.

Out of scope:

- UI changes.
- API contract changes.
- Business rule changes.
- New report features.

## Sources Read

- `docs/convention.md`
- `docs/system-business-rules.md`
- `docs/reports/business-freeze-report.md`
- `docs/reports/report-backend-integration-gap-report.md`
- `docs/reports/report-backend-integration-implementation-report.md`
- `docs/reports/dashboard-foundation-implementation-report.md`
- `modules/report`
- `modules/dashboard`
- `modules/order`
- `modules/payment`
- `modules/inventory`

There is no separate `modules/goodsreceipt` package. Goods receipt code currently lives under `modules/inventory`.

## Main Finding

`ReportServiceImpl` is correct for business rules but not production-ready for large datasets. It loads full operational tables into memory through `findAll()` and then filters, groups, sums, and counts in Java.

Dashboard is mostly already query-backed. Remaining Dashboard stream usage is either:

- small fixed list composition;
- low-stock processing over already aggregated stock balance rows;
- active staff counting over manager store assignment rows.

## Java Aggregation Hotspots

| File | Method | Dataset | Current Pattern | Complexity | Estimated Cost |
| --- | --- | --- | --- | --- | --- |
| `ReportServiceImpl` | `filteredOrders` | all `orders` + `payments` + store/user graph | `orderRepository.findAll().stream().filter(...)` | O(N orders) memory and CPU per report request | High at 10k rows, severe at 100k+ rows |
| `ReportServiceImpl` | `buildRevenueReport` | filtered orders | stream filters for paid/completed/completed/cancelled; Java grouping by date/store; Java revenue chart | O(N filtered orders) | High because revenue report is common and duplicates work already suited to SQL |
| `ReportServiceImpl` | `buildOrderReport` | filtered orders | Java status counts, sort, chart grouping | O(N filtered orders) | Medium/high; row output still needs rows, but summary/chart should be SQL |
| `ReportServiceImpl` | `buildPaymentReport` | filtered orders + payments | Java payment method/status grouping, revenue sum, paid/unpaid/failed/refunded counts | O(N filtered orders) | High because every payment report scans orders and joins lazily/eagerly in memory |
| `ReportServiceImpl` | `filteredMovements` | all `stock_movements` + store/ingredient graph | `stockMovementRepository.findAll().stream().filter(...)` | O(N movements) memory and CPU per report request | Severe at 100k+ movement ledger rows |
| `ReportServiceImpl` | `buildInventoryReport` | stock balances + filtered movements | nested stream per balance row to sum IN/OUT/ADJUSTMENT | O(B * M) in worst case | Severe when stores/ingredients and movements grow |
| `ReportServiceImpl` | `buildInventoryChart` | filtered stock movements | Java group by movement date | O(M) | Medium/high; should be SQL `GROUP BY date` |
| `ReportServiceImpl` | `buildGoodsReceiptReport` | all goods receipts + supplier/store/createdBy/items | `goodsReceiptRepository.findAll().stream().filter(...)`; Java status counts, sum, distinct suppliers, chart | O(N receipts) memory and CPU | High; `findAll()` fetches items too via entity graph |
| `ReportServiceImpl` | `buildIngredientConsumptionReport` | all stock movements | Java filters `OUT` + `ORDER`, Java group by ingredient, current stock merge | O(M) + stock balance scan | High/severe for movement ledger |
| `ReportServiceImpl` | `currentStockByIngredient` | stock balance rows | Java merge by ingredient | O(B) | Medium; acceptable after DB aggregation, but can be query-backed if needed |
| `DashboardServiceImpl` | `countLowStockItems` / `findLowStockItems` | DB-aggregated stock balances | stream over balance result | O(B) | Acceptable for current dashboard; future DB low-stock query recommended |
| `DashboardServiceImpl` | `findRecentActivities` | limited recent orders/receipts/movements | merges three limited query results then sorts | O(limit) | Acceptable |
| `DashboardServiceImpl` | manager active staff count | manager store assignments | `findByStoreId(...).stream().filter(...).count()` | O(staff in store) | Acceptable, but can become repository count query later |

## Query Optimization Targets

### Revenue Report

Replace Java aggregation with repository queries for:

- summary metrics: total orders, paid-completed revenue, completed count, cancelled count;
- rows grouped by `date(o.createdAt)`, store;
- chart grouped by `date(o.createdAt)` for paid-completed revenue.

Expected SQL shape:

```sql
select date(o.created_at), s.id, s.name,
       sum(case when o.status = 'COMPLETED' and p.payment_status = 'PAID' then o.total_amount else 0 end),
       count(o.id),
       sum(case when o.status = 'COMPLETED' then 1 else 0 end),
       sum(case when o.status = 'CANCELLED' then 1 else 0 end)
from orders o
join stores s on s.id = o.store_id
left join payments p on p.order_id = o.id
where o.created_at >= ? and o.created_at < ?
  and (? is null or o.store_id = ?)
group by date(o.created_at), s.id, s.name
order by date(o.created_at) desc, s.name
```

### Order Report

Replace summary and chart with query aggregation. Keep row projection query for table rows.

Expected improvements:

- no full entity load;
- no Java status count scan;
- row query fetches only report row columns.

### Payment Report

Replace grouping by payment method/status with SQL `GROUP BY p.payment_method, p.payment_status`.

Keep revenue rule:

```text
o.status = COMPLETED and p.payment_status = PAID
```

### Inventory Report

Replace nested movement scans with a grouped movement summary query by store and ingredient.

Expected query:

- group stock balances by store/ingredient;
- group period movements by store/ingredient with conditional sums for IN, OUT, ADJUSTMENT;
- assemble rows from aggregated result sets without loading `StockMovementEntity`.

### Goods Receipt Report

Replace `goodsReceiptRepository.findAll()` with:

- row projection query;
- summary query for count/completed/supplier/value;
- chart query grouped by date.

### Ingredient Consumption Report

Replace movement entity scan with:

- SQL sum by ingredient for `movement_type = OUT` and `reference_type = ORDER`;
- top chart query using database ordering/limit where possible;
- low-stock count from aggregated balance query or optimized repository query.

## Database Index Audit

Existing useful indexes:

- `orders(store_id)`
- `orders(status)`
- `orders(created_at)`
- `payments(payment_status)`
- `goods_receipts(store_id)`
- `goods_receipts(status)`
- `stock_movements(store_id, ingredient_id)`
- `stock_movements(reference_type, reference_id)`
- `stock_movements(created_at)`

Missing or recommended composite indexes:

- `orders(store_id, created_at)`
- `orders(status, store_id, created_at)`
- `payments(order_id)` if not already covered by FK/unique implementation in the database.
- `payments(payment_status, payment_method)`
- `goods_receipts(store_id, created_at)`
- `goods_receipts(store_id, status, created_at)`
- `stock_movements(store_id, created_at)`
- `stock_movements(store_id, ingredient_id, created_at)`
- `stock_movements(movement_type, reference_type, store_id, created_at)`

No migration is created in this phase. These should be proposed in the final report after query changes compile and pass regression.

## Permission Audit

Current report controller behavior:

- Admin report endpoints require `REPORT_VIEW`.
- Admin endpoints accept optional `storeId` filter.
- Manager report endpoints require `REPORT_VIEW`.
- Manager endpoints do not expose `storeId`.
- Manager report service methods derive store scope from `ManagerStoreContextService`.

No permission bypass was found in the report API contract. Query optimization must preserve this by passing `currentManagerStoreId()` for manager queries and never trusting frontend `storeId` for manager endpoints.

## Estimated Performance Before Optimization

| Rows | Current Behavior |
| --- | --- |
| 1k | Usually acceptable but wasteful. |
| 10k | Noticeable memory/CPU usage under concurrent report requests. |
| 100k | High risk of slow requests, large heap churn, and timeout for inventory/payment reports. |

## Recommendation

Proceed with repository projection and aggregation queries for Report V1 while preserving DTOs and API contracts.

Implementation should prioritize:

1. `ReportQueryRepository` or repository-level projection methods.
2. SQL/JPQL `COUNT`, `SUM`, `GROUP BY`, and date range filters.
3. No entity `findAll()` in `ReportServiceImpl` for report calculations.
4. Keep manager store scope enforced in service.
