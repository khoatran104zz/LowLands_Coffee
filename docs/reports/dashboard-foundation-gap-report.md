# Dashboard Foundation Gap Report

## Scope

Audit current Dashboard backend/data source against the frozen business rule:

```text
Revenue = Payment.status = PAID AND Order.status = COMPLETED
```

No code was changed before this report.

## Existing APIs

| API | Controller | Current purpose |
| --- | --- | --- |
| `GET /api/v1/admin/dashboard/summary` | `AdminDashboardController` | Admin summary cards |
| `GET /api/v1/manager/dashboard/summary` | `ManagerDashboardController` | Manager store dashboard and revenue page |

## Existing Fields

### Admin Summary

Current response DTO:

- `totalUsers`
- `totalStores`
- `totalProducts`
- `totalOrders`
- `totalRevenue`

Current service values:

- `totalUsers`: `userRepository.count()`
- `totalStores`: `storeRepository.count()`
- `totalProducts`: `productRepository.count()`
- `totalOrders`: hardcoded `0`
- `totalRevenue`: hardcoded `0`

### Manager Summary

Current response DTO:

- `storeId`
- `storeName`
- `totalProducts`
- `inventoryItems`
- `lowStockItems`
- `lowStockCount`
- `inventoryAlerts`
- `totalOrders`
- `totalRevenue`
- `todayOrders`
- `todayRevenue`
- `preparingOrders`
- `completedOrders`
- `activeStaff`
- `staffCount`
- `todayGoodsReceipts`
- `todayStockAdjustments`
- `yesterdayRevenue`
- `thisWeekRevenue`
- `thisMonthRevenue`

## Wrong Business Rule Queries

These queries currently calculate revenue from completed orders only:

- `OrderRepository.sumRevenueByStoreAndStatus(storeId, "COMPLETED")`
- `OrderRepository.sumRevenueByStoreAndStatusAndCreatedAtBetween(storeId, "COMPLETED", start, end)`

Used by:

- `DashboardServiceImpl#getManagerSummary`
  - `totalRevenue`
  - `todayRevenue`
  - `yesterdayRevenue`
  - `thisWeekRevenue`
  - `thisMonthRevenue`

Risk:

- `COMPLETED + UNPAID` can be counted.
- `COMPLETED + REFUNDED` can be counted.
- The query does not join `payments`, so it cannot enforce the frozen Revenue Rule.

## Correct Business Rule Queries

Dashboard revenue must join orders to payments:

```sql
select coalesce(sum(o.total_amount), 0)
from orders o
join payments p on p.order_id = o.id
where o.status = 'COMPLETED'
  and p.payment_status = 'PAID'
```

For store-scoped widgets:

```sql
and o.store_id = :storeId
```

For date-ranged widgets:

```sql
and o.created_at >= :start
and o.created_at < :end
```

## Frontend Field Dependency

### Admin Dashboard UI

File:

- `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx`

Fields used:

- `totalRevenue`
- `totalOrders`
- `totalUsers`
- `totalStores`

Charts are no-data placeholders and do not consume mock revenue.

### Manager Dashboard UI

File:

- `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx`

Fields used:

- `storeName`
- `todayRevenue`
- `todayOrders`
- `preparingOrders`
- `completedOrders`
- `lowStockItems`
- `activeStaff`
- `todayGoodsReceipts`

### Manager Revenue UI

File:

- `code/frontend/src/app/[locale]/(dashboard)/manager/revenue/page.tsx`

Fields used:

- `storeName`
- `todayRevenue`
- `yesterdayRevenue`
- `thisWeekRevenue`
- `thisMonthRevenue`

### Manager Reports UI

File:

- `code/frontend/src/app/[locale]/(dashboard)/manager/reports/page.tsx`

Field used:

- `todayRevenue`

## Fields To Keep For Compatibility

Must not rename or remove:

- Admin: `totalRevenue`, `totalOrders`, `totalUsers`, `totalStores`
- Manager: `storeId`, `storeName`, `totalRevenue`, `todayRevenue`, `yesterdayRevenue`, `thisWeekRevenue`, `thisMonthRevenue`, `todayOrders`, `preparingOrders`, `completedOrders`, `lowStockItems`, `activeStaff`, `todayGoodsReceipts`

Extra fields can be added safely because existing frontend ignores unknown JSON properties.

## Mock Or Local Data

- Admin dashboard charts use no-data placeholders, not fake revenue values.
- Manager dashboard/revenue pages call real dashboard API.
- No frontend revenue calculation was found in dashboard pages.

## Required Fixes

1. Add paid-completed revenue queries that join `orders` and `payments`.
2. Replace Manager revenue fields with paid-completed revenue.
3. Replace Admin `totalRevenue` with paid-completed revenue instead of hardcoded zero.
4. Replace Admin `totalOrders` with real order count while preserving field name.
5. Add optional Admin `storeId` filter without requiring frontend UI changes.
6. Add backend coverage for paid/completed, unpaid/completed, paid/cancelled, refunded, failed/unpaid.
7. Add backend coverage for Manager store scope.
8. Add backend coverage for top products and store ranking using paid-completed revenue only.
