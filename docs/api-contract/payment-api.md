# Payment API Contract

Base path: `/api/v1/payments`

All responses use `ApiResponse<T>`.

## Payment methods

- `CASH`
- `BANKING`
- `MOMO`
- `CARD`

## Payment statuses

- `UNPAID`
- `PAID`
- `FAILED`
- `REFUNDED`

## Pay order

```http
POST /api/v1/payments/orders/{orderId}/pay
Authorization: Bearer <token>
Content-Type: application/json
```

Request:

```json
{
  "method": "CASH",
  "note": "Customer paid at counter"
}
```

Rules:

- Requires `PAYMENT_CREATE`.
- Backend calculates amount from `orders.total_amount`.
- Client must not send amount, store id, or created by id.
- If order is already paid, returns the existing paid payment.
- Does not allow paying cancelled orders.
- Manager/Staff can only pay orders in assigned stores.

## Get payment by id

```http
GET /api/v1/payments/{id}
```

Rules:

- Requires `PAYMENT_VIEW`.
- Manager/Staff can only view payments in assigned stores.

## Get payment by order id

```http
GET /api/v1/payments/orders/{orderId}
```

Rules:

- Requires `PAYMENT_VIEW`.
- Manager/Staff can only view payments in assigned stores.

## Refund payment

```http
POST /api/v1/payments/{id}/refund
```

Request:

```json
{
  "note": "Customer refund"
}
```

Rules:

- Requires `PAYMENT_REFUND`.
- Only `PAID` payments can be refunded.
- Refund does not reverse stock in Payment V1.

## Fail payment

```http
POST /api/v1/payments/{id}/fail
```

Request:

```json
{
  "note": "Bank transfer was not received"
}
```

Rules:

- Requires `PAYMENT_UPDATE`.
- Only `UNPAID` payments can be marked as failed.

## Response

```json
{
  "success": true,
  "message": "Payment completed",
  "data": {
    "id": 1,
    "orderId": 10,
    "orderCode": "ORD202607060001",
    "storeId": 1,
    "storeName": "Lowlands Coffee",
    "paymentMethod": "CASH",
    "paymentStatus": "PAID",
    "amount": 59000,
    "paidAt": "2026-07-06T08:00:00",
    "createdAt": "2026-07-06T07:59:00"
  }
}
```

## Current V1 limitations

- Existing `payments` table has no `created_by`, `note`, `updated_at`, `refunded_at`, or transaction reference column.
- `note` in action requests is accepted for API compatibility but not persisted in V1.
