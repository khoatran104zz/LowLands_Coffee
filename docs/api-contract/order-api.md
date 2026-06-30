# Order API Contract

## 1. Purpose

Defines Order/POS API v1 for Lowlands Coffee. The API is designed for POS checkout first, while still fitting customer checkout later.

Order API must be the source of truth for:

- Order creation.
- Product/variant/topping validation.
- Price snapshot.
- Order totals.
- Order status lifecycle.
- Stock deduction when an order becomes `COMPLETED`.

This document is contract/design only. No backend code or migration is created in this sprint.

## 2. Current Frontend Usage

Current frontend POS files:

- `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx`
- `code/frontend/src/components/pos/POSCart.tsx`
- `code/frontend/src/store/dashboardStore.ts`
- `code/frontend/src/store/cart.store.ts`
- `code/frontend/src/services/order.service.ts`

Current POS behavior:

- POS loads product catalog from `dashboardStore.hydrateProductCatalog("public")`.
- POS cart stores full product/variant/topping objects locally.
- Checkout builds a local `finalOrder` with product names, prices, totals, payment method, customer info, and items.
- `dashboardStore.addOrder()` generates local `orderCode`, sets local `status = "pending"`, and stores order in Zustand/mock state.
- `order.service.ts` currently returns mock/local order data, not a backend API call.

Target integration:

- Frontend should send only identifiers and quantities for order lines:
  - `productVariantId`
  - `quantity`
  - `toppingIds`
  - optional line `note`
- Backend must derive product, product name, size, unit price, topping names, topping prices, subtotal, discount, total amount, and status.

## 3. Existing Database Contract

Current ERD already has:

- `orders`
- `order_items`
- `order_item_toppings`
- `payments`
- `order_promotions`
- `stock_movements.reference_type = ORDER`

Important current ERD gaps to report before coding:

- `orders.status` documentation is updated to include `READY`; a future migration/check constraint must include it when Order tables are implemented/enforced.
- POS has `serviceType` (`dine_in`, `takeaway`) and `tableNumber`; current `orders` table has no dedicated `table_number` column.
- POS calculates VAT/service fee in UI; current `orders` table has only `subtotal`, `discount_amount`, `total_amount`, no `tax_amount` or `service_fee`.
- POS sends `cashReceived` and `changeReturned`; current `payments` table does not have dedicated cash received/change fields.
- Current payment methods in DB note are `CASH`, `MOMO`, `BANKING`, `CARD`; frontend currently uses `cod`, `bank_transfer`, `e_wallet`.

No migration is created in this sprint.

## 4. API Summary

Base path:

```text
/api/v1/orders
```

| Method | URL | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/orders` | `ORDER_CREATE` | Create order from POS/customer cart. |
| GET | `/api/v1/orders` | `ORDER_VIEW` | List orders with optional filters. |
| GET | `/api/v1/orders/{id}` | `ORDER_VIEW` | Get order detail. |
| GET | `/api/v1/orders/code/{orderCode}` | `ORDER_VIEW` | Get order detail by code for receipt/reprint. |
| POST | `/api/v1/orders/{id}/confirm` | `ORDER_UPDATE` | Move `PENDING -> CONFIRMED`. |
| POST | `/api/v1/orders/{id}/prepare` | `ORDER_UPDATE` | Move `CONFIRMED -> PREPARING`. |
| POST | `/api/v1/orders/{id}/ready` | `ORDER_UPDATE` | Move `PREPARING -> READY`. |
| POST | `/api/v1/orders/{id}/complete` | `ORDER_COMPLETE` | Move to `COMPLETED` and deduct stock. |
| POST | `/api/v1/orders/{id}/cancel` | `ORDER_CANCEL` | Cancel an order before completion. |

Optional future:

| Method | URL | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/orders/validate` | `ORDER_CREATE` | Validate cart availability without creating order. |

## 5. Permission Matrix

