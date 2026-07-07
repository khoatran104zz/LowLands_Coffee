# Report Backend Integration Gap Report

## Scope

Audit current Reports UI and backend before implementing Report V1 integration.

No code was changed before this report.

Report V1 scope:

- Revenue Report
- Order Report
- Payment Report
- Inventory Report
- Goods Receipt Report
- Ingredient Consumption Report

Out of scope:

- Staff Performance Report
- Customer Loyalty Report
- Promotion Report
- Real Excel/PDF export
- Large UI redesign

## Current UI Tabs And Pages

Pages:

- `code/frontend/src/app/[locale]/(dashboard)/admin/reports/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/manager/reports/page.tsx`

Both pages render:

- `code/frontend/src/components/admin/ReportsContainer.tsx`

Current tabs:

- Revenue
- Orders
- Inventory
- Payment
- Goods Receipt
- Ingredient Consumption

The UI shell already includes:

- date quick ranges;
- custom `startDate` / `endDate`;
- Admin store filter;
- payment method filter;
- order status filter;
- keyword filter;
- chart cards;
- summary metric cards;
- detail tables;
- export buttons.

This layout is reusable and should be kept.

## Current Frontend Services

`ReportsContainer` currently calls raw operational APIs:

- `getOrders({ page: 0, size: 2000 })`
- `getStores()`
- `getGoodsReceipts()`
- `getStockBalances()`
- `getStockMovements()`
- `axiosInstance.post("/reports/export", ...)`

No dedicated report read service exists.

Missing frontend service:

- `code/frontend/src/services/report.service.ts`

## Current Backend APIs

Existing report module:

- `code/backend/src/main/java/com/lowlands/coffee/modules/report/controller/ReportExportController.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/report/entity/ReportExportLogEntity.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/report/repository/ReportExportLogRepository.java`

Existing endpoint:

- `POST /api/v1/reports/export`

This endpoint only logs export intent. It does not return Excel/PDF and does not calculate report data.

Missing report read APIs:

Admin:

- `GET /api/v1/admin/reports/revenue`
- `GET /api/v1/admin/reports/orders`
- `GET /api/v1/admin/reports/payments`
- `GET /api/v1/admin/reports/inventory`
- `GET /api/v1/admin/reports/goods-receipts`
- `GET /api/v1/admin/reports/ingredient-consumption`

Manager:

- `GET /api/v1/manager/reports/revenue`
- `GET /api/v1/manager/reports/orders`
- `GET /api/v1/manager/reports/payments`
- `GET /api/v1/manager/reports/inventory`
- `GET /api/v1/manager/reports/goods-receipts`
- `GET /api/v1/manager/reports/ingredient-consumption`

## Existing Reusable Logic

Keep:

- Reports page routes.
- `ReportsContainer` layout shell.
- filter controls.
- tab structure.
- chart components:
  - `LineChart`
  - `BarChart`
  - `PieChart`
  - `HorizontalBarChart`
- `StatsCard` / `ChartCard`.
- table markup where possible.
- export button UI.
- export log endpoint, but treat real export as future.

Reuse backend query patterns from Dashboard Foundation:

- paid-completed revenue joins `orders` and `payments`;
- store-scoped Manager data through `ManagerStoreContextService`;
- ledger-based stock balances from `StockMovementRepository`;
- ingredient consumption from `OUT + ORDER` stock movements.

## Wrong Frontend Calculations

Current `ReportsContainer` calculates these in the browser:

- revenue totals from `completedOrders.reduce(sum totalAmount)`;
- revenue trend from filtered completed orders only;
- revenue table grouped from orders only;
- payment method revenue from completed orders only;
- inventory opening/current/in/out/adjustment from raw balances and stock movements;
- goods receipt metrics from raw receipt list;
- ingredient consumption from stock movements.

Problems:

- Revenue does not enforce `Payment.status = PAID`.
- Refunded/failed/unpaid payments can leak into revenue reports.
- Manager reports can depend on frontend-loaded global/raw APIs if route permissions allow it.
- Reports duplicate business formulas in frontend.
- Payment Report uses `Order.paymentMethod` mapping instead of backend grouping from `payments`.
- Inventory opening/closing logic is approximated on the frontend.
- Goods Receipt and Ingredient Consumption are calculated client-side instead of through report read models.

## Dashboard API Usage

Dashboard API is not currently used as a report substitute in `ReportsContainer`.

However, Dashboard data should not be reused for Report V1 because Reports require date range and filter contracts.

## Missing APIs

Backend needs a real `modules/report` read service with:

- request/filter DTO or query params;
- Admin controller;
- Manager controller;
- response DTOs for summary, chart data, and table rows;
- repository queries or service aggregation using existing repositories.

Filters:

- `fromDate`
- `toDate`
- `storeId` for Admin only
- `paymentMethod`
- `orderStatus`
- `keyword`

Manager:

- must derive store from backend context;
- must not accept frontend `storeId` as authority.

## Backend Work Needed

Create or extend:

- `modules/report/controller/AdminReportController.java`
- `modules/report/controller/ManagerReportController.java`
- `modules/report/dto/request/ReportFilterRequest.java`
- `modules/report/dto/response/*`
- `modules/report/service/ReportService.java`
- `modules/report/service/impl/ReportServiceImpl.java`

Add query support for:

- revenue paid-completed by day/store;
- orders by status/date/store;
- payments grouped by method/status with paid-completed revenue;
- ledger inventory report rows;
- goods receipt report rows;
- ingredient consumption from stock movements `OUT` + `ORDER`.

## Frontend Work Needed

Create:

- `code/frontend/src/services/report.service.ts`

Refactor:

- `code/frontend/src/components/admin/ReportsContainer.tsx`

Frontend must:

- call report APIs per tab/filter;
- unwrap `ApiResponse.data`;
- keep current UI layout;
- not calculate revenue/order/payment/inventory as source of truth;
- not use mock/local data;
- show loading/error/empty states;
- keep export UI but no-op/log only until real export backend exists.

## Audit Conclusion

The Reports UI shell is reusable, but its current data source is not compliant with the frozen business rules because it fetches raw datasets and aggregates them in the frontend.

Report V1 requires backend read APIs and a frontend service integration that replaces client-side aggregation with backend-calculated report data.
