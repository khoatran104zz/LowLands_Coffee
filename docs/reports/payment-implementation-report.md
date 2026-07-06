# Payment Implementation Report

## Gap report summary

- `docs/reports/payment-order-gap-report.md` was created before coding.
- Order module already existed and included `PaymentEntity`, `PaymentRepository`, and `OrderResponse.payment`.
- There was no standalone `modules/payment` controller/service layer.
- `payments` table already existed from `V23__create_order_payment_tables.sql`.
- Existing behavior mixed payment and order completion:
  - order creation marked non-cash payments as `PAID`;
  - order completion also marked payment as `PAID`.
- Payment V1 separates Pay Order from Complete Order.

## Payment APIs implemented

Base path:

```http
/api/v1/payments
```

Implemented:

- `POST /api/v1/payments/orders/{orderId}/pay`
- `GET /api/v1/payments/{id}`
- `GET /api/v1/payments/orders/{orderId}`
- `POST /api/v1/payments/{id}/refund`
- `POST /api/v1/payments/{id}/fail`

Contract added:

- `docs/api-contract/payment-api.md`

## Payment business rules

- Payment methods:
  - `CASH`
  - `BANKING`
  - `MOMO`
  - `CARD`
- Payment statuses:
  - `UNPAID`
  - `PAID`
  - `FAILED`
  - `REFUNDED`
- Backend calculates payment amount from `order.totalAmount`.
- Payment request does not accept `amount`, `storeId`, or `createdById`.
- One main payment per order is kept through existing unique `payments.order_id`.
- Paying an already `PAID` order returns the existing payment and does not create a duplicate.
- Cancelled orders cannot be paid.
- Refunded payments cannot be paid again in V1.
- Only `PAID` payments can be refunded.
- Only `UNPAID` payments can be marked as failed.
- Refund does not reverse stock in V1.
- Complete order no longer marks payment as paid.

## Permissions/migrations

New migration:

- `code/backend/src/main/resources/db/migration/V29__seed_payment_permissions.sql`

Permissions added:

- `PAYMENT_VIEW`
- `PAYMENT_CREATE`
- `PAYMENT_UPDATE`
- `PAYMENT_REFUND`

Role grants:

- `ADMIN`: all payment permissions.
- `MANAGER`: all payment permissions.
- `STAFF`: `PAYMENT_VIEW`, `PAYMENT_CREATE`.
- `CUSTOMER`: not granted in Payment V1.

No old migration was modified.

## Backend files changed

Added:

- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/controller/PaymentController.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/dto/request/PaymentPayRequest.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/dto/request/PaymentActionRequest.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/dto/response/PaymentDetailResponse.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/mapper/PaymentMapper.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/service/PaymentService.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/payment/service/impl/PaymentServiceImpl.java`
- `code/backend/src/main/resources/db/migration/V29__seed_payment_permissions.sql`

Changed:

- `code/backend/src/main/java/com/lowlands/coffee/modules/order/repository/PaymentRepository.java`
  - Added lookup by order id.
- `code/backend/src/main/java/com/lowlands/coffee/modules/order/service/impl/OrderServiceImpl.java`
  - Order creation now creates payment as `UNPAID` for all methods.
  - Complete order no longer sets payment to `PAID`.

## Frontend files changed

Added:

- `code/frontend/src/services/payment.service.ts`

Changed:

- `code/frontend/src/components/pos/POSCart.tsx`
  - Calls create order first.
  - Calls Payment API after order creation.
  - Does not send amount/storeId/createdById to Payment API.
  - Uses backend payment response in receipt data.
- `code/frontend/src/app/[locale]/(dashboard)/manager/orders/page.tsx`
  - Shows payment status in table/detail.
- `code/frontend/src/app/[locale]/(dashboard)/admin/orders/page.tsx`
  - Shows payment id/status/paidAt in detail modal.
- `docs/api-contract/README.md`
  - Added Payment API contract entry.

## POS integration

Current POS flow:

1. Staff selects cart items.
2. Staff chooses payment method.
3. Frontend creates order through `POST /api/v1/orders`.
4. Frontend calls `POST /api/v1/payments/orders/{orderId}/pay`.
5. Receipt uses backend payment status and amount.

POS still calculates cash received/change locally for receipt display only. These values are not persisted because the current `payments` table has no cash fields.

## Admin/Manager impact

Admin Orders:

- Existing order list still uses real Order API.
- Payment method/status continues to come from `OrderResponse.payment`.
- Detail modal now includes payment id, status, and paid time.

Manager Orders:

- Existing manager store-scoped order API remains unchanged.
- Payment status is now visible in list and detail.
- No large payment/refund UI was added in this sprint.

## Test result

Backend:

- `mvn -q -DskipTests compile`: passed.
- `mvn -q clean install`: passed.
- `npm.cmd run backend` on default port `8080`: failed with `EACCES` when the repo script tried to bind `0.0.0.0:8080`.
- `SERVER_PORT=8081 npm.cmd run backend`: backend started and `/api-docs` returned `200`.

Frontend:

- `npm.cmd run type-check`: passed.
- Frontend dev server route checks returned `200`:
  - `/vi/staff/pos`
  - `/vi/admin/orders`
  - `/vi/manager/orders`

Manual Payment API smoke tests on port `8081`:

- Created order `LL-260706-0004` with initial payment status `UNPAID`.
- Paid order with `CASH`; payment status became `PAID`.
- Paid the same order again; returned the same payment id, no duplicate created.
- Refunded the paid payment; status became `REFUNDED`.
- Created another unpaid order, marked payment `FAILED`.
- Refund of failed payment returned HTTP `400`.
- Smoke test orders `34` and `35` were cancelled after verification.

## Remaining issues

- Existing `payments` table has no `created_by`, `note`, `updated_at`, `refunded_at`, or transaction reference column. `note` is accepted in API requests but not persisted in V1.
- Dashboard revenue still uses completed orders, not paid payments. This should be corrected in a reporting sprint.
- Refund does not reverse stock for completed orders in V1.
- Staff/Manager cross-store behavior was enforced in service, but an automated integration test for another-store payment was not added in this pass.
- Payment gateway integrations such as VNPay/Momo real APIs remain out of scope.
- Default port `8080` could not be used in the current Windows environment because the repo backend script hit `EACCES` while testing `0.0.0.0:8080`; port `8081` worked.

## Next recommended sprint

1. Add PostgreSQL-backed integration tests for payment store-scope and idempotency.
2. Update dashboard/report revenue to use `PAID` payments or completed paid orders.
3. Add persisted payment audit fields: `created_by`, `updated_at`, `note`, `refunded_at`, and transaction reference.
4. Add optional Admin/Manager refund UI after business approval.
5. Design real payment gateway integration separately from Payment V1.