Recommended permission codes follow `docs/convention.md`:

- `ORDER_VIEW`
- `ORDER_CREATE`
- `ORDER_UPDATE`
- `ORDER_CANCEL`
- `ORDER_COMPLETE`

Orders should not be hard-deleted in V1; cancellation is a business transition and completion is separated because it deducts stock.

Suggested access:

| Flow | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| Create POS order | Y | Y | Y | N | N |
| Create customer order | Y | Y | N | Y | N |
| View all/store orders | Y | Y | Y store-scoped | Customer own only | N |
| Update POS order status | Y | Y | Y store-scoped | N | N |
| Cancel order | Y | Y store-scoped | Y store-scoped before completed | Customer own pending only | N |
| Complete order | Y | Y store-scoped | Y store-scoped | N | N |

Implementation note:

- Do not put manager store workflow under `/api/v1/admin/**`.
- If customer checkout is added, it can use the same create contract with authenticated customer context.

## 6. Enums

### Order Status

The v1 order status set is:

```text
PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED
```

Status meaning:

- `PENDING`: order created, not accepted by store/barista flow yet.
- `CONFIRMED`: accepted and waiting for preparation.
- `PREPARING`: being prepared.
- `READY`: prepared and ready for pickup/serving/delivery handoff.
- `COMPLETED`: fulfilled and closed. Stock deduction happens here only.
- `CANCELLED`: cancelled and no stock deduction should occur.

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

