# Backend Production Readiness Report

## Scope

This sprint audited the Lowlands Coffee backend core for production readiness.

No feature, UI, dashboard, report, Excel, or business-rule redesign was performed.

Primary sources reviewed:

- `docs/`
- `docs/reports/`
- `docs/api-contract/`
- `code/backend/src/main/java`
- `code/backend/src/main/resources`
- `code/backend/src/test`

## Architecture

The backend follows the documented modular layered architecture:

- `common`
- `config`
- `security`
- `modules/{module}/controller`
- `modules/{module}/dto`
- `modules/{module}/entity`
- `modules/{module}/repository`
- `modules/{module}/service`
- `modules/{module}/mapper`

Healthy findings:

- Controllers delegate to services and do not directly call repositories.
- Services own business workflows.
- Repositories are Spring Data/JPA focused.
- Public DTOs are separated from entities.
- No duplicate Java filenames were detected in backend source.
- No unresolved conflict markers were detected.

Architecture risks:

- `ManagerStoreContextService` intentionally returns `StoreEntity` and `UserEntity` for internal service use. This is acceptable inside the service layer but should not leak to controllers.
- Dashboard/report modules depend on operational repositories. This is acceptable for current read-model scope, but a future BI/read-model package may be cleaner if query volume grows.
- Some modules still expose unpaginated admin list APIs. Changing those APIs would change contracts, so this sprint did not redesign them.

## Spring Boot

Healthy findings:

- Controllers use `@RestController`.
- Services use `@Service`.
- Repository interfaces extend Spring Data repositories or use `@Repository`.
- Configuration classes use `@Configuration` or `@ConfigurationProperties`.
- Request DTOs use Jakarta Bean Validation.
- Global exception handling is centralized in `GlobalExceptionHandler`.
- Method security is enabled through `@EnableMethodSecurity`.

Fixes applied:

- Tightened URL-level role boundary in `SecurityConfig`:
  - `/api/v1/admin/**` now requires `ADMIN`.
  - `/api/v1/manager/**` now requires `ADMIN` or `MANAGER`.
  - `/api/v1/staff/**` remains available to `ADMIN`, `MANAGER`, and `STAFF`.

This aligns the HTTP security layer with the business rule that staff must not enter Admin APIs and managers must use manager-scoped APIs.

Remaining notes:

- Method-level `@PreAuthorize` still performs permission checks per endpoint.
- `spring.jpa.open-in-view` currently uses Spring Boot default behavior and logs a warning. Recommend explicitly setting `spring.jpa.open-in-view=false` in a future hardening sprint after verifying lazy mapping paths.

## Performance

Healthy findings:

- Report backend no longer uses report-wide `findAll()` aggregation.
- Order APIs use pagination.
- Promotion listing uses pagination.
- Dashboard recent activity uses limited queries.
- Important high-volume report queries are DB-backed aggregates/projections.
- Inventory stock balances are calculated by grouped repository queries rather than service-side full aggregation.

Risks remaining:

- Admin inventory/goods receipt movement list APIs still expose unpaginated lists:
  - `InventoryServiceImpl.findGoodsReceipts`
  - `InventoryServiceImpl.findStockMovements`
- Several master-data list APIs use `findAll().stream()`. This is acceptable for smaller master data, but not ideal if product/user/store counts become large.
- Some repositories use `@EntityGraph` to avoid N+1, but still load full entity graphs for list APIs.

Recommended next work:

- Add pagination to high-volume inventory/goods receipt list APIs in a contract-compatible V2 or with optional page parameters.
- Add production composite indexes listed in the Database section.
- Run `EXPLAIN ANALYZE` against production-like PostgreSQL data for report/dashboard/order/inventory queries.

## Security

Healthy findings:

- JWT authentication is centralized in `JwtAuthenticationFilter`.
- Passwords use BCrypt.
- Admin/manager/staff APIs have role-level route boundaries after this sprint.
- Manager scoped endpoints derive store scope from backend context.
- Manager report/inventory/order/goods receipt APIs do not trust frontend `storeId`.
- Product upload API does not expose MinIO secrets.

Fixes applied:

- Staff can no longer pass the URL-level `/api/v1/admin/**` matcher.
- Managers can no longer pass the URL-level `/api/v1/admin/**` matcher and must use `/api/v1/manager/**` for scoped operations.

Remaining risks:

- Public sandbox payment create endpoints are intentionally permitted for current integration flow. Before real payment production, gateway signature/callback design must be revisited.
- Security regression tests for role boundaries are not yet present.
- JWT invalid-token handling logs only the validation failure message, not the full token or secret. This is safe, but observability can be improved with request correlation.

## Transaction

Healthy findings:

- Write-heavy services use `@Transactional`:
  - Order
  - Payment
  - Sandbox payment
  - Inventory/goods receipt
  - Recipe
  - Product
  - Promotion
  - User/store/role/permission
- Read methods are commonly marked `@Transactional(readOnly = true)`.
- Order completion and goods receipt completion are transactional and write stock movements inside the same service workflow.
- Goods receipt completion is idempotency-aware for manager completion.

Remaining risks:

- Notification creation is called inside inventory transaction workflows. If notification persistence fails, it can roll back the business operation. Decide whether notification should be best-effort/outbox in a future sprint.
- No optimistic locking `@Version` fields exist on mutable high-value entities such as orders, payments, goods receipts, stock movements, and products.

## Database

Healthy findings:

- Flyway is used.
- Core tables have foreign keys, unique constraints, check constraints, and many supporting indexes.
- Existing useful indexes include:
  - `orders(store_id)`
  - `orders(status)`
  - `orders(created_at)`
  - `payments(payment_status)`
  - `goods_receipts(store_id)`
  - `goods_receipts(status)`
  - `stock_movements(store_id, ingredient_id)`
  - `stock_movements(reference_type, reference_id)`
  - `stock_movements(created_at)`

