# Order Business Analysis

## 1. Business Overview

Order Module records a sale transaction for customer checkout and POS checkout. In Lowlands Coffee, order is the point where:

- Product selections become immutable sales snapshots.
- Payment intent/status is recorded.
- Store-specific fulfillment status is tracked.
- Inventory stock is deducted after fulfillment.
- POS receipt/history gets an authoritative `orderCode`.

Current frontend POS already has a full local checkout flow, but backend Order Module is not implemented yet. This document defines the business behavior before coding.

## 2. Sources Reviewed

Documentation:

- `docs/convention.md`
- `docs/DB-erd/database-note.md`
- `docs/api-contract/product-api.md`
- `docs/product-business-analysis.md`
- `docs/product-technical-design.md`
- `docs/sprint-3-backend-report.md`

Frontend:

- `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx`
- `code/frontend/src/components/pos/POSCart.tsx`
- `code/frontend/src/store/cart.store.ts`
- `code/frontend/src/store/dashboardStore.ts`
- `code/frontend/src/services/order.service.ts`
- `code/frontend/src/types/index.ts`

Database/Backend context:

- Existing ERD has order/payment tables documented.
- Sprint 3 implemented recipe/inventory/goods receipt.
- `Order Completed -> Stock Movement OUT` is documented but not implemented.

## 3. Current POS Behavior

Current POS workflow:

```text
Staff opens POS
-> POS loads public product catalog
-> Staff selects product variant and toppings
-> POSCart calculates subtotal, discount, VAT/service fee, total
-> Staff selects payment method
-> POSCart creates local finalOrder
-> dashboardStore.addOrder() generates local orderCode and status pending
-> Receipt modal renders local order data
```

Current frontend sends/stores rich local order lines:

- `productId`
- `productVariantId`
- `productName`
- `size`
- `unitPrice`
- `quantity`
- `totalPrice`
- `toppingId`
- `toppingName`
- `topping unitPrice`
- `topping totalPrice`

Target backend behavior:

- Frontend should send only identifiers and quantities.
- Backend must validate current product state.
- Backend must snapshot product/variant/topping display data and prices.
- Backend must generate `orderCode`.
- Backend must calculate totals.

## 4. Order Relationships

### Order - Store

- `orders.store_id` links order to a store.
- POS orders must belong to the store where staff is selling.
- Current POS hardcodes `storeId = 2`.
- Backend should validate store exists and active.
- Staff/manager should only create/update orders for assigned store unless ADMIN.

Gap:

- Need frontend/backend flow to resolve staff's active store assignment instead of hardcoding store id.

### Order - User / Customer

- `orders.user_id` links to authenticated customer/user if available.
- POS walk-in orders may not have a customer account.
- `receiver_name` and `receiver_phone` are still useful for customer lookup and receipt.

Business rule:

- POS can create anonymous/walk-in order.
- Customer online order should use authenticated user and/or `customer_addresses`.

### Order - Product Variant

- `order_items.product_variant_id` is the authoritative item identifier in create request.
- `product_id`, `product_name`, `size`, `unit_price` are saved as snapshots.
- Order creation validates:
  - variant exists
  - variant active
  - product active
  - category active

Business rule:

- Do not trust product name, size, unit price, or totals from frontend.

### Order - Topping

- `order_item_toppings.topping_id` stores selected topping.
- `topping_name`, `unit_price`, `total_price` are snapshots.
- Selected toppings must be active and allowed by `product_toppings` for the product.

Business rule:

- Topping selection is optional.
- Inactive or unallowed topping must be rejected.
- Topping inventory is not modeled in v1 because there is no `topping_ingredients`.

### Order - Payment

- ERD has `payments` linked to order.
- Current POS has payment methods `cod`, `bank_transfer`, `e_wallet`.
- DB note uses `CASH`, `MOMO`, `BANKING`, `CARD`.

Business rule:

- Backend API should use uppercase backend enum.
- Frontend must map local payment values to backend values.
- POS cash payment may need `cashReceived` and `changeReturned`; current DB has no columns for these.
- V1 does not persist `cashReceived` or `changeReturned`; frontend may calculate change for temporary display.

Frontend mapping:

- `cod` -> `CASH`
- `bank_transfer` -> `BANKING`
- `e_wallet` -> `MOMO` or `CARD` depending on UI option

