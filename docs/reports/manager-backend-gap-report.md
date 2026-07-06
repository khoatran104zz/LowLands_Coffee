# Manager Backend Gap Report

Date: 2026-07-02

## Scope

Phase 1 audit for the new Manager experience. This report intentionally does not change application code yet because the current code has a large contract gap between Manager UI, backend APIs, permissions, and store-scope rules.

Primary rule from the request: Manager is not a smaller Admin. Manager data must be scoped to the active assigned store through backend logic, not by frontend filtering or hardcoded `storeId`.

## Documents Reviewed

- `docs/convention.md`
- `docs/system-business-domain-analysis.md`
- `docs/system-business-flow.md`
- `docs/system-module-relationship.md`
- `docs/system-permission-matrix.md`
- `docs/admin-implementation-report.md`
- Backend modules under `code/backend/src/main/java/com/lowlands/coffee/modules`
- Backend migrations under `code/backend/src/main/resources/db/migration`
- Manager UI under `code/frontend/src/app/[locale]/(dashboard)/manager`
- Frontend services under `code/frontend/src/services`
- Frontend stores under `code/frontend/src/store`
- `code/frontend/src/lib/axios.ts`

## Manager UI Pages Found

| Page | File | Current data source | Store-scope status |
| --- | --- | --- | --- |
| Overview | `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx` | `getManagerDashboardSummary()` | Good direction: backend endpoint is Manager-specific. |
| Orders | `code/frontend/src/app/[locale]/(dashboard)/manager/orders/page.tsx` | `getOrders({ storeId: myBranchId })` | Risk: frontend sends `storeId`; fallback `currentUser?.branchId || 2`. |
| Inventory stock | `code/frontend/src/app/[locale]/(dashboard)/manager/inventory/page.tsx` | `getStockBalances()` then client filter | High risk: global API + frontend filter + fallback branch `2`. |
| Goods receipts | `code/frontend/src/app/[locale]/(dashboard)/manager/inventory/import-notes/page.tsx` | `getGoodsReceipts()` then client filter; create sends `storeId` and `createdById` | High risk: global API + frontend filter + fallback branch `2`. |
| Stock history | `code/frontend/src/app/[locale]/(dashboard)/manager/inventory/history/page.tsx` | `getStockMovements()` then client filter | High risk: global API + frontend filter + fallback branch `2`. |
| Staff | `code/frontend/src/app/[locale]/(dashboard)/manager/staff/page.tsx` | `dashboardStore.employees`; `updateEmployee()` | High risk: user/admin-style store data, local Zustand list, fallback branch `2`. |
| Shifts | `code/frontend/src/app/[locale]/(dashboard)/manager/shifts/page.tsx` | `getShifts(myBranchId)` plus `dashboardStore.employees` | Partial backend scope exists, but frontend still passes storeId and uses fallback branch `2`. |
| Revenue | `code/frontend/src/app/[locale]/(dashboard)/manager/revenue/page.tsx` | `getManagerDashboardSummary()` | Good direction, but only summary-level data. |
| Reports | `code/frontend/src/app/[locale]/(dashboard)/manager/reports/page.tsx` | `getManagerDashboardSummary()` plus `dashboardStore.employees` | Mixed: summary is backend, staff metrics still local/global store. |

## Runtime Mock / Local State Issues

The Manager UI does not import obvious `INITIAL_*` fixtures in the audited pages, but it still uses local/Zustand state as source of truth in key workflows:

- `manager/staff/page.tsx` uses `useDashboardStore((state) => state.employees)` and `updateEmployee`.
- `manager/shifts/page.tsx` uses `dashboardStore.employees` to populate assignable staff.
- `manager/reports/page.tsx` uses `dashboardStore.employees` for branch staff metrics.
- Several pages use `currentUser?.branchId || 2`, which is effectively hardcoded store fallback.
- Inventory, stock history, and goods receipts call global APIs and filter by store in the browser.

Files that need API integration changes:

- `code/frontend/src/services/inventory.service.ts`
- `code/frontend/src/services/goods-receipt.service.ts`
- `code/frontend/src/services/order.service.ts`
- `code/frontend/src/services/shift.service.ts`
- New recommended services:
  - `code/frontend/src/services/manager-dashboard.service.ts`
  - `code/frontend/src/services/manager-inventory.service.ts`
  - `code/frontend/src/services/manager-goods-receipt.service.ts`
  - `code/frontend/src/services/manager-staff.service.ts`
  - optionally `code/frontend/src/services/manager-order.service.ts`

## Backend APIs Already Present

### Store / Store User

Present:

- `store_users` table from `V6__create_staff_stores.sql` and `V8__rename_staff_stores_to_store_users.sql`.
- `StoreUserEntity`
- `StoreUserRepository`
  - `findByStoreId`
  - `findByUserId`
  - `existsByUserIdAndStoreId`
- `StoreController` for `/api/v1/stores`.

Missing:

