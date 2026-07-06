# Payment and Order Gap Report

## Source notes

- Requested legacy docs `docs/database-note.md` and `docs/api-contract.md` are not present in the current repo.
- Current source documents used instead:
  - `docs/DB-erd/database-note.md`
  - `docs/api-contract/README.md`
  - current backend code and Flyway migrations.

## Order current state

- Backend Order module exists under `code/backend/src/main/java/com/lowlands/coffee/modules/order`.
- Entities exist:
  - `OrderEntity`
  - `OrderItemEntity`
  - `OrderItemToppingEntity`
  - `PaymentEntity`
- Repositories exist:
  - `OrderRepository`
  - `OrderItemRepository`
  - `PaymentRepository`
- APIs exist:
  - `POST /api/v1/orders`
  - `GET /api/v1/orders`
  - `GET /api/v1/orders/my`
  - `GET /api/v1/orders/track`
  - `GET /api/v1/orders/{id}`
  - `GET /api/v1/orders/code/{orderCode}`
  - `POST /api/v1/orders/{id}/confirm`
  - `POST /api/v1/orders/{id}/prepare`
  - `POST /api/v1/orders/{id}/ready`
  - `POST /api/v1/orders/{id}/cancel`
  - `POST /api/v1/orders/{id}/complete`
  - Manager wrapper:
    - `GET /api/v1/manager/orders`
    - `GET /api/v1/manager/orders/{id}`
    - `POST /api/v1/manager/orders/{id}/confirm`
    - `POST /api/v1/manager/orders/{id}/cancel`

## Order statuses

Current DB check constraint and service allow:

- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `COMPLETED`
- `CANCELLED`

Current transition service:

- `PENDING -> CONFIRMED`
- `CONFIRMED -> PREPARING`
- `PREPARING -> READY`
- `READY -> COMPLETED`
- non-terminal -> `CANCELLED`

## Payment current state

- There is no separate `modules/payment` package yet.
- Payment is currently implemented inside Order module:
  - Entity: `modules/order/entity/PaymentEntity.java`
  - Repository: `modules/order/repository/PaymentRepository.java`
  - Response DTO: `modules/order/dto/response/PaymentResponse.java`
  - Mapper: `OrderMapper#toPaymentResponse`
- No `PaymentController`.
- No `PaymentService`.
- No frontend `payment.service.ts`.

## Payment statuses and methods

Current DB check constraint allows methods:

- `CASH`
- `BANKING`
- `MOMO`
- `CARD`

Current DB check constraint allows statuses:

- `UNPAID`
- `PAID`
- `FAILED`
- `REFUNDED`

## Database payment table

`V23__create_order_payment_tables.sql` creates `payments`:

- `id`
- `order_id` with unique constraint `uk_payments_order_id`
- `payment_method`
- `payment_status`
- `amount`
- `paid_at`
- `created_at`

This supports one main payment per order in V1.

Limitations:

- No `created_by`.
- No `updated_at`.
- No `note`.
- No `refunded_at`.
- No transaction reference column.

## When payment is currently created

`OrderServiceImpl#create` always creates one payment row through `createPayment(order, request.getPaymentMethod())`.

Current behavior:

- `CASH` creates payment with `UNPAID`.
- `BANKING`, `MOMO`, and `CARD` create payment with `PAID` immediately.

This means non-cash payments are currently treated as paid during order creation without a dedicated payment action.

## When order is currently considered paid

There is no `orders.payment_status` column.

Payment state is read from `orders.payment.paymentStatus`.

Current paid behavior:

- Non-cash order create marks payment `PAID`.
- `complete()` also marks existing payment `PAID`.

## Complete order and inventory

`OrderServiceImpl#complete` currently:

- Allows completion only from `READY`.
- Locks order by `findByIdForUpdate`.
- Checks if order is already completed.
- If completed and stock movements exist, returns current order.
- If completed but stock movements are missing, throws conflict.
- Checks existing stock movements to avoid duplicate OUT movements.
- Calculates recipe ingredient requirements.
- Validates current stock.
- Creates `stock_movements` with:
  - `movement_type = OUT`
  - `reference_type = ORDER`
  - `reference_id = order.id`