COMPLETED -> no further transition
CANCELLED -> no further transition
```

POS fast-pay shortcuts are allowed only when the product owner approves the paid-counter workflow. Stock must still be deducted only during the transition to `COMPLETED`.

Invalid transitions return `400 Bad Request`.

### Order Type

```text
DELIVERY
PICKUP
DINE_IN
TAKEAWAY
```

Database documentation is updated to include `DINE_IN` and `TAKEAWAY`. Backend contract must use uppercase values only. Frontend will map lowercase UI values to these uppercase backend enums later.

### Payment Method

API v1 should use uppercase backend enum:

```text
CASH
BANKING
MOMO
CARD
```

Frontend mapping needed:

- `cod` -> `CASH`
- `bank_transfer` -> `BANKING`
- `e_wallet` -> either `MOMO` or `CARD` depending UI option

### Payment Status

```text
UNPAID
PAID
FAILED
REFUNDED
```

## 7. Create Order Request

Endpoint:

```text
POST /api/v1/orders
```

Request DTO:

| Field | Type | Required | Validation |
|---|---|---:|---|
| `storeId` | number | Y | Store must exist and be active. |
| `orderType` | string | Y | `DELIVERY`, `PICKUP`, `DINE_IN`, `TAKEAWAY`. |
| `receiverName` | string | N for POS, Y for delivery | Max 100. Default POS value can be `Walk-in Customer`. |
| `receiverPhone` | string | N | Max 20. |
| `deliveryAddress` | string | Y for delivery | Max 255. |
| `tableNumber` | string | N | Optional/future. Current DB has no dedicated column; for V1, do not require it. |
| `paymentMethod` | string | Y | `CASH`, `BANKING`, `MOMO`, `CARD`. |
| `cashReceived` | decimal | N | Display-only input for POS if sent. Current DB has no dedicated column; V1 must not persist or require it. |
| `promotionCode` | string | N | Future promotion validation. |
| `note` | string | N | Max 255. |
| `items` | array | Y | Non-empty. |

`items[]`:

| Field | Type | Required | Validation |
|---|---|---:|---|
| `productVariantId` | number | Y | Variant must exist, active, product active, category active. |
| `quantity` | number | Y | Integer > 0. |
| `toppingIds` | number[] | N | Each topping must exist, active, and allowed by product_toppings for product. |
| `note` | string | N | Max 255. |

Important:

- Client must not send product name, size, unit price, or item total as authoritative data.
- Backend snapshots those values into `order_items` and `order_item_toppings`.
- Backend calculates all totals.

Example POS request:

```json
{
  "storeId": 2,
  "orderType": "TAKEAWAY",
  "receiverName": "Walk-in Customer",
  "receiverPhone": null,
  "paymentMethod": "CASH",
  "cashReceived": 100000,
  "note": "Less ice",
  "items": [
    {
      "productVariantId": 101,
      "quantity": 2,
      "toppingIds": [1, 2],
      "note": "No sugar"
    }
  ]
}
```

Example dine-in request:

```json
{
  "storeId": 2,
  "orderType": "DINE_IN",
  "tableNumber": "Bàn 5",
  "receiverName": "Walk-in Customer",
  "paymentMethod": "CARD",
  "items": [
    {
      "productVariantId": 102,
      "quantity": 1,
      "toppingIds": []
    }
  ]
}
```

## 8. Create Order Response

Response DTO `OrderResponse`:

| Field | Type | Description |
|---|---|---|
| `id` | number | Order id. |
| `orderCode` | string | Generated unique code, e.g. `LL-260630-001`. |
| `userId` | number | Customer/user id if any. |
| `storeId` | number | Store id. |
| `storeName` | string | Store snapshot/display name. |
| `orderType` | string | Order type. |
| `status` | string | Current order status. |
| `receiverName` | string | Receiver/customer name. |
| `receiverPhone` | string | Receiver/customer phone. |
| `deliveryAddress` | string | Delivery or POS service display text. |
| `tableNumber` | string | POS dine-in table, if supported. |
| `subtotal` | decimal | Sum of item totals before discount/tax/service. |
| `discountAmount` | decimal | V1 returns `0` until promotion engine is approved. |
| `taxAmount` | decimal | V1 returns `0` if no DB column exists. |
| `serviceFee` | decimal | V1 returns `0` if no DB column exists. |
| `totalAmount` | decimal | Final payable amount. |
| `paymentMethod` | string | Payment method. |
| `paymentStatus` | string | Payment status. |
| `cashReceived` | decimal | Optional/future display field only; not persisted in V1. |
| `changeReturned` | decimal | Optional/future display field only; frontend may calculate temporarily. |
| `note` | string | Order note. |
| `items` | array | Order item responses. |
| `createdAt` | datetime | Created timestamp. |
| `updatedAt` | datetime | Updated timestamp. |

`OrderItemResponse`:

| Field | Type | Description |
|---|---|---|
| `id` | number | Order item id. |
| `productId` | number | Product id. |
| `productVariantId` | number | Variant id. |
| `productName` | string | Snapshot product name. |
| `size` | string | Snapshot variant size. |
| `unitPrice` | decimal | Snapshot variant unit price. |
| `quantity` | number | Ordered quantity. |
| `totalPrice` | decimal | Item total including item toppings. |
| `note` | string | Item note. |
| `toppings` | array | Topping snapshots. |

`OrderItemToppingResponse`:

| Field | Type | Description |
|---|---|---|
| `id` | number | Order item topping id. |
| `toppingId` | number | Topping id. |
| `toppingName` | string | Snapshot topping name. |
| `unitPrice` | decimal | Snapshot topping price. |
| `quantity` | number | Topping quantity. Default v1 can be 1 per selected topping. |
| `totalPrice` | decimal | `unitPrice * quantity * orderItem.quantity` or documented equivalent. |

Example response:

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "id": 15,
    "orderCode": "LL-260630-015",
    "storeId": 2,
    "storeName": "Lowlands Coffee - District 3",
    "orderType": "TAKEAWAY",
    "status": "PENDING",
    "receiverName": "Walk-in Customer",
    "receiverPhone": null,
    "deliveryAddress": "Mang đi (Mua tại quầy)",
    "subtotal": 86000,
    "discountAmount": 0,
    "taxAmount": 0,
    "serviceFee": 0,
    "totalAmount": 86000,
    "paymentMethod": "CASH",
    "paymentStatus": "PAID",
    "cashReceived": 100000,
    "changeReturned": 14000,
    "items": [
      {
        "id": 31,
        "productId": 1,
        "productVariantId": 101,
        "productName": "Phin Sua Da",
        "size": "M",
        "unitPrice": 35000,
        "quantity": 2,
        "totalPrice": 86000,
        "toppings": [
          {
            "id": 44,
            "toppingId": 1,
            "toppingName": "Coffee Jelly",
            "unitPrice": 8000,
            "quantity": 1,
            "totalPrice": 16000
          }
        ]
      }
    ],
    "createdAt": "2026-06-30T09:30:00",
    "updatedAt": "2026-06-30T09:30:00"
  }
}
```