- Dedicated StoreUser assignment controller/API:
  - `GET /api/v1/store-users`
  - `GET /api/v1/stores/{storeId}/users`
  - `POST /api/v1/store-users`
  - `PUT /api/v1/store-users/{id}`
  - `PATCH /api/v1/store-users/{id}/deactivate`

Current assignment appears partly handled inside UserService, but there is no dedicated API contract for StoreUser management.

### Manager Dashboard

Present:

- `GET /api/v1/manager/dashboard/summary`
- `ManagerDashboardController`
- `DashboardServiceImpl.getManagerSummary(managerEmail)`

Good:

- It resolves the Manager store from active `store_users`.
- It scopes order, revenue, goods receipt, staff, and inventory counts by storeId.

Gaps:

- Response does not include `storeName`.
- Response names differ from requested contract:
  - Has `lowStockItems`, not `lowStockCount`.
  - Does not expose `inventoryAlerts`.
  - Does not expose `todayStockAdjustments`.
  - Has `activeStaff`, not `staffCount`.
- Missing explicit `@PreAuthorize` on controller method; route gate `/api/v1/manager/**` currently enforces role MANAGER, but permission-level `REPORT_VIEW` is not checked.

### Inventory

Present:

- `GET /api/v1/inventory/stock-balances`
- `GET /api/v1/inventory/stock-movements`
- `POST /api/v1/inventory/stock-adjustments`
- `InventoryServiceImpl`
- Stock balance is calculated from stock movements.

Gaps:

- No Manager-specific endpoints:
  - `GET /api/v1/manager/inventory/stock-balances`
  - `GET /api/v1/manager/inventory/stock-movements`
  - `POST /api/v1/manager/inventory/stock-adjustments`
- Current service returns all stores for stock balances and movements.
- Current adjustment request accepts `storeId` and `createdById` from frontend.
- No `ManagerStoreContextService`.
- No backend validation that Manager can only access assigned store for inventory APIs.

### Goods Receipt

Present:

- `GET /api/v1/goods-receipts`
- `GET /api/v1/goods-receipts/{id}`
- `POST /api/v1/goods-receipts`
- `PUT /api/v1/goods-receipts/{id}`
- `DELETE /api/v1/goods-receipts/{id}` currently cancels draft.
- `POST /api/v1/goods-receipts/{id}/complete`
- Complete creates stock movement `IN`.
- Completed receipts cannot be updated because `ensureDraft()` is enforced.

Gaps:

- No Manager-specific endpoints:
  - `GET /api/v1/manager/goods-receipts`
  - `GET /api/v1/manager/goods-receipts/{id}`
  - `POST /api/v1/manager/goods-receipts`
  - `PUT /api/v1/manager/goods-receipts/{id}`
  - `POST /api/v1/manager/goods-receipts/{id}/complete`
- Current create/update accept `storeId` and `createdById` from frontend.
- Current list returns all stores.
- Current `completeGoodsReceipt` is protected by draft status, so calling complete twice returns an error instead of idempotently returning the completed receipt.
- No backend validation that receipt belongs to Manager store.

### Staff

Present:

- User module and Employee module exist.
- StoreUser can link user to store.

Missing:

- `GET /api/v1/manager/staff`
- `GET /api/v1/manager/staff/{id}`
- Optional:
  - `PATCH /api/v1/manager/staff/{id}/status`
  - `PATCH /api/v1/manager/staff/{id}/position`

Current UI still uses `dashboardStore.employees`, which is not acceptable as Manager source of truth.

### Shifts

Present:

- `V24__create_shifts.sql`
- `ShiftController`
- `ShiftServiceImpl`
- `GET /api/v1/shifts`
- `POST /api/v1/shifts`
- `DELETE /api/v1/shifts/{id}`
- Service validates actor store scope through `StoreUserRepository`.

Gaps:

- No Manager-specific route prefix.
- Frontend still sends `storeId` and falls back to branch `2`.
- No `PUT /api/v1/manager/shifts/{id}`.
- Permission uses `SHIFT_MANAGE`, which does not match documented action-level CRUD convention (`SHIFT_CREATE`, `SHIFT_UPDATE`, `SHIFT_DELETE`) from `docs/convention.md`.

### Orders / Payment

Present:

- `V23__create_order_payment_tables.sql`
- `OrderController`
- `OrderServiceImpl`
- Payment entity/repository exist under order module.
- `GET /api/v1/orders` supports `storeId` filter.
- Order service has `ensureStoreScope` and order completion creates stock movement `OUT`.
- Dashboard revenue uses completed orders.

Gaps:

- No Manager-specific route:
  - `GET /api/v1/manager/orders`
  - `POST /api/v1/manager/orders/{id}/confirm`
  - `POST /api/v1/manager/orders/{id}/cancel`
  - etc.
- Frontend Manager Orders passes `storeId` from `currentUser?.branchId || 2`.
- Need verify status case mismatch: frontend filter uses lowercase statuses while backend allowed statuses are uppercase.
- Separate Payment API is not present; payment is embedded in Order flow.

## Backend APIs Needed

Highest priority:

1. `ManagerStoreContextService`
   - `getCurrentManagerStoreId()`
   - `getCurrentManagerStore()`
   - `validateManagerCanAccessStore(storeId)`
2. Manager Inventory API under `/api/v1/manager/inventory`
3. Manager Goods Receipt API under `/api/v1/manager/goods-receipts`
4. Manager Staff API under `/api/v1/manager/staff`
5. StoreUser assignment API under `/api/v1/store-users` or Admin-scoped equivalent

Secondary priority:

6. Manager Order wrapper under `/api/v1/manager/orders` to avoid frontend passing arbitrary storeId.
7. Manager Shift wrapper under `/api/v1/manager/shifts` to avoid frontend passing arbitrary storeId.
8. Manager report/revenue endpoints beyond dashboard summary.

## Backend Files To Create / Change

Recommended new backend files:

- `code/backend/src/main/java/com/lowlands/coffee/modules/store/service/ManagerStoreContextService.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/store/service/impl/ManagerStoreContextServiceImpl.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/store/controller/StoreUserController.java`
- StoreUser request/response DTOs and mapper.
- `code/backend/src/main/java/com/lowlands/coffee/modules/inventory/controller/ManagerInventoryController.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/inventory/controller/ManagerGoodsReceiptController.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/staff/controller/ManagerStaffController.java` or a manager subpackage under user/store module.
- `code/backend/src/main/java/com/lowlands/coffee/modules/order/controller/ManagerOrderController.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/shift/controller/ManagerShiftController.java`

Recommended existing backend files to change:

- `DashboardServiceImpl` and `ManagerDashboardSummaryResponse`
- `InventoryService` / `InventoryServiceImpl`
- `GoodsReceiptRepository`
- `StockMovementRepository`
- `StoreUserRepository`
- `OrderServiceImpl` only if adding Manager-specific wrappers or fixing status filter normalization.
- `SecurityConfig` only if route gates need adjustment.

Migration needed if changing permissions:

- Add a new migration only. Do not modify old migrations.
- Recommended additions: `REPORT_VIEW`, `STAFF_VIEW`, and explicit `SHIFT_CREATE`, `SHIFT_UPDATE`, `SHIFT_DELETE` if replacing `SHIFT_MANAGE`.

## Frontend Files To Change

- `manager/dashboard/page.tsx`
- `manager/orders/page.tsx`
- `manager/inventory/page.tsx`
- `manager/inventory/import-notes/page.tsx`
- `manager/inventory/history/page.tsx`
- `manager/staff/page.tsx`
- `manager/shifts/page.tsx`
- `manager/revenue/page.tsx`
- `manager/reports/page.tsx`
- `services/dashboard.service.ts`
- `services/inventory.service.ts`
- `services/goods-receipt.service.ts`
- `services/order.service.ts`
- `services/shift.service.ts`
- Add Manager-specific services listed above.

Frontend rules to enforce:

- Do not send `storeId` for Manager inventory/goods-receipt/staff APIs.
- Do not fallback to `branchId || 2`.
- Do not client-filter global API responses for Manager store scope.
- Do not use `dashboardStore.employees` as Manager staff source of truth.

## Store Scope Risks

Critical risks found:

- Frontend hardcoded fallback `currentUser?.branchId || 2` appears in orders, inventory, goods receipts, stock history, staff, shifts, and reports.
- Inventory and goods receipt backend APIs are global and rely on frontend filtering.
- Goods receipt create/update trusts `storeId` and `createdById` from the client.
- Stock adjustment trusts `storeId` and `createdById` from the client.
- Staff page can update employee through dashboard store/User API instead of a store-scoped Manager Staff API.
- Store public `GET /api/v1/stores` is open; acceptable for public store locator, but not sufficient for Manager operations.
- Manager dashboard uses active StoreUser but does not currently share this logic as a reusable context service.

## Large Conflict / Stop Point

There is a large mismatch between the requested Manager architecture and current implementation:

- Backend has some store-scope logic in Dashboard, Order, and Shift, but not in Inventory/GoodsReceipt/Staff.
- Frontend Manager pages still pass or infer storeId themselves.
- Required Manager-specific API paths do not exist for most Manager workflows.
- Permission names are partly inconsistent (`SHIFT_MANAGE` vs action-level convention).

Per the request instruction, implementation should pause here and confirm the API contract before broad edits.

## Recommended Implementation Order

1. Add `ManagerStoreContextService`.
2. Add Manager Inventory endpoints and frontend manager inventory service.
3. Add Manager Goods Receipt endpoints and frontend manager goods receipt service.
4. Add Manager Staff endpoints and replace `dashboardStore.employees` usage in Manager pages.
5. Add StoreUser assignment API.
6. Add Manager Order and Shift wrapper endpoints that infer store from Manager context.
7. Add report/revenue endpoints beyond dashboard summary.
8. Add/adjust permissions through a new migration only.

## Initial Test Baseline

Before this report, after conflict resolution:

- `mvn -q -DskipTests compile`: passed.
- `npm.cmd run type-check`: passed.

No implementation tests were run for this audit-only phase.
