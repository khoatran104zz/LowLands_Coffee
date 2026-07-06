# Order Inventory Flow Verification Report

## Scope

Verified Order -> Payment -> Complete -> Inventory behavior for the current Lowlands Coffee backend and POS integration.

Out of scope: Dashboard, Promotion, Payment Gateway, fake stock, database drop, old migration edits.

## Backend Files Added or Changed

- Added `code/backend/src/test/java/com/lowlands/coffee/modules/order/OrderInventoryFlowIntegrationTest.java`.
- Changed `code/backend/src/main/java/com/lowlands/coffee/modules/order/service/impl/OrderServiceImpl.java`.
- Added `docs/reports/order-inventory-flow-gap-report.md`.
- Added `docs/reports/order-inventory-manual-test-guide.md`.
- Added `docs/reports/order-inventory-flow-verification-report.md`.

## Frontend Files Checked

- `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx`
- `code/frontend/src/services/product.service.ts`

POS already calls real product availability, marks unavailable variants, reloads availability after checkout/complete, and surfaces backend error messages through the existing error path.

## Verified Backend Behavior

- Create order stores product variant and quantity on order item.
- Pay order marks payment as `PAID`.
- Complete order moves READY order to `COMPLETED`.
- Complete order creates `stock_movements` with:
  - `movement_type = OUT`
  - `reference_type = ORDER`
  - `reference_id = order.id`
  - `quantity = recipeIngredient.quantity * orderItem.quantity`
- Inventory decreases by the exact OUT quantity.
- Completing an already completed order does not create duplicate OUT movement.
- Insufficient stock blocks completion with HTTP 409 through `OrderCompletionException`.
- Missing recipe blocks completion with `reason = MISSING_RECIPE`.
- Empty recipe blocks completion with `reason = EMPTY_RECIPE`.

## Availability Verification

Covered by integration test:

- Available product with active recipe and enough stock.
- Missing recipe -> unavailable.
- Empty recipe -> unavailable.
- Inactive ingredient -> unavailable.
- Insufficient stock -> unavailable.
- After complete depletes stock -> unavailable.

## Error Messages

Updated backend completion messages:

- `MISSING_RECIPE`: `Không thể hoàn tất đơn: sản phẩm {productName} size {size} chưa có công thức.`
- `EMPTY_RECIPE`: `Không thể hoàn tất đơn: công thức của {productName} size {size} chưa có nguyên liệu.`
- `INSUFFICIENT_STOCK`: `Không đủ nguyên liệu để hoàn tất đơn.`

Shortage details include ingredient id/name, required quantity, available quantity, and unit.

## Test Result

- `mvn -q -Dtest=OrderInventoryFlowIntegrationTest test`: PASSED.
- `mvn -q clean install`: PASSED.
- `npm.cmd run type-check`: PASSED.
- `npm.cmd run dev`: PASSED smoke test; Next.js started on `http://localhost:3001` because port `3000` already had another Next dev server running.

- `mvn -q spring-boot:run "-Dspring-boot.run.arguments=--server.port=8082"`: runtime smoke reached Tomcat initialization on port `8082`, then stopped because runtime environment variables were not configured. Root cause from log: `DB_URL` was still literal `${DB_URL}`, so PostgreSQL driver rejected it. This is a local environment configuration blocker, while test profile with H2 passes.

## Remaining Issues

- Manual browser verification for POS should still be performed against the running app.
- Backend runtime needs valid `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` environment variables before `spring-boot:run` can stay up.
- Combo inventory consumption is still outside this verification scope unless combo recipes are modeled explicitly.
- Dashboard/reporting can consume completed paid order and stock movement data, but dashboard UI/report rules are separate scope.

## Next Step

Run the manual guide in `docs/reports/order-inventory-manual-test-guide.md` on a local database and record screenshots or order ids for UAT evidence.