### Order - Recipe / Inventory

- Order completion deducts stock using:

```text
Order Item
-> Product Variant
-> Recipe
-> Recipe Ingredient
-> Stock Movement OUT
```

Business rule:

- Stock deduction happens only when order becomes `COMPLETED`.
- Creating order does not deduct stock.
- Confirming/preparing/ready does not deduct stock.
- Cancelled order does not deduct stock.

## 5. Order Status

Required v1 statuses:

```text
PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED
```

Meaning:

- `PENDING`: order created.
- `CONFIRMED`: accepted by store.
- `PREPARING`: being made.
- `READY`: ready for handoff.
- `COMPLETED`: fulfilled and closed.
- `CANCELLED`: cancelled before completion.

Critical gap:

- Database note/DBML comments must include `READY`. Any future migration/check constraint must include the finalized status set.

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

## 6. Order Type

Required v1 order types:

```text
DELIVERY
PICKUP
DINE_IN
TAKEAWAY
```

Meaning:

- `DELIVERY`: delivery for online customer order.
- `PICKUP`: online customer order picked up at store.
- `DINE_IN`: POS order used at a table.
- `TAKEAWAY`: POS order purchased at counter for takeaway.

Backend contract must use uppercase enum values only. Frontend will map lowercase UI state to uppercase backend values later.

## 7. Business Rules

### Critical

| Rule | Status |
|---|---|
| Create order request uses `productVariantId`, `quantity`, `toppingIds` | Required |
| Backend generates `orderCode` | Required |
| Backend snapshots product name, size, unit price | Required |
| Backend snapshots topping name and unit price | Required |
| Backend calculates subtotal and total amount | Required |
| Order statuses include `READY` | Required; documented |
| Order types include `DELIVERY`, `PICKUP`, `DINE_IN`, `TAKEAWAY` | Required; documented |
| Payment methods use `CASH`, `BANKING`, `MOMO`, `CARD` | Required |
| Payment statuses use `UNPAID`, `PAID`, `FAILED`, `REFUNDED` | Required |
| Stock deducted only on `COMPLETED` | Required |
| Stock OUT uses Recipe + RecipeIngredient + StockMovement | Required |
| Complete order is idempotent and must not double-deduct stock | Required |
| Complete order runs in one transaction with stock deduction | Required |
| Missing recipe on completion returns conflict | Required |
| Insufficient stock on completion returns conflict | Required |
| Inactive product/category/variant/topping rejected at order create | Required |
| Topping must be allowed for product | Required |
| Completed order cannot be cancelled | Required |
| Cancelled order cannot be completed | Required |

### Medium

| Rule | Status |
|---|---|
| Staff can only create/update orders for assigned store | Needed |
| POS should stop hardcoding `storeId = 2` | Frontend gap |
| Payment method enum must be mapped to backend enum | Frontend gap |
| Dine-in table number | Optional/future; no dedicated DB column in V1 |
| VAT/service fee | V1 defaults to 0; no dedicated DB columns in V1 |
| Cash received/change returned | Frontend display only in V1; no persistence |
| Promotion code validation should be backend-owned | Future; current frontend mock |
| Order list should support store/status/date/search filters | Needed for POS history/admin |
| Order list should be paginated | Recommended |

### Optional

| Rule | Status |
|---|---|
| Split bill / temporary order | POS UI hints exist, not in DB/API |
| Print receipt API | Can be frontend/browser initially |
| Customer loyalty points | Future |
| Manager stock override | Explicitly not in current scope |
| Topping ingredient deduction | Requires new model |

## 8. Pricing Rules

Backend must calculate:

```text
lineBase = productVariant.price * quantity
toppingLine = sum(topping.price * toppingQuantity * quantity)
itemTotal = lineBase + toppingLine
subtotal = sum(itemTotal)
discountAmount = 0
taxAmount = 0
serviceFee = 0
totalAmount = subtotal
```

Current POS calculates VAT/service fee locally and labels it inconsistently:

- Code calculates `vat = 10%`.
- UI text says "Phí phục vụ (5%)".
- `totalAmount` includes that local amount.

V1 decision:

