# Dashboard UI Gap Report

## Scope

Audit current Admin and Manager Dashboard UI against the frozen Dashboard rules.

No code was changed before this report.

Dashboard must stay as quick overview. Detailed daily/weekly/monthly reports, long tables, export, promotion/customer loyalty, and formal BI belong to the future Reports module.

## Current Admin Dashboard Widgets

File:

- `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx`

Current widgets:

- KPI card: total revenue.
- KPI card: total orders.
- KPI card: total users/customers.
- KPI card: total stores/branches.
- Chart: monthly revenue for last 6 months.
- Chart: revenue by branch.
- Chart/list: best sellers.
- Chart: customer growth.

Data source:

- `getAdminDashboardSummary()` for KPI fields.
- `getOrders({ page: 0, size: 1000 })` for monthly revenue, branch revenue, and best sellers.
- `getUsers()` for customer growth.

Issues:

- KPI revenue uses backend summary and is aligned after Dashboard Foundation.
- Chart revenue is calculated in frontend from orders only, so it does not enforce `COMPLETED + PAID`.
- Branch revenue is calculated in frontend from orders only, so it does not enforce `COMPLETED + PAID`.
- Best sellers are calculated in frontend from completed orders only, so unpaid/refunded/failed payments can leak into the widget.
- Customer growth is operationally real, but customer analytics is outside the requested Dashboard scope for this sprint and better belongs to Customer/Reports later.
- The UI fetches a large order page only to derive dashboard analytics, which duplicates backend business rules.

## Current Manager Dashboard Widgets

File:

- `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx`

Current widgets:

- KPI card: today revenue.
- KPI card: today orders.
- KPI card: preparing orders.
- KPI card: completed orders.
- KPI card: inventory warning / low stock.
- KPI card: active staff.
- KPI card: today goods receipts.
- Chart: monthly revenue for store.
- Chart: hourly orders.

Data source:

- `getManagerDashboardSummary()` for KPI fields.
- `getOrders({ storeId: data.storeId, page: 0, size: 1000 })` for charts.

Issues:

- KPI revenue uses backend summary and is aligned after Dashboard Foundation.
- Frontend passes `storeId` from summary back into the Orders API. Manager Dashboard should derive store scope from backend context and should not use frontend-provided store id for dashboard analytics.
- Monthly revenue chart is calculated in frontend from completed orders only, so it does not enforce `COMPLETED + PAID`.
- Hourly orders chart is calculated in frontend and is more operational detail than required for quick overview.
- Manager page does not yet display backend `topProducts`.
- Manager page does not display payment breakdown, low stock item list, recent activities, or ingredient consumption.

## Backend Fields Available

Admin summary response currently has:

- `totalUsers`
- `totalStores`
- `totalProducts`
- `totalOrders`
- `totalRevenue`
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

Manager summary response currently has:

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
- `topProducts`

Existing backend revenue/top/store-ranking/payment-breakdown queries already enforce:

```text
Order.status = COMPLETED
AND Payment.paymentStatus = PAID
```

Revenue date range currently uses `orders.created_at`. Finance may later decide to switch formal revenue reports to `payments.paid_at`; that must be a future business decision.

## Missing Backend Fields Or Endpoints

Missing fields for requested Dashboard UI:

- `revenueTrend` for 7 days.
- `orderTrend` for 7 days.
- `lowStockItems`.
- `recentActivities`.
- `ingredientConsumption` for Manager.
- `readyOrders` for Manager.
- Admin today-only `completedOrdersToday` and `cancelledOrdersToday`; current `completedOrders` / `cancelledOrders` are all-time or store-filtered status counts.
- Manager `paymentBreakdown`; currently only Admin response exposes it.

Recommended simple approach:

- Extend existing summary endpoints instead of adding several small endpoints.
- Add DTOs only where needed:
  - `DashboardTrendPointResponse`
  - `DashboardLowStockResponse`
  - `DashboardRecentActivityResponse`
  - `DashboardIngredientConsumptionResponse`

## Current API Usage

Admin:

- `GET /api/v1/admin/dashboard/summary`: real summary API.
- `GET /api/v1/orders`: currently used for client-side analytics; should be removed from Dashboard.
- `GET /api/v1/admin/users`: currently used for customer growth; should be removed from Dashboard.

Manager:

- `GET /api/v1/manager/dashboard/summary`: real summary API.
- `GET /api/v1/orders?storeId=...`: currently used for client-side analytics; should be removed from Manager Dashboard.

## Widgets To Keep

Admin:

- Revenue Today.
- Revenue This Month.
- Orders Today.
- Completed Orders Today.
- Cancelled Orders Today.
- Total Stores.
- Total Products.
- Low Stock Count.
- Top 5 Products.
- Top 5 Stores / Store Ranking.
- Payment Breakdown.
- Low Stock Items.
- Recent Activities.

Manager:

- Store Revenue Today.
- Store Revenue This Month.
- Store Orders Today.
- Preparing Orders.
- Ready Orders.
- Completed Orders Today.
- Low Stock Count.
- Goods Receipt Today.
- Top 5 Products in store.
- Low Stock Items in store.
- Recent Store Activities.
- Payment Breakdown for store.
- Ingredient Consumption top 5.

## Widgets To Move To Reports

- Admin monthly revenue over 6 months.
- Admin customer growth.
- Manager monthly revenue over 6 months.
- Manager hourly orders.
- Any long report table, export, or complex filters.

## Widgets To Add

Admin:

- Revenue 7 days from backend.
- Orders 7 days from backend.
- Payment Breakdown from backend.
- Store Ranking top 5 from backend.
- Low Stock Items from ledger.
- Recent Activities from real orders, payments, goods receipts, and stock movements.

Manager:

- Revenue 7 days from backend.
- Orders 7 days from backend.
- Payment Breakdown scoped by manager store.
- Ingredient Consumption top 5 from stock movements `OUT` + `ORDER`.
- Low Stock Items scoped by manager store.
- Recent Activities scoped by manager store.

## Files To Change

Backend:

- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/AdminDashboardSummaryResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/ManagerDashboardSummaryResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/service/impl/DashboardServiceImpl.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/order/repository/OrderRepository.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/inventory/repository/StockMovementRepository.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/inventory/repository/GoodsReceiptRepository.java`
- new dashboard DTO files as needed.

Frontend:

- `code/frontend/src/services/dashboard.service.ts`
- `code/frontend/src/services/manager-dashboard.service.ts`
- `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx`

Docs:

- `docs/reports/dashboard-ui-implementation-report.md`

## Audit Conclusion

The current Dashboard UI partially uses real backend data, but it still calculates chart/top widget values from frontend-loaded orders/users. Those client-side analytics must be replaced with backend summary fields so revenue, top products, and store ranking consistently follow the frozen business rules.
