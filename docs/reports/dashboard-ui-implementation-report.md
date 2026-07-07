# Dashboard UI Implementation Report

## Dashboard UI Scope Implemented

Admin and Manager Dashboard were refactored into quick overview pages.

Implemented scope:

- KPI cards.
- 7-day quick charts.
- Payment breakdown.
- Top products.
- Store ranking for Admin.
- Low stock item list.
- Ingredient consumption for Manager.
- Recent operational activities.

Out of scope and left for Reports:

- Detailed daily/weekly/monthly revenue reports.
- Long report tables.
- Export Excel/PDF.
- Complex filters.
- Customer loyalty.
- Promotion reporting.
- Notification analytics.

## Admin Widgets Completed

Admin Dashboard now uses only `GET /api/v1/admin/dashboard/summary`.

Completed widgets:

- Revenue today.
- Revenue this month.
- Orders today.
- Completed orders today.
- Cancelled orders today.
- Total stores.
- Total products.
- Low stock count.
- Revenue 7 days.
- Orders 7 days.
- Payment breakdown.
- Top 5 stores.
- Top 5 products.
- Low stock items.
- Recent activities.

Removed from Dashboard:

- Client-side monthly revenue calculation from `GET /api/v1/orders`.
- Client-side branch revenue calculation from `GET /api/v1/orders`.
- Client-side best seller calculation from `GET /api/v1/orders`.
- Client-side customer growth calculation from `GET /api/v1/admin/users`.

## Manager Widgets Completed

Manager Dashboard now uses only `GET /api/v1/manager/dashboard/summary`.

Completed widgets:

- Store revenue today.
- Store revenue this month.
- Store orders today.
- Preparing orders.
- Ready orders.
- Completed orders today.
- Low stock count.
- Goods receipt today.
- Store revenue 7 days.
- Store orders 7 days.
- Payment breakdown for manager store.
- Ingredient consumption top 5.
- Top 5 products in store.
- Low stock items in store.
- Recent store activities.

Manager Dashboard no longer sends `storeId` from frontend for dashboard analytics. Store scope is derived by backend through `ManagerStoreContextService`.

## Backend Fields Added

Added to Admin summary:

- `ordersToday`
- `completedOrdersToday`
- `cancelledOrdersToday`
- `revenueTrend`
- `orderTrend`
- `lowStockItems`
- `recentActivities`

Added to Manager summary:

- `readyOrders`
- `paymentBreakdown`
- `revenueTrend`
- `orderTrend`
- `lowStockItemsList`
- `ingredientConsumption`
- `recentActivities`

Added DTOs:

- `DashboardTrendPointResponse`
- `DashboardLowStockResponse`
- `DashboardRecentActivityResponse`
- `DashboardIngredientConsumptionResponse`

## Backend Query Rules

Revenue widgets use:

```text
Order.status = COMPLETED
AND Payment.paymentStatus = PAID
```

Top products use paid completed orders and `order_items.total_price`.

Payment breakdown groups paid completed orders by payment method.

Store ranking groups paid completed revenue by store.

Low stock uses stock movement ledger balances:

```text
IN - OUT + ADJUSTMENT
```

Ingredient consumption uses:

```text
stock_movements.movement_type = OUT
AND stock_movements.reference_type = ORDER
```

Recent activities use real operational records:

- latest orders;
- latest goods receipts;
- latest stock movements.

Revenue date ranges currently use `orders.created_at`, matching the Dashboard Foundation decision. A future Finance sprint may switch formal report dates to `payments.paid_at` if business confirms that rule.

## Frontend Files Changed

- `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx`
- `code/frontend/src/services/dashboard.service.ts`

Frontend changes:

- Removed dashboard analytics based on loaded orders/users.
- Removed Manager dashboard `storeId` analytics request.
- Added typed support for new backend fields.
- Added no-data states for empty charts/lists.
- Kept existing page structure, cards, and chart card style.

## Backend Files Changed

- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/AdminDashboardSummaryResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/ManagerDashboardSummaryResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/DashboardTrendPointResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/DashboardLowStockResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/DashboardRecentActivityResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/dto/response/DashboardIngredientConsumptionResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/dashboard/service/impl/DashboardServiceImpl.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/order/repository/OrderRepository.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/inventory/repository/StockMovementRepository.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/inventory/repository/GoodsReceiptRepository.java`

## Widgets Using Existing Backend

- Admin total users/stores/products/orders/revenue.
- Admin today/month/year revenue.
- Admin payment breakdown.
- Admin top products/categories/store ranking.
- Manager store name.
- Manager today/month revenue.
- Manager order status counts.
- Manager active staff.
- Manager today goods receipts.
- Manager top products.

## Widgets Requiring New Backend Work

No separate endpoint is required for the implemented Dashboard overview.

Future Reports work should add dedicated report endpoints for:

- revenue by arbitrary date range;
- order reports by status/time/store;
- inventory reports;
- payment reports;
- formal ingredient consumption reports;
- exports.

## Test Result

Passed:

- `mvn -q -DskipTests compile`
- `mvn -q clean install`
- `npm.cmd run type-check`
- `npm.cmd run dev`

Frontend dev result:

- Port `3000` was already occupied by another Next dev server.
- Next started successfully on `http://localhost:3001`.
- The temporary dev process started for this check was stopped afterwards.

Repo hygiene:

- No conflict markers found in `code` or `docs`.
- `git diff --check` only reports line ending warnings `LF will be replaced by CRLF`.

## Remaining Issues

- Dashboard UI text should be moved into locale files in a future i18n cleanup; this sprint focused on removing mock/client-calculated analytics.
- Recent activities are composed from existing operational tables, not an audit log. A future audit module can replace this source if needed.
- Dashboard trends are fixed to 7 days. Flexible ranges belong to Reports.
- Current Dashboard revenue date uses `orders.created_at`; Finance may later choose `payments.paid_at` for formal reports.

## Conclusion

Dashboard UI now uses real backend data for the implemented overview widgets.

No mock revenue, mock order chart, or frontend revenue calculation remains in Admin/Manager Dashboard pages.

The project is ready to move detailed analytics into the future Report module.