Indexes suggested for production follow-up:

- `orders(store_id, created_at)`
- `orders(status, store_id, created_at)`
- `payments(order_id)`
- `payments(payment_status, payment_method)`
- `goods_receipts(store_id, created_at)`
- `goods_receipts(store_id, status, created_at)`
- `stock_movements(store_id, created_at)`
- `stock_movements(store_id, ingredient_id, created_at)`
- `stock_movements(movement_type, reference_type, store_id, created_at)`

Schema risks:

- No `@Version` optimistic lock columns.
- Audit fields are present on many entities, but there is no central auditing base class or Spring Data auditing.
- Some old migrations and docs have encoding/mojibake in seeded Vietnamese text. This is data/document quality, not a core runtime blocker.

No migration was added in this sprint because the request asked to audit and propose missing database hardening without changing business behavior.

## API

Healthy findings:

- Controllers consistently return `ApiResponse` or `ResponseEntity` for redirect/IPN cases.
- No controller was found returning JPA entities directly.
- Request validation exists across the main request DTOs.
- Swagger/OpenAPI config is present.
- Order and promotion list APIs have pagination.
- Error responses are centralized.

API risks:

- Some list endpoints return unpaginated `List<T>` for admin/master data and inventory. This is usable now but not ideal for large datasets.
- Error shape from security entry point is raw JSON with `status/message`, while application errors use `ApiResponse`. Recommend unifying in a later compatibility pass.
- Some public payment callback endpoints use gateway-specific response shapes; this is acceptable for gateway protocol compatibility.

## Logging

Healthy findings:

- No `System.out.println` or `printStackTrace` usage was found in backend source.
- Global exception handling logs unexpected exceptions.
- JWT validation failure avoids logging token content.

Fixes applied:

- `SandboxPaymentController` now logs VNPay IPN rejection/failure paths before returning gateway-compatible response codes.

Remaining risks:

- Business-event logging is limited. High-impact operations such as refund, order completion, stock adjustment, user disable, and goods receipt completion should eventually emit structured audit events.
- No correlation/request ID logging is configured.

## Code Quality

Healthy findings:

- No unresolved conflict markers.
- No duplicate backend Java filenames found.
- No direct entity responses from controllers found.
- Most service methods have clear transactional boundaries.

Warnings observed:

- MapStruct unmapped target warnings for `RoleMapper`, `UserMapper`, and `PermissionMapper`.
- Deprecated API warning in `SandboxPaymentServiceImpl`.
- Mockito dynamic agent warning in tests.

Technical debt:

- Some DTO/mapper warnings are intentional today but should be made explicit with `@Mapping(ignore = true)` or stricter mapper policy.
- Several modules use manual mappers while others use MapStruct. This is acceptable but inconsistent.
- Some comments/seeded strings contain mojibake.

## Changes Made

Backend files changed:

- `code/backend/src/main/java/com/lowlands/coffee/security/SecurityConfig.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/controller/SandboxPaymentController.java`

Documentation added:

- `docs/reports/backend-production-readiness-report.md`

## Test Result

Passed:

- `mvn -q -DskipTests compile`
- `mvn clean install`
- `mvn test`
- `npm.cmd run type-check`

Backend test summary:

- `mvn clean install`: build success, 23 tests passed.
- `mvn test`: build success, 23 tests passed.

Frontend type-check:

- `tsc --noEmit` passed.

Observed non-failing warnings:

- MapStruct unmapped target warnings.
- Spring Boot test warning for `spring.jpa.open-in-view`.
- Mockito dynamic agent warning.

## Remaining Risks

- No dedicated security tests for URL role boundary and method-level permissions.
- No optimistic locking for concurrent updates.
- Inventory/goods receipt list APIs are still unpaginated.
- Composite indexes for high-volume operational/report queries are proposed but not yet migrated.
- Notification side effects are inside transactional business flows.
- Payment sandbox is not a real gateway production integration.
- Security error response shape differs from `ApiResponse`.
- No centralized audit log for high-impact business actions.

## Production Readiness Score

Score: **82/100**

Breakdown:

- Architecture: 86/100
- Spring Boot correctness: 88/100
- Repository/performance: 78/100
- Database: 80/100
- API consistency: 82/100
- Security: 84/100
- Transactions: 84/100
- Logging/observability: 72/100
- Code quality: 80/100
- Test confidence: 82/100

## Release Assessment

Backend is **conditionally ready for release** for the current V1 business scope.

Release is acceptable if:

- Traffic volume is moderate.
- Payment remains sandbox/current V1 flow.
- Inventory/report high-volume indexes are scheduled before heavy production data.
- Operations accept the current observability level.

Release should wait if:

- The deployment expects large inventory/report datasets immediately.
- Real payment settlement is required.
- Strict audit/compliance is required.
- Concurrent admin editing is expected at high volume.

## Recommended Next Sprint

Production Hardening Sprint:

1. Add composite index Flyway migration for order/payment/inventory/goods receipt query paths.
2. Add security integration tests for Admin/Manager/Staff/Public route boundaries.
3. Add pagination to high-volume inventory and goods receipt list APIs.
4. Add optimistic locking to orders, payments, goods receipts, products, and stock-sensitive entities.
5. Add structured audit events for refund, order complete, goods receipt complete, stock adjustment, and user status changes.
6. Explicitly configure `spring.jpa.open-in-view=false` after mapper/lazy loading verification.
7. Normalize security error response shape with the existing `ApiResponse` contract where possible.