- Sets order status `COMPLETED`.
- Also sets payment status `PAID`.

Idempotency:

- Inventory deduction is idempotent for completed orders with existing movements.
- Duplicate stock OUT is guarded.

Gap:

- Complete currently also marks payment as `PAID`. Payment V1 requires Pay Order and Complete Order to be separate actions.

## API already available

Order APIs:

- Create/list/detail/track.
- Status transitions.
- Manager store-scoped list/detail/confirm/cancel wrapper.

Payment through order response:

- `OrderResponse.payment` returns payment id, method, status, amount, paidAt, createdAt.

## API missing

Payment APIs missing:

- `POST /api/v1/payments/orders/{orderId}/pay`
- `GET /api/v1/payments/{id}`
- `GET /api/v1/payments/orders/{orderId}`
- `POST /api/v1/payments/{id}/refund`
- `POST /api/v1/payments/{id}/fail`

Permission seed missing:

- `PAYMENT_VIEW`
- `PAYMENT_CREATE`
- `PAYMENT_UPDATE`
- `PAYMENT_REFUND`

Frontend missing:

- `code/frontend/src/services/payment.service.ts`
- POS call to real Payment API after order creation.
- Manager/Admin payment action integration.

## Frontend POS current state

POS cart component:

- Uses `createOrder` from `order.service.ts`.
- Sends `paymentMethod` in the order create request.
- Does not call a Payment API.
- Does not send `amount`, `storeId`, or `createdById` to a payment endpoint because no payment endpoint exists.
- Calculates cash received/change locally for receipt display only.
- Bank transfer QR is display-only and not a real gateway.

Current risk:

- POS treats order creation as checkout success even though `CASH` payment remains `UNPAID`.
- Non-cash payment is marked paid by backend order creation, not by a dedicated payment action.

## Admin and Manager Orders needs

Admin Orders:

- Lists order payment method and payment status from `OrderResponse.payment`.
- Can move order through status actions.
- No payment detail or refund action yet.

Manager Orders:

- Lists and views store-scoped orders.
- Shows payment method.
- Does not show payment status prominently.
- Can confirm/cancel only.
- No mark paid/refund action yet.

## Dashboard impact

Manager dashboard revenue currently sums completed orders:

- `OrderRepository.sumRevenueByStoreAndStatus(storeId, "COMPLETED")`
- today/week/month revenue also use completed order total.

Gap:

- Revenue does not require payment `PAID`.
- Payment V1 should prepare future dashboard/report changes to calculate revenue from paid payments or completed paid orders.

## Risks when changing

- Removing automatic payment from `complete()` can change behavior for existing workflows that expected complete to mark cash orders paid.
- If POS is not updated to call Payment API, checkout can leave cash orders `UNPAID`.
- Existing `payments` table lacks audit fields like `created_by`, `note`, `updated_at`, and `refunded_at`; Payment V1 must avoid pretending those are persisted.
- Store-scope must be enforced from authenticated user, not from request payload.
- Payment repository currently lives in Order module; moving entity/repository packages would be risky because JPA mappings and imports are already used by Order.

## Proposed Payment V1 implementation

- Keep existing `PaymentEntity` and `PaymentRepository` in Order module for low-risk compatibility.
- Add a separate `modules/payment` service/controller layer that uses existing order payment entity.
- Add new migration only for payment permissions.
- Change order creation to create a payment row as `UNPAID` for all payment methods.
- Change `complete()` to deduct stock and complete order only; do not mark payment paid.
- Implement payment API:
  - Pay order: uses `order.totalAmount`, ignores client amount, idempotently returns existing `PAID` payment.
  - Get payment by id.
  - Get payment by order id.
  - Refund paid payment only.
  - Fail unpaid payment only.
- Enforce:
  - no pay if order is `CANCELLED`.
  - no duplicate paid payment.
  - no refund unless `PAID`.
  - Manager/Staff must access only assigned stores.
  - Admin can access all with permission.
- Frontend:
  - Add `payment.service.ts`.
  - POS calls create order first, then pay order with selected method.
  - Do not send amount/storeId/createdById to Payment API.
  - Keep admin/manager UI changes minimal and show payment status.
