# Order/POS Backend V1 Implementation Report

## Scope implemented

- Added Flyway migration `V20__create_order_payment_tables.sql`.
- Created tables: `orders`, `order_items`, `order_item_toppings`, `payments`.
- Seeded permissions: `ORDER_VIEW`, `ORDER_CREATE`, `ORDER_UPDATE`, `ORDER_CANCEL`, `ORDER_COMPLETE`.
- Granted order permissions to `ADMIN`, `MANAGER`, and `STAFF`.
- Added backend module `com.lowlands.coffee.modules.order`.
- Added secured REST API under `/api/v1/orders`.
- Connected POS frontend checkout to backend order creation.

## Order flow

1. POS creates an order through `POST /api/v1/orders`.
2. Backend validates store scope, active product/category/variant/topping, and topping-product compatibility.
3. Backend recalculates item prices and order total from database prices.
4. New order is saved as `PENDING` with payment status `UNPAID`.
5. Staff/manager/admin can move order through:
   - `PENDING -> CONFIRMED`
   - `CONFIRMED -> PREPARING`
   - `PREPARING -> READY`
   - `READY -> COMPLETED`
6. Stock is deducted only on `COMPLETED`.
7. `CANCELLED` order does not deduct stock.

## Important business rules

- No stock deduction on order creation.
- No auto-complete from POS checkout.
- No payment gateway integration.
- No promotion engine integration.
- No persisted `table_number`, `tax_amount`, `service_fee`, `cash_received`, or `change_returned`.
- Backend is the source of truth for product name, size, price, subtotal, discount, and total.
- Discount is currently `0`.

## Stock completion behavior

- Completion runs in a transaction.
- Order row is loaded with pessimistic lock.
- Completion requires status `READY`.
- Completion is idempotent if the order is already `COMPLETED` and stock movements already exist.
- Missing active recipe returns `409 Conflict`.
- Insufficient ingredient stock returns `409 Conflict`.
- Stock deduction writes `stock_movements` with:
  - `movement_type = OUT`
  - `reference_type = ORDER`
  - `reference_id = order.id`

## API endpoints

- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`
- `GET /api/v1/orders/code/{orderCode}`
- `POST /api/v1/orders/{id}/confirm`
- `POST /api/v1/orders/{id}/prepare`
- `POST /api/v1/orders/{id}/ready`
- `POST /api/v1/orders/{id}/cancel`
- `POST /api/v1/orders/{id}/complete`

## Frontend integration

- `order.service.ts` now calls backend `/orders`.
- POS sends product variant ids, topping ids, store id, order type, payment method, and note.
- POS receipt uses backend `orderCode`.
- POS no longer applies mock promotion or service fee to the submitted total.
- Admin/manager order dashboards understand statuses `confirmed` and `ready`.

## Verification

- Backend compile/package: `mvn -DskipTests package` passed.
- Backend app startup with Neon passed.
- Neon Flyway migration ran from schema version `19` to `20`.
- Frontend type-check: `npm run type-check` passed.
- Frontend Jest: `npm test -- --runInBand` passed, 3 suites / 9 tests.

## Test caveat

Full backend `mvn test` is currently blocked by the existing Mockito inline mock maker on JDK 25. The Spring Boot context test still booted successfully, Flyway applied all 20 migrations on H2, and compile/package passed. The failing tests are the existing Mockito-based `ProductServiceImplTest` cases, failing before test logic because the JVM cannot self-attach the Byte Buddy agent.