## 9. List Orders

Endpoint:

```text
GET /api/v1/orders?storeId=&status=&orderType=&fromDate=&toDate=&search=&page=&size=
```

Filters:

- `storeId`: required for STAFF unless backend resolves assigned store from user context.
- `status`: optional.
- `orderType`: optional.
- `fromDate`, `toDate`: optional ISO dates/datetimes.
- `search`: optional, matches `orderCode`, receiver name, phone.
- `page`, `size`: recommended for POS history/admin orders.

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

If pagination is deferred, return `OrderResponse[]` temporarily and document the limitation.

## 10. Status Update APIs

### Confirm

```text
POST /api/v1/orders/{id}/confirm
```

- Valid only from `PENDING`.
- Returns updated `OrderResponse`.

### Prepare

```text
POST /api/v1/orders/{id}/prepare
```

- Valid only from `CONFIRMED`.
- Returns updated `OrderResponse`.

### Ready

```text
POST /api/v1/orders/{id}/ready
```

- Valid only from `PREPARING`.
- Returns updated `OrderResponse`.

### Complete

```text
POST /api/v1/orders/{id}/complete
```

Rules:

- Valid from `READY`.
- POS fast-pay may allow `PENDING`, `CONFIRMED`, or `PREPARING` to complete directly if approved.
- Stock deduction happens here only.
- Endpoint must be idempotent.
- Completion is transactional:
  - validate current order status
  - if order is already `COMPLETED`, check existing `stock_movements OUT` for `reference_type = ORDER` and `reference_id = order.id`
  - validate recipe and stock
  - create `stock_movements` with `movement_type = OUT`
  - set order `status = COMPLETED`
  - return updated order

Idempotency:

- If order is not `COMPLETED`, validate stock, create OUT movements, set status `COMPLETED`, and return `OrderResponse`.
- If order is already `COMPLETED` and OUT movements exist for the order reference, do not create additional OUT rows and return current `OrderResponse`.
- If order is `COMPLETED` but no OUT movement exists for the order reference, treat it as abnormal data state. Return `409 Conflict` and log a warning/error for operational follow-up.
- The system must never deduct stock twice for the same completed order.

### Cancel

```text
POST /api/v1/orders/{id}/cancel
```

Request:

```json
{
  "reason": "Customer changed mind"
}
```

Rules:

- Cannot cancel `COMPLETED`.
- `CANCELLED` order must not deduct stock.
- Current DB has no `cancel_reason`; if needed, store in `orders.note` or add DB change later.

## 11. Stock Deduction Contract

Stock must be deducted only when order status becomes `COMPLETED`.

For each `order_items` row:

```text
order_item.product_variant_id
-> recipes.product_variant_id
-> recipe_ingredients
-> stock_movements OUT
```

For each recipe ingredient:

```text
outQuantity = recipeIngredient.quantity * orderItem.quantity
```

Create `stock_movements`:

| Field | Value |
|---|---|
| `store_id` | `orders.store_id` |
| `ingredient_id` | `recipe_ingredients.ingredient_id` |
| `movement_type` | `OUT` |
| `quantity` | positive `outQuantity` |
| `unit` | recipe ingredient unit |
| `reference_type` | `ORDER` |
| `reference_id` | `orders.id` |
| `created_by` | authenticated user id |
| `note` | `Order {orderCode}` |

