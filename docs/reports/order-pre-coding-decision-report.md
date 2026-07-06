# Order Pre-Coding Decision Report

## 1. Decisions Finalized

Order status:

```text
PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED
```

Allowed transitions:

```text
PENDING -> CONFIRMED
PENDING -> CANCELLED
PENDING -> COMPLETED if POS fast-pay is approved

CONFIRMED -> PREPARING
CONFIRMED -> CANCELLED
CONFIRMED -> COMPLETED if POS fast-pay is approved

PREPARING -> READY
PREPARING -> CANCELLED
PREPARING -> COMPLETED if POS fast-pay is approved

READY -> COMPLETED
READY -> CANCELLED

COMPLETED -> terminal
CANCELLED -> terminal
```

Order type:

```text
DELIVERY
PICKUP
DINE_IN
TAKEAWAY
```

Payment method:

```text
CASH
BANKING
MOMO
CARD
```

Payment status:

```text
UNPAID
PAID
FAILED
REFUNDED
```

Complete order:

- `POST /api/v1/orders/{id}/complete` must be idempotent.
- Completing an order creates stock `OUT` movements once only.
- Repeated complete returns current `OrderResponse` when existing `OUT` movements exist for `reference_type = ORDER` and `reference_id = order.id`.
- `COMPLETED` order without matching `OUT` movement is abnormal data state and should return `409 Conflict` with operational logging.
- Complete order must run in one transaction.

Pricing/cash/table:

- No promotion engine in V1.
- `discountAmount = 0`.
- `taxAmount = 0` if no DB column exists.
- `serviceFee = 0` if no DB column exists.
- `totalAmount = subtotal`.
- `cashReceived` and `changeReturned` are not persisted in V1.
- `tableNumber` is optional/future because DB has no dedicated column.

## 2. Files Updated

- `docs/order-business-analysis.md`
- `docs/order-technical-design.md`
- `docs/api-contract/order-api.md`
- `docs/DB-erd/database-note.md`
- `docs/DB-erd/coffee-shop-management.dbml`

No backend code, migration, entity, repository, service, controller, or frontend UI file was changed.

## 3. DB Changes Needed Later

Future Flyway migration/check constraints should include:

- Order status values: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`.
- Order type values: `DELIVERY`, `PICKUP`, `DINE_IN`, `TAKEAWAY`.

Future optional columns, only after approval:

- `orders.table_number`
- `orders.tax_amount`
- `orders.service_fee`
- `payments.cash_received`
- `payments.change_returned`
- `orders.cancel_reason`

No migration is created in this pre-coding decision step.

## 4. Permission Changes Needed Later

Seed/update these permission codes in a future approved migration:

```text
ORDER_VIEW
ORDER_CREATE
ORDER_UPDATE
ORDER_CANCEL
ORDER_COMPLETE
```

Role scope:

- ADMIN: full order permissions across all stores.
- MANAGER: manage orders in assigned stores.
- STAFF: create, update, complete, and cancel orders in assigned stores.
- CUSTOMER: create and view own orders in a later customer-order sprint.

`ORDER_COMPLETE` must be separate from `ORDER_UPDATE` because completion deducts stock. `ORDER_CANCEL` must be separate from generic update because cancellation is a business transition.

## 5. API Contract Changes

- `POST /api/v1/orders/{id}/complete` now requires `ORDER_COMPLETE`.
- `POST /api/v1/orders/{id}/cancel` now requires `ORDER_CANCEL`.
- Backend contract uses uppercase enum values only.
- Frontend mapping documented:
  - `cod` -> `CASH`
  - `bank_transfer` -> `BANKING`
  - `e_wallet` -> `MOMO` or `CARD`
  - `dine_in` -> `DINE_IN`
  - `takeaway` -> `TAKEAWAY`
- `tableNumber` is optional/future, not required in V1.
- `cashReceived` is optional display input and is not persisted in V1.
- Response can expose `taxAmount = 0` and `serviceFee = 0` for compatibility, but DB persistence is not required.

## 6. Risks Before Coding

- POS still hardcodes `storeId = 2`; backend implementation needs authenticated staff store resolution.
- POS fast-pay workflow still needs product owner approval on whether UI auto-calls complete after create.
- Future migration must align DB constraints with documented enum values.
- Existing inventory design has no unit conversion; recipe ingredient unit must match ingredient stock unit.
- There is no DB-level idempotency marker for order deduction. Implementation must use transaction locking and existing `stock_movements` reference checks.
- No dedicated `table_number`, tax/service fee, or cash fields exist yet; V1 must not require them.

## 7. Ready / Not Ready For Coding

Order Module is ready for backend coding with the current V1 scope:

- Create order.
- List/detail order.
- Status transition APIs.
- Cancel order.
- Complete order with transactional, idempotent stock `OUT`.

Remaining items are not blockers for core Order V1 coding if the implementation follows the documented constraints:

- Create approved Flyway migration/permission seed during the coding sprint.
- Keep table number, cash fields, tax/service fee persistence, promotion engine, payment gateway, and table management out of V1 unless separately approved.
