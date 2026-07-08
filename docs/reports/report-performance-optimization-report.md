# Report Performance Optimization Report

## Scope

This sprint made Report V1 backend production-ready from a query/performance perspective.

No UI redesign, API contract change, response DTO change, or business rule change was performed.

## Files Added/Changed

Added:

- `docs/reports/report-query-performance-gap-report.md`
- `docs/reports/report-performance-optimization-report.md`
- `code/backend/src/main/java/com/lowlands/coffee/modules/report/repository/ReportQueryRepository.java`

Changed:

- `code/backend/src/main/java/com/lowlands/coffee/modules/report/service/impl/ReportServiceImpl.java`
- `code/frontend/src/components/features/home/FeaturedProducts.tsx`

The frontend change is a null-safe TypeScript fix for `product.description` so `npm run type-check` can pass. It does not change report UI or report behavior.

## Queries Optimized

### Revenue Report

Before:

- `orderRepository.findAll()`
- Java stream filters for store/date/status/payment
- Java grouping by date/store
- Java revenue chart grouping

After:

- DB aggregate query for summary:
  - `SUM`
  - `COUNT`
  - conditional `SUM(CASE WHEN ...)`
- DB grouped query by `CAST(created_at AS DATE)` and store.
- DB chart query grouped by date.
- Optional filters are appended dynamically, so PostgreSQL does not receive untyped null parameters like `:storeId is null`.

Business rule preserved:

```text
Order.status = COMPLETED
AND Payment.payment_status = PAID
```

### Order Report

Before:

- Full order entity load.
- Java status counts.
- Java chart grouping.
- Java row sorting.

After:

- DB summary query with conditional counts.
- DB row projection query.
- DB chart query grouped by order date.
- Keyword/status/store/date filters applied in SQL.

### Payment Report

Before:

- Order entity scan.
- Payment method/status grouping in Java.
- Paid/unpaid/failed/refunded counts in Java.

After:

- DB grouping by `payment_method`, `payment_status`.
- DB summary query for paid-completed revenue and payment status counts.
- Revenue still uses paid-completed order rule.

### Inventory Report

Before:

- All stock movements loaded into memory.
- Nested stream per balance row to compute IN/OUT/ADJUSTMENT.
- Worst-case `O(balance_rows * movement_rows)`.

After:

- DB aggregate query groups by store and ingredient.
- Conditional sums calculate:
  - closing stock from full ledger;
  - period IN;
  - period OUT;
  - period ADJUSTMENT.
- DB chart query groups IN/OUT by movement date.
- Service only maps aggregate rows to existing DTO.

### Goods Receipt Report

Before:

- `goodsReceiptRepository.findAll()` loaded receipts plus supplier/store/createdBy/items graph.
- Java filters, distinct supplier count, completed count, value sum, and chart grouping.

After:

- DB row projection query.
- DB summary query for total/completed/suppliers/completed value.
- DB chart query grouped by receipt date.

### Ingredient Consumption Report

Before:

- All stock movements loaded.
- Java filters `OUT` + `ORDER`.
- Java grouping by ingredient.

After:

- DB aggregate query:

```text
movement_type = OUT
AND reference_type = ORDER
GROUP BY ingredient
```

- DB current stock aggregate by ingredient.
- DB-backed inventory rows are reused for low-stock count.

## Queries Remaining

No `findAll()` remains in `modules/report`.

Remaining acceptable Java-side processing:

- DTO mapping from projection rows.
- Small derived totals from already aggregated rows.
- Percentage calculation for payment rows.
- Low-stock count over aggregated inventory rows.
- Current stock map merge by ingredient after DB aggregation.

Dashboard still has some stream processing:

- Low-stock widgets over DB-aggregated balance rows.
- Recent activity merge over limited query results.
- Active staff count over one store assignment list.

These are acceptable for this sprint because they are not report-wide `findAll()` scans and were not the primary technical debt.

## Indexes Suggested

Existing useful indexes already present:

- `orders(store_id)`
- `orders(status)`
- `orders(created_at)`
- `payments(payment_status)`
- `goods_receipts(store_id)`
- `goods_receipts(status)`
- `stock_movements(store_id, ingredient_id)`
- `stock_movements(reference_type, reference_id)`
- `stock_movements(created_at)`

Recommended composite indexes for production:

- `orders(store_id, created_at)`
- `orders(status, store_id, created_at)`
- `payments(order_id)`
- `payments(payment_status, payment_method)`
- `goods_receipts(store_id, created_at)`
- `goods_receipts(store_id, status, created_at)`
- `stock_movements(store_id, created_at)`
- `stock_movements(store_id, ingredient_id, created_at)`
- `stock_movements(movement_type, reference_type, store_id, created_at)`

No index migration was created in this sprint because the instruction asked to audit/propose indexes first.

## Permission Verification

Admin report endpoints:

- Require `REPORT_VIEW`.
- Allow global data.
- Allow optional `storeId` filter.

Manager report endpoints:

- Require `REPORT_VIEW`.
- Do not expose `storeId` request parameter.
- Resolve store scope through `ManagerStoreContextService`.
- Pass the resolved manager store ID into repository queries.

No manager store override path was found or introduced.

## Performance Comparison

### Before

| Data Size | Expected Behavior |
| --- | --- |
| 1k rows | Usually acceptable, but wasteful entity loading. |
| 10k rows | Noticeable heap churn and CPU from repeated Java scans/grouping. |
| 100k rows | High timeout and memory risk, especially inventory and payment reports. |

### After

| Data Size | Expected Behavior |
| --- | --- |
| 1k rows | Fast; queries return compact projection rows. |
| 10k rows | Stable; filtering and grouping move to DB. |
| 100k rows | Much more viable; performance depends mainly on DB indexes and query plan. |

Complexity changes:

- Revenue: from `O(N orders)` entity scan to DB aggregate over indexed date/store/status/payment filters.
- Orders: from Java status/chart scan to SQL count/group plus row projection.
- Payments: from Java grouping over orders to SQL `GROUP BY payment_method, payment_status`.
- Inventory: from worst-case `O(balance_rows * movement_rows)` to SQL grouped aggregation.
- Goods Receipt: from full entity graph load to projection and aggregate queries.
- Consumption: from movement ledger scan in Java to SQL grouped `SUM(quantity)`.

## Regression

Passed:

- `mvn -q -DskipTests compile`
- `mvn -q '-Dtest=ReportServiceIntegrationTest,DashboardRevenueIntegrationTest' test`
- `mvn -q clean install`
- `mvn -q test`
- `npm.cmd run type-check`

Runtime verification on Neon PostgreSQL:

- Backend started successfully through `scripts/run-backend-neon.ps1` on `SERVER_PORT=18080`.
- Login succeeded with `admin@lowlands.coffee`.
- Admin report endpoints returned `success: true`:
  - `/api/v1/admin/reports/revenue`
  - `/api/v1/admin/reports/orders`
  - `/api/v1/admin/reports/payments`
  - `/api/v1/admin/reports/inventory`
  - `/api/v1/admin/reports/goods-receipts`
  - `/api/v1/admin/reports/ingredient-consumption`

Operational note:

- `npm run backend` can fail before Spring Boot starts if the Node port precheck cannot bind a socket on the local machine.
- Existing Java backend processes on `8080` or `18080` must be stopped before starting a new backend instance.

Verified by tests:

- Revenue remains paid-completed only.
- Completed unpaid orders remain excluded.
- Paid cancelled orders remain excluded.
- Admin store filter remains scoped.
- Manager report revenue remains scoped to assigned store.
- Dashboard revenue regression remains green.

## Production Readiness

Report backend is now production-ready for V1 functional scope.

Ready:

- Report API contracts unchanged.
- Response DTOs unchanged.
- Frontend report UI unchanged.
- Business rules unchanged.
- Manager store scope preserved.
- Java `findAll()` report aggregations removed.
- DB query projections and aggregate queries now back report calculations.
- Regression tests pass.

Not fully complete for high-scale production:

- Composite indexes listed above should be added in a follow-up Flyway migration after reviewing production query plans.
- Report native SQL should be EXPLAIN-analyzed against production-like PostgreSQL data.
- Dashboard low-stock widgets can be further optimized with dedicated low-stock repository queries.
- Report export still logs intent only; real Excel/PDF generation remains future scope.

Final assessment:

```text
Production readiness: conditionally ready.
```

The backend report implementation is ready for release from a service/query-architecture perspective. For large production traffic and 100k+ row datasets, add the recommended composite indexes before heavy BI/report usage.