Validation:

- Missing active recipe -> `409 Conflict`.
- Missing ingredient -> `409 Conflict`.
- Insufficient stock -> `409 Conflict`.
- Order already completed with existing OUT movement -> idempotent success, no extra OUT rows.
- Order already completed without existing OUT movement -> `409 Conflict` abnormal data state.

Toppings:

- Current DB has no `topping_ingredients`.
- Toppings do not deduct stock in v1.

## 12. Business Validation

Create order:

- Store must exist and be active.
- Staff/POS user must be allowed to create order for the store.
- Items cannot be empty.
- Quantity must be integer > 0.
- Product variant must exist and be active.
- Product must be active.
- Category must be active.
- Selected toppings must exist, active, and be allowed for the product.
- Backend calculates prices from product variant and topping data at create time.
- Backend snapshots names/prices into order item tables.
- Client-provided totals must be ignored or treated as display-only.

Complete order:

- Order must not be cancelled.
- Stock deduction is only on transition to `COMPLETED`.
- Every ordered variant must have an active recipe if inventory deduction is required.
- Every recipe ingredient must have enough stock in the order store.
- Stock movements are created in the same transaction as status update.
- Use `@Transactional` for complete order.
- Prefer pessimistic lock on the order row while completing. At minimum, check existing stock movement for the same order reference inside the same transaction before inserting OUT rows.
- If stock validation fails, order status must not change.
- If status update fails, stock movement rows must not be committed.

## 13. HTTP Status

- 200: successful read/status update/cancel/complete.
- 201: order created.
- 400: validation error or invalid status transition.
- 401: missing/invalid token.
- 403: no permission or not assigned to store.
- 404: order/store/product variant/topping not found.
- 409: unavailable product, inactive product/category/topping at order time, missing recipe, insufficient stock, duplicate completion conflict.
- 500: unexpected exception.

## 14. Frontend Integration Notes

Frontend changes needed later:

- Replace mock `order.service.ts` with real Axios calls.
- POSCart should send `productVariantId`, `quantity`, `toppingIds`, `note`; remove product name/price/total from request authority.
- Map payment methods:
  - `cod` -> `CASH`
  - `bank_transfer` -> `BANKING`
  - `e_wallet` -> `MOMO` or `CARD`
- Map POS service:
  - `dine_in` -> `DINE_IN`
  - `takeaway` -> `TAKEAWAY`
- Stop hardcoding `storeId = 2`; resolve store from authenticated staff assignment or selected store.
- Use backend `orderCode`, `items`, `subtotal`, `totalAmount`, `status` for receipt and history.
- Current POS displays VAT/service fee. Backend V1 returns `discountAmount = 0`, `taxAmount = 0`, `serviceFee = 0`, and `totalAmount = subtotal` until a migration/policy is approved.

## 15. Deferred Decisions / Gaps

Resolved before coding:

- Order statuses: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`.
- Order types: `DELIVERY`, `PICKUP`, `DINE_IN`, `TAKEAWAY`.
- Payment methods: `CASH`, `BANKING`, `MOMO`, `CARD`.
- Payment statuses: `UNPAID`, `PAID`, `FAILED`, `REFUNDED`.
- Complete order idempotency: repeated complete must not create duplicate OUT stock movements.
- V1 pricing: no promotion engine; `discountAmount = 0`, `taxAmount = 0`, `serviceFee = 0`, `totalAmount = subtotal`.

DB changes needed later, only after coding migration approval:

- Add/check constraints for finalized order status and order type values.
- Consider `table_number`.
- Consider `tax_amount`, `service_fee`.
- Consider `cash_received`, `change_returned`.
- Seed `ORDER_CANCEL` and `ORDER_COMPLETE`.
