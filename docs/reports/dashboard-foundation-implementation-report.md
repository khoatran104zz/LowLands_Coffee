# Dashboard Foundation Implementation Report

## Business Rule Fixed

Dashboard revenue now follows the frozen Revenue Rule:

```text
Order.status = COMPLETED
AND
Payment.paymentStatus = PAID
```

Dashboard revenue no longer relies on completed orders alone.

Excluded from revenue:

- `COMPLETED + UNPAID`
- `CANCELLED + PAID`
- `COMPLETED + REFUNDED`
- `COMPLETED + FAILED`
- frontend receipt totals

## Queries Changed

Changed dashboard revenue source from:

```text
orders.status = COMPLETED
```

to paid-completed queries that join `orders` and `payments`.

Added repository queries in `OrderRepository`:

- `sumPaidCompletedRevenue`
- `sumPaidCompletedRevenueBetween`
- `findPaymentBreakdownForPaidCompletedOrders`
- `findTopProductsByPaidCompletedRevenue`
- `findTopCategoriesByPaidCompletedRevenue`
- `findStoreRankingByPaidCompletedRevenue`
- `countByOptionalStoreId`
- `countByStatusAndOptionalStoreId`

The old completed-order-only revenue query remains in the repository for compatibility, but Dashboard no longer calls it.

## APIs Affected

### Admin

`GET /api/v1/admin/dashboard/summary`

Kept existing fields:

- `totalUsers`
- `totalStores`
- `totalProducts`
- `totalOrders`
- `totalRevenue`

Added optional query parameter:

- `storeId`

Added response fields:

- `todayRevenue`
- `weekRevenue`
- `monthRevenue`
- `yearRevenue`
- `completedOrders`
- `cancelledOrders`
- `lowStockCount`
- `paymentBreakdown`
- `topProducts`
- `topCategories`
- `storeRanking`

### Manager

`GET /api/v1/manager/dashboard/summary`

Kept existing fields used by UI.

Changed revenue fields to paid-completed source:

- `totalRevenue`
- `todayRevenue`
- `yesterdayRevenue`
- `thisWeekRevenue`
- `thisMonthRevenue`

Manager store scope now uses `ManagerStoreContextService`, so manager dashboard derives store from authenticated backend context instead of trusting frontend `storeId`.

## Frontend Compatibility

No Dashboard UI redesign was performed.

Frontend field names used by the current UI were preserved:

- Admin dashboard still uses `totalRevenue`, `totalOrders`, `totalUsers`, `totalStores`.
- Manager dashboard still uses `todayRevenue`, `todayOrders`, `preparingOrders`, `completedOrders`, `lowStockItems`, `activeStaff`, `todayGoodsReceipts`.
- Manager revenue page still uses `todayRevenue`, `yesterdayRevenue`, `thisWeekRevenue`, `thisMonthRevenue`.

Updated:

- `code/frontend/src/services/dashboard.service.ts`

Only TypeScript interfaces were extended for new backend fields. No UI behavior was changed.

## Files Added

Backend DTOs:

- `DashboardPaymentBreakdownResponse.java`
- `DashboardStoreRankingResponse.java`
- `DashboardTopCategoryResponse.java`
- `DashboardTopProductResponse.java`

Backend test:

- `DashboardRevenueIntegrationTest.java`

Docs:

- `docs/reports/dashboard-foundation-gap-report.md`
- `docs/reports/dashboard-foundation-implementation-report.md`

## Files Changed

Backend:

- `AdminDashboardController.java`
- `AdminDashboardSummaryResponse.java`
- `ManagerDashboardSummaryResponse.java`
- `DashboardService.java`
- `DashboardServiceImpl.java`
- `OrderRepository.java`

Frontend:

- `code/frontend/src/services/dashboard.service.ts`

## Tests Added

`DashboardRevenueIntegrationTest` covers:

1. `COMPLETED + PAID` is counted as revenue.
2. `COMPLETED + UNPAID` is not counted.
3. `CANCELLED + PAID` is not counted.
4. `COMPLETED + REFUNDED` is not counted.
5. `COMPLETED + FAILED` is not counted.
6. Manager sees only assigned store revenue.
7. Admin all stores sees paid-completed total.
8. Admin store filter sees only that store.
9. Top products revenue uses paid-completed orders only.
10. Store ranking revenue uses paid-completed orders only.

## Test Result

Passed:

- `mvn -q -Dtest=DashboardRevenueIntegrationTest test`
- `mvn -q clean install`
- `npm.cmd run type-check`

Runtime server was not required for this sprint. If `spring-boot:run` is used locally, the runtime still needs valid environment variables such as `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`.

## Remaining Issues

- Admin dashboard UI still displays only summary cards and no-data chart placeholders. Backend now exposes more fields, but UI was intentionally not redesigned.
- Report module is still not implemented.
- Promotion is not included in revenue/reporting rules for this sprint.
- Revenue date ranges use `orders.created_at` as the dashboard business date. If finance later requires `payments.paid_at`, that must be a separate business decision.
- Top product/category revenue uses summed order item totals. If future reporting needs discount allocation by item/category, a discount allocation rule must be defined.

## Readiness

Dashboard backend now complies with the frozen Revenue Rule.

Dashboard UI can be released for the currently implemented widgets because:

- Admin `totalRevenue` uses paid-completed revenue.
- Manager revenue cards use paid-completed revenue.
- Frontend does not calculate or fake revenue.
- Existing UI field names are preserved.

For richer Dashboard widgets such as charts, top products, store ranking, and payment breakdown, backend data is now available, but UI implementation remains a separate sprint.
