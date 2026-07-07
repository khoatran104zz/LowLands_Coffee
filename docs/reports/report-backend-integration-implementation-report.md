# Report Backend Integration Implementation Report

## Backend Files Added/Changed

- Added `code/backend/src/main/java/com/lowlands/coffee/modules/report/controller/AdminReportController.java`
- Added `code/backend/src/main/java/com/lowlands/coffee/modules/report/controller/ManagerReportController.java`
- Added `code/backend/src/main/java/com/lowlands/coffee/modules/report/dto/response/ReportResponses.java`
- Added `code/backend/src/main/java/com/lowlands/coffee/modules/report/service/ReportService.java`
- Added `code/backend/src/main/java/com/lowlands/coffee/modules/report/service/impl/ReportServiceImpl.java`
- Added `code/backend/src/test/java/com/lowlands/coffee/modules/report/ReportServiceIntegrationTest.java`

## Frontend Files Added/Changed

- Added `code/frontend/src/services/report.service.ts`
- Changed `code/frontend/src/components/admin/ReportsContainer.tsx`

## APIs Added

Admin report APIs:

- `GET /api/v1/admin/reports/revenue`
- `GET /api/v1/admin/reports/orders`
- `GET /api/v1/admin/reports/payments`
- `GET /api/v1/admin/reports/inventory`
- `GET /api/v1/admin/reports/goods-receipts`
- `GET /api/v1/admin/reports/ingredient-consumption`

Manager report APIs:

- `GET /api/v1/manager/reports/revenue`
- `GET /api/v1/manager/reports/orders`
- `GET /api/v1/manager/reports/payments`
- `GET /api/v1/manager/reports/inventory`
- `GET /api/v1/manager/reports/goods-receipts`
- `GET /api/v1/manager/reports/ingredient-consumption`

Supported query params:

- Common: `fromDate`, `toDate`, `keyword`
- Admin only: `storeId`
- Orders: `orderStatus`
- Payments: `paymentMethod`

All APIs return `ApiResponse<T>`.

## Permission Model

- Admin and manager report read endpoints require `REPORT_VIEW`.
- Manager endpoints resolve the current manager store from `ManagerStoreContextService`.
- Manager requests do not accept `storeId` from frontend, so managers cannot switch to another store through query params.

## Business Rules Implemented

- Revenue is counted only when order status is `COMPLETED` and payment status is `PAID`.
- Completed but unpaid, failed, or refunded payments are excluded from revenue.
- Cancelled orders are excluded from revenue even if payment status is `PAID`.
- Admin report APIs can filter by all stores or one store.
- Manager report APIs are scoped to the manager assigned store.
- Inventory report reads stock ledger movements and current stock balances from inventory repositories.
- Goods receipt report counts completed receipt value separately from total receipt rows.
- Ingredient consumption report uses `OUT` stock movements with `referenceType = ORDER`.

## Product/UI Integration Flow

- `ReportsContainer` no longer uses raw operational services as the report source of truth.
- Frontend calls `report.service.ts`, which unwraps `ApiResponse.data`.
- Backend returns ready-to-render `summary`, `chart`, and `rows` for each tab.
- Frontend still owns presentation, tab state, filter state, and export button UI.
- Existing export logging endpoint remains in place; real Excel/PDF generation is not implemented in this phase.

## Test Result

- `mvn -q -DskipTests compile`: passed.
- `mvn -q test`: passed.
- `mvn -q clean install`: passed.
- `npm.cmd run type-check`: passed.
- Conflict marker scan for `code` and `docs`: passed.

`mvn spring-boot:run` was not run in this pass because the default application config requires real PostgreSQL/JWT environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`). The H2/Flyway integration tests verified the backend report code path.

## Remaining Issues

- Report service currently uses repository `findAll()` plus in-memory aggregation. This is acceptable for V1 correctness but should be replaced with query-level aggregation before large production data.
- Real Excel/PDF export is still out of scope.
- Staff performance, customer loyalty, and promotion reports are still out of scope.
- UI copy is partially hardcoded in the report component and can be moved to i18n keys later.

## Next Steps

- Add query-level aggregation repositories for large datasets.
- Add controller-level tests for report endpoint permissions and manager scoping.
- Implement real export generation when the report data contracts stabilize.