- No promotion engine.
- No complex tax/service fee.
- Do not add DB columns for tax/service fee in this documentation step.
- Backend can return `taxAmount = 0` and `serviceFee = 0` as computed response fields if useful for frontend compatibility.
- Client totals must not be accepted as authoritative.

## 9. Inventory Rules

Stock deduction timing:

```text
Only transition to COMPLETED creates StockMovement OUT.
```

Required completion checks:

- Order exists.
- Order is not `CANCELLED`.
- If order is already `COMPLETED`, existing OUT movement by order reference must be checked.
- Store active.
- Each order item variant has active recipe.
- Each recipe ingredient exists and is active if ingredient status is enforced.
- Current stock for `store_id + ingredient_id` is enough.

If valid:

- Create one `stock_movements OUT` row per recipe ingredient per order item, or aggregated per ingredient.
- Use `reference_type = ORDER`.
- Use `reference_id = orders.id`.
- Store quantity as positive decimal, consistent with existing stock movement convention.

Conflict handling:

- Missing recipe: `409 Conflict`.
- Insufficient stock: `409 Conflict`.
- Duplicate completion: idempotent success if already completed and OUT exists.
- Completed order without OUT movement: `409 Conflict` abnormal data state and operational log.

Transaction/concurrency:

- Complete order must run in `@Transactional`.
- Stock validation, OUT movement creation, and status update must commit together.
- If stock validation fails, status must not change.
- If status update fails, stock movements must not commit.
- Prefer pessimistic lock on the order while completing.
- At minimum, check existing `stock_movements` for `reference_type = ORDER` and `reference_id = order.id` inside the same transaction.

## 10. Frontend POS Gaps

Current frontend gaps before backend integration:

- `order.service.ts` uses mock/local data.
- POS checkout does not call backend.
- POS creates local `orderCode`.
- POS stores local `status = "pending"` lower-case.
- POS sends/stores product names and prices as if authoritative.
- POS hardcodes `storeId = 2`.
- POS uses lower-case payment methods.
- POS has `serviceType` and `tableNumber` but DB has no dedicated columns.
- POS promotions are local/mock.
- POS history reads local Zustand `orders`.

Frontend should later:

- Send create order request to backend.
- Use backend response for receipt/history.
- Map status to uppercase backend enum.
- Map payment method to uppercase backend enum.
- Resolve store id from authenticated staff/store assignment.
- Treat `tableNumber` as optional/future unless backend migration later adds `orders.table_number`.
- Calculate cash change locally for display until backend has approved cash fields.

## 11. Database Gaps

Current ERD supports core order snapshots and payments. Finalized documentation changes:

- `READY` must be included in order status documentation and future constraints.
- `DINE_IN` and `TAKEAWAY` must be included in order type documentation and future constraints.

Future migration candidates, not added now:

- No `table_number`.
- No `tax_amount`.
- No `service_fee`.
- No `cash_received`.
- No `change_returned`.
- No `cancel_reason`.
- No explicit stock deduction idempotency marker.

No migration should be created in this sprint. These are reported for approval before coding.

## 12. Recommended Scope for Order API v1

Implement first:

- Create order.
- Get order list/detail.
- Status transitions.
- Complete order with stock OUT.
- Cancel order.

Defer:

- Promotion engine.
- Payment gateway integration.
- Receipt printing backend.
- Table management module.
- Manager stock override.
- Tax/service fee persistence unless approved.
- Cash received/change returned persistence unless approved.

## 13. Issues to Resolve Before Coding

Resolved in this pre-coding decision pass:

1. DB documentation includes `READY`.
2. Backend contract includes `DELIVERY`, `PICKUP`, `DINE_IN`, `TAKEAWAY`.
3. V1 tax/service fee model is zero/default, no DB persistence.
4. V1 cash received/change returned are not persisted.
5. Complete order is idempotent and must not double-deduct stock.
6. Order permissions are `ORDER_VIEW`, `ORDER_CREATE`, `ORDER_UPDATE`, `ORDER_CANCEL`, `ORDER_COMPLETE`.

Remaining before implementation:

1. Approve Flyway migration/seed timing for Order tables, constraints, and permissions.
2. Decide UI workflow: POS create then explicit complete, or create then auto-call complete for fast-pay.
3. Resolve authenticated staff active store selection so POS stops hardcoding `storeId = 2`.
