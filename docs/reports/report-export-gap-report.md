# Report Export Gap Report

## Scope

This audit covers the current Report Excel export state before implementation.

Rules:

- No new business logic in export.
- No independent export queries.
- ReportService remains the report source of truth.
- Excel generation only serializes Report DTO data.

## Frontend Current State

File reviewed:

- `code/frontend/src/components/admin/ReportsContainer.tsx`
- `code/frontend/src/services/report.service.ts`

Findings:

- The `Export Excel` button is visible.
- The `Export PDF` button is visible.
- Both buttons call `handleExport`.
- `handleExport` currently sends `POST /api/v1/reports/export` only to log export intent.
- The UI shows placeholder toast: `Export file will be implemented in a later sprint.`
- No binary download is triggered.
- No filename is parsed from response headers.
- No report export service function exists in `report.service.ts`.

## Backend Current State

Files reviewed:

- `code/backend/pom.xml`
- `code/backend/src/main/java/com/lowlands/coffee/modules/report`

Findings:

- `ReportExportController` exists, but it only logs export metadata into `report_export_logs`.
- No Apache POI dependency exists in `pom.xml`.
- No Excel utility/service exists.
- No `Workbook`, `SXSSFWorkbook`, or `.xlsx` generation exists.
- No streaming download endpoint exists.
- Report APIs already exist for admin and manager.
- ReportService already produces DTOs for all six report tabs.
- Manager report endpoints already derive store scope from backend context and do not accept frontend `storeId`.

## Existing Report APIs

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

## DTO Coverage

Ready for export from existing DTOs:

- Revenue rows: date, store, revenue, order counts, average order value.
- Orders rows: order code, customer, store, amount, status, payment method/status, created time.
- Inventory rows: ingredient, opening, IN, OUT, adjustment, closing, unit.
- Goods receipt rows: receipt code, supplier, store, creator, status, amount, created time.
- Ingredient consumption rows: ingredient, consumed, current stock, unit.

DTO gaps versus requested Excel columns:

- Revenue export requests `Payment Revenue`; existing row has `revenue`. This can be serialized as the same paid-completed revenue value without recalculation.
- Orders export requests `Completed At`; current DTO has no completed timestamp. Existing database does not have a dedicated `completed_at`; the closest source is order `updated_at`, but adding that requires extending ReportService DTO/projection.
- Payment export requests payment-level rows: payment number, order number, store, method, status, amount, paid time. Current payment report rows are grouped by method/status for UI summary. To export payment-level rows, ReportService must be extended backward-compatibly with shared report detail DTO data.
- Goods receipt export requests `Total Items`; current row lacks this. ReportService can be extended backward-compatibly to include total item count from the same report query path.

## Required Backend Work

- Add Apache POI `.xlsx` dependency.
- Add reusable report export package under `modules/report/export`.
- Add Excel export service that accepts Report DTOs only.
- Add download endpoints under admin and manager report routes.
- Preserve the existing `POST /api/v1/reports/export` log endpoint for backward compatibility.
- Keep manager export scoped through ReportService manager methods.
- Keep admin export supporting optional `storeId`.

## Required Frontend Work

- Add export download functions to `report.service.ts`.
- Change `ReportsContainer` Excel button to call download endpoint.
- Keep layout unchanged.
- Show loading state and disable export while downloading.
- Use backend filename from `Content-Disposition` when available.
- Show success and failure toasts based on actual download result.
- Leave PDF button untouched or keep existing placeholder because this sprint targets Excel only.

## Testing Needs

Backend:

- Revenue export returns `.xlsx`.
- Orders export returns `.xlsx`.
- Payment export returns `.xlsx`.
- Inventory export returns `.xlsx`.
- Goods receipt export returns `.xlsx`.
- Ingredient consumption export returns `.xlsx`.
- Manager export is scoped to manager store and cannot override `storeId`.
- Admin export supports optional `storeId`.

Frontend:

- Clicking Export Excel calls backend once.
- Button disables during download.
- Download is created with `.xlsx` filename.
- Failure shows error toast.

## Implementation Constraint

Excel export must not duplicate business rules. If extra data is needed, extend the report layer and reuse the same ReportService path rather than adding independent export-only business calculations.
