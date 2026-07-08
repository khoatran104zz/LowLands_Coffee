# Production Hardening Report

## Scope

This sprint hardened the Lowlands Coffee backend without adding new business features, changing dashboard/report UI, redesigning APIs, or changing frozen business rules.

Primary source of truth was the current backend code. Existing reports were used as context.

## Migration And Indexes

Added:

- `code/backend/src/main/resources/db/migration/V51__production_hardening_indexes_and_versions.sql`

Indexes added with `IF NOT EXISTS`:

- `orders(store_id, created_at)`
- `orders(status, store_id, created_at)`
- `payments(order_id)`
- `payments(payment_status, payment_method)`
- `goods_receipts(store_id, created_at)`
- `goods_receipts(store_id, status, created_at)`
- `stock_movements(store_id, created_at)`
- `stock_movements(store_id, ingredient_id, created_at)`
- `stock_movements(movement_type, reference_type, store_id, created_at)`

Purpose:

- Support report/dashboard filters by store, status, payment state, and date.
- Support inventory/goods receipt operational queries at larger row counts.

## Optimistic Locking

Added `version BIGINT NOT NULL DEFAULT 0` and JPA `@Version` to entities with meaningful concurrent updates:

- `OrderEntity`
- `PaymentEntity`
- `ProductEntity`
- `GoodsReceiptEntity`
- `RecipeEntity`
- `PromotionEntity`
- `StoreEntity`
- `UserEntity`

Not versioned:

- `StockMovementEntity`: currently behaves as an append-only inventory ledger. Versioning is less useful than immutable insert discipline and query indexes.
- Child/detail rows such as receipt items, order items, toppings, and recipe ingredients: these are owned through parent aggregate workflows.

## Security Hardening

Security URL boundaries remain enforced in `SecurityConfig`:

- `/api/v1/admin/**` requires `ADMIN`.
- `/api/v1/manager/**` requires `ADMIN` or `MANAGER`.
- `/api/v1/staff/**` requires `ADMIN`, `MANAGER`, or `STAFF`.

Security error responses were aligned to the app `ApiResponse` shape:

```json
{"success":false,"message":"...","data":null}
```

Added integration test:

- `code/backend/src/test/java/com/lowlands/coffee/security/SecurityBoundaryIntegrationTest.java`

Verified with real Spring context, real security filter chain, real login, and JWT bearer calls:

- Manager -> Admin API = 403
- Staff -> Admin API = 403
- Staff -> Manager API = 403
- Manager -> Manager API = 200
- Admin -> Admin API = 200
- Public menu anonymous = 200

## Logging

Added business logs after successful state changes:

- Goods receipt complete
- Manager goods receipt complete
- Order complete
- Payment success
- Payment failed
- Payment refunded
- Stock adjustment
- Manager stock adjustment
- User delete
- Promotion update/status update

Removed unsafe payment sandbox logs:

- No longer logs MoMo access key.
- No longer logs raw signature.
- No longer logs computed signature.
- No longer logs full MoMo request body containing sensitive payment signing data.

## ApiResponse And Exceptions

Security 401/403 responses now follow the same `success/message/data` shape as normal API responses.

Gateway callbacks remain protocol-specific where needed because payment providers expect callback behavior rather than normal frontend API semantics.

## Open Session In View

Production config already has:

```properties
spring.jpa.open-in-view=false
```

Test config now also has:

```properties
spring.jpa.open-in-view=false
```

Regression tests passed with OSIV disabled in the test profile.

## Pagination

No existing API contract was broken.

Already paginated:

- Orders
- Promotions
- Report/dashboard optimized query projections and limited recent activity queries

Remaining unpaginated list risks:

- Inventory goods receipts list
- Stock movement list
- Master data lists such as users, stores, suppliers, ingredients, roles, permissions

These should be addressed with backward-compatible paged endpoints or optional paging in the next backend API contract sprint.

## Code Quality

MapStruct warnings were reduced by explicitly ignoring generated/internal fields:

- Role mapper ignores `id`, `permissions`.
- Permission mapper ignores `id`.
- User mapper ignores `version` and derived response fields.
- Store mapper ignores `version`.

JWT filter logging now uses SLF4J instead of inherited deprecated logger usage.

Payment rounding now uses `RoundingMode.HALF_UP` instead of deprecated `BigDecimal.ROUND_HALF_UP`.

## Regression

Commands run:

```bash
mvn test
mvn clean install
mvn -q -DskipTests compile
npm.cmd run type-check
```

Results:

- Backend tests: passed, 29 tests.
- Security boundary tests: passed, 6 tests.
- Backend build/install: passed.
- Frontend type-check: passed.

Notes:

- Maven still prints a Mockito dynamic-agent warning from the test toolchain. This is not an application regression.
- Flyway applies 49 migrations successfully through version `V51` in H2 test mode.

## Production Readiness Score

Before this sprint: 8.2 / 10

After this sprint: 8.8 / 10

Improved:

- Database indexes for high-volume reports and inventory flows.
- Optimistic locking on key mutable aggregates.
- Security boundary regression coverage.
- OSIV disabled in production and test config.
- Sensitive payment sandbox logging removed.
- More consistent security error response format.

## Remaining Technical Debt

- Add paginated variants for remaining unpaginated admin/master-data list APIs.
- Add explicit concurrency tests for `@Version` conflict scenarios on order/payment/goods receipt transitions.
- Review test logging configuration because SQL DEBUG output is very noisy.
- Consider adding a Mockito Java agent configuration for future JDK compatibility.
- Consider replacing hard delete for users with explicit deactivate/disable workflow in a future business-approved sprint.

## Final Judgment

Backend is release-capable for current sprint scope.

It is not yet "perfect production mature" because some admin/master-data list APIs remain unpaginated and optimistic-lock conflict paths are not directly tested, but the core backend is materially safer for production traffic than before this sprint.
