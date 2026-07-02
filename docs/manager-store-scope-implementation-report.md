# Manager Store Scope Implementation Report

Date: 2026-07-02

## Critical Risks Fixed

- Added backend `ManagerStoreContextService` so Manager APIs derive the current user and active store assignment from `SecurityContext` instead of trusting frontend `storeId`.
- Added Manager-specific Inventory and Goods Receipt request DTOs without `storeId` and `createdById`.
- Added Manager-specific API wrappers so frontend no longer calls global inventory/goods-receipt/order/shift APIs for Manager workflows.
- Removed Manager frontend fallback `currentUser?.branchId || 2`.
- Removed Manager frontend `createdById` submission for stock adjustment and goods receipt.
- Replaced Manager staff source of truth from `dashboardStore.employees` with `/api/v1/manager/staff`.

## APIs Implemented

### Manager Store Context

- `ManagerStoreContextService#getCurrentManagerStoreId`
- `ManagerStoreContextService#getCurrentManagerStore`
- `ManagerStoreContextService#validateManagerCanAccessStore`
- `ManagerStoreContextService#getCurrentUser`

Behavior:

- Current user is loaded from Spring Security context.
- Only role `MANAGER` can use Manager context.
- Manager must have an active `store_users` assignment.
- Access to another store throws 403.

### StoreUser Assignment API

Admin-only:

- `GET /api/v1/store-users`
- `GET /api/v1/stores/{storeId}/users`
- `POST /api/v1/store-users`
- `PUT /api/v1/store-users/{id}`
- `PATCH /api/v1/store-users/{id}/deactivate`

Rules:

- Uses `userId` and store-user assignment id, not names.
- Validates user and store existence.
- Only MANAGER/STAFF users can be assigned.
- Blocks active duplicate `userId + storeId`.
- Allows positions `MANAGER`, `CASHIER`, `BARISTA`, `STAFF`.

### Manager Inventory API

- `GET /api/v1/manager/inventory/stock-balances`
- `GET /api/v1/manager/inventory/stock-movements`
- `POST /api/v1/manager/inventory/stock-adjustments`

Rules:

- Store is always derived from manager context.
- Adjustment creator is the authenticated user.
- Stock remains ledger-based through `stock_movements`.

### Manager Goods Receipt API

- `GET /api/v1/manager/goods-receipts`
- `GET /api/v1/manager/goods-receipts/{id}`
- `POST /api/v1/manager/goods-receipts`
- `PUT /api/v1/manager/goods-receipts/{id}`
- `POST /api/v1/manager/goods-receipts/{id}/complete`

Rules:

- Store is always manager store.
- Created/updated user is authenticated user.
- Manager can only read/update/complete receipts from their store.
- Complete is idempotent when receipt is already completed and IN movements exist.
- Completed receipt without IN movement returns conflict.

### Manager Staff API

- `GET /api/v1/manager/staff`
- `GET /api/v1/manager/staff/{id}`

Rules:

- Returns active store assignments for MANAGER/STAFF only.
- Does not return ADMIN/CUSTOMER or other-store users.
- Does not modify roles/permissions.

### Manager Order Wrapper

- `GET /api/v1/manager/orders`
- `GET /api/v1/manager/orders/{id}`
- `POST /api/v1/manager/orders/{id}/confirm`
- `POST /api/v1/manager/orders/{id}/cancel`

Rules:

- Store filter is derived from manager context.
- Existing order service enforces store scope and normalizes lowercase filters.

### Manager Shift Wrapper

- `GET /api/v1/manager/shifts`
- `POST /api/v1/manager/shifts`
- `PUT /api/v1/manager/shifts/{id}`
- `DELETE /api/v1/manager/shifts/{id}`

Rules:

- Store is derived from manager context.
- Staff assignment validation remains backend-side.

### Manager Dashboard

Updated `GET /api/v1/manager/dashboard/summary`:

- Added `storeName`
- Added `lowStockCount`
- Added `inventoryAlerts`
- Added `todayStockAdjustments`
- Added `staffCount`
- Added `@PreAuthorize("hasAuthority('REPORT_VIEW')")`

## Permissions / Migrations

Added new migration only:

- `V25__add_manager_report_permission.sql`

Adds:

- `REPORT_VIEW`
- Grants `REPORT_VIEW` to ADMIN and MANAGER.

Existing `SHIFT_MANAGE` was kept to avoid breaking the current shift module.

## Backend Files Changed

- Dashboard controller/DTO/service
- Inventory service/interface/repositories
- Shift service/interface

Backend files added:

- Manager inventory/goods receipt/order/shift/staff controllers
- Manager inventory/goods receipt request DTOs
- StoreUser assignment DTOs/controller/service
- ManagerStoreContextService
- `V25__add_manager_report_permission.sql`

## Frontend Files Changed

Manager-specific services added:

- `manager-dashboard.service.ts`
- `manager-inventory.service.ts`
- `manager-goods-receipt.service.ts`
- `manager-staff.service.ts`
- `manager-order.service.ts`
- `manager-shift.service.ts`

Manager pages integrated:

- Dashboard
- Orders
- Inventory stock
- Goods receipts
- Stock history
- Staff
- Shifts
- Revenue
- Reports

Frontend no longer sends `storeId` or `createdById` in Manager inventory/goods receipt requests.

## Test Results

Passed:

- `mvn -q -DskipTests compile`
- `npm.cmd run type-check`

Partial / blocked:

- `mvn clean install` compiles main/test sources, then fails during test Flyway migration on existing `V24__create_shifts.sql`.
- Cause: H2 test database does not support PostgreSQL `ON CONFLICT (code) DO NOTHING`.
- This is an existing migration compatibility issue, and old migrations were not changed per instruction.

Frontend dev:

- `npm.cmd run dev` detected an existing Next dev server at `http://localhost:3000` with PID `11044`.
- A second server was not started because Next reported another dev server already running for the same project.

Not run:

- `mvn spring-boot:run` was not started after the `mvn clean install` Flyway blocker, to avoid masking the migration issue with a long-running process.

## Remaining Issues

- Manager staff status/position PATCH endpoints were not added because the request marked them optional and the UI can display real staff without mutating roles/permissions.
- Manager goods receipt delete was not implemented because the requested Manager Goods Receipt API did not include delete. The Manager UI no longer wires a delete action.
- `mvn clean install` needs either H2-compatible migration handling or PostgreSQL-backed tests for existing migration `V24`.
- Some existing UI text still contains old encoding artifacts; this implementation avoided broad UI copy rewrites.

## Next Recommended Sprint

1. Add integration tests for Manager inventory/goods receipt/store-scope with PostgreSQL-compatible test DB.
2. Add optional Manager Staff `PATCH /status` and `PATCH /position` if business approves.
3. Normalize shift permissions from `SHIFT_MANAGE` to action-level CRUD through a new migration.
4. Add richer Manager report endpoints beyond dashboard summary.
