# Lowlands Coffee System Business Rules

## Purpose

This document is the business rule source of truth for Dashboard, Report, Analytics, and BI work after the Business Freeze Sprint.

Dashboard and Report modules must read operational data according to these rules. They must not redefine revenue, order KPI, inventory, availability, store scope, or payment behavior.

## 1. Revenue Rule

### Business Description

Revenue is recognized only when the sale is both collected and fulfilled.

A transaction is revenue only when:

```text
Payment.status = PAID
AND
Order.status = COMPLETED
```

Do not count:

- completed orders with unpaid payment;
- paid orders that were cancelled;
- failed, unpaid, or refunded payments;
- frontend-only receipt totals.

### Business Flow

```text
Create Order -> Pay Order -> Complete Order -> Revenue eligible
```

### Source Tables

- `orders`
- `payments`

### Related APIs

- `POST /api/v1/orders`
- `POST /api/v1/payments/orders/{orderId}/pay`
- `POST /api/v1/orders/{id}/complete`
- future dashboard/report read APIs

### Future Extension

Refund handling must be defined before refunded orders can affect revenue. A future payment ledger can support partial payment, partial refund, gateway transaction ids, and audit fields.

## 2. Order Rule

### Business Description

Order is the source transaction for sale fulfillment.

Valid status flow:

```text
PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED
                     \-> CANCELLED
```

Order KPI counts only `COMPLETED` orders.

Do not count as order KPI:

- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `CANCELLED`

Order items store product, product variant, quantity, price snapshot, and topping snapshot at sale time.

### Business Flow

```text
Customer/Staff selects product variant
-> Order is created
-> Payment is handled separately
-> Order status progresses
-> Complete triggers inventory OUT
```

### Source Tables

- `orders`
- `order_items`
- `order_item_toppings`
- `products`
- `product_variants`
- `toppings`

### Related APIs

- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/my`
- `GET /api/v1/orders/track`
- `POST /api/v1/orders/{id}/confirm`
- `POST /api/v1/orders/{id}/prepare`
- `POST /api/v1/orders/{id}/ready`
- `POST /api/v1/orders/{id}/cancel`
- `POST /api/v1/orders/{id}/complete`
- `GET /api/v1/manager/orders`

### Future Extension

Customer-specific order ownership, delivery address workflows, cancellation audit, and return workflows should be defined before customer/report expansion.

## 3. Payment Rule

### Business Description

One order has one main payment in the current version.

Payment state:

```text
UNPAID -> PAID
UNPAID -> FAILED
PAID   -> REFUNDED
```

Payment does not complete order. Completing order does not mark payment as paid.

Payment amount is calculated from `orders.total_amount` by backend. Frontend must not send trusted payment amount, `storeId`, or `createdById` for payment decisions.

### Business Flow

```text
Order created with UNPAID payment
-> Payment API marks payment PAID
-> Order can later be completed
```

### Source Tables

- `payments`
- `orders`

### Related APIs

- `POST /api/v1/payments/orders/{orderId}/pay`
- `GET /api/v1/payments/{id}`
- `GET /api/v1/payments/orders/{orderId}`
- `POST /api/v1/payments/{id}/refund`
- `POST /api/v1/payments/{id}/fail`

### Future Extension

Add payment audit fields, gateway transaction references, `refunded_at`, payment creator, partial refund, and real gateway callbacks.

## 4. Inventory Rule

### Business Description

Current inventory is not a fixed stored balance. It is calculated from the stock movement ledger.

Formula:

```text
current_stock =
SUM(IN quantity)
- SUM(OUT quantity)
+ SUM(ADJUSTMENT quantity)
```

Inventory source of truth is `stock_movements`.

### Business Flow

```text
Goods Receipt complete -> StockMovement IN
Manual stock adjustment -> StockMovement ADJUSTMENT
Order complete          -> StockMovement OUT
Inventory balance       -> calculated from ledger
```

### Source Tables

- `stock_movements`
- `stores`
- `ingredients`
- `goods_receipts`
- `orders`

### Related APIs

- `GET /api/v1/inventory/stock-balances`
- `GET /api/v1/inventory/stock-movements`
- `POST /api/v1/inventory/stock-adjustments`
- `GET /api/v1/manager/inventory/stock-balances`
- `GET /api/v1/manager/inventory/stock-movements`
- `POST /api/v1/manager/inventory/stock-adjustments`

### Future Extension

A cached inventory balance table may be added for performance, but it must remain derived from stock movement ledger and must not become the business source of truth.

## 5. Availability Rule

### Business Description

Backend is the source of truth for product variant availability. Frontend must not calculate availability from recipe or stock by itself.

A product variant is available when all conditions are true:

- category is active;
- product is active;
- variant is active;
- exactly one active recipe exists for the variant;
- recipe is not empty;
- every recipe ingredient points to an active ingredient;
- ingredient unit matches recipe ingredient unit;
- store stock is enough for one unit of the variant.

Availability failure reasons include:

- `MISSING_RECIPE`
- `EMPTY_RECIPE`
- `INGREDIENT_INACTIVE`
- `UNIT_MISMATCH`
- `INSUFFICIENT_STOCK`

### Business Flow

```text
POS loads availability from backend
-> unavailable variants are disabled or warned
-> complete order creates OUT movement
-> POS reloads availability
```

### Source Tables

- `categories`
- `products`
- `product_variants`
- `recipes`
- `recipe_ingredients`
- `ingredients`
- `stock_movements`
- `stores`

### Related APIs

- `GET /api/v1/staff/products/availability`
- public menu/product APIs for display only

### Future Extension

Support inventory reservation if business wants to block stock before completion. Reservation must define cancellation/release rules.

## 6. Recipe Rule

### Business Description

Recipe defines ingredient consumption for one product variant. Recipe does not change inventory by itself.

Ingredient consumption must not be calculated from recipe alone for reports. Actual consumption comes from `stock_movements` where:

```text
movement_type = OUT
AND reference_type = ORDER
```

### Business Flow

```text
Product Variant -> Active Recipe -> Recipe Ingredients
Order complete -> recipe requirements are calculated -> StockMovement OUT
```

### Source Tables

- `recipes`
- `recipe_ingredients`
- `product_variants`
- `ingredients`
- `stock_movements`

### Related APIs

- `GET /api/v1/recipes`
- `POST /api/v1/recipes`
- `PUT /api/v1/recipes/{id}`
- `DELETE /api/v1/recipes/{id}`
- `POST /api/v1/orders/{id}/complete`

### Future Extension

Combo fulfillment must decide whether combo variants keep their own recipe or expand `combo_items` into component variant recipes.

## 7. Goods Receipt Rule

### Business Description

Goods receipt records ingredient receiving into a store. It affects inventory only when completed.

Draft receipt can be changed. Completed receipt should not be edited as a normal update; corrections should use stock adjustment or future void/reversal workflow.

### Business Flow

```text
Create Goods Receipt DRAFT
-> Add items
-> Complete Goods Receipt
-> StockMovement IN
```

### Source Tables

- `goods_receipts`
- `goods_receipt_items`
- `stock_movements`
- `suppliers`
- `stores`
- `ingredients`

### Related APIs

- `GET /api/v1/goods-receipts`
- `POST /api/v1/goods-receipts`
- `PUT /api/v1/goods-receipts/{id}`
- `DELETE /api/v1/goods-receipts/{id}`
- `POST /api/v1/goods-receipts/{id}/complete`
- `GET /api/v1/manager/goods-receipts`
- `POST /api/v1/manager/goods-receipts`
- `PUT /api/v1/manager/goods-receipts/{id}`
- `POST /api/v1/manager/goods-receipts/{id}/complete`

### Future Extension

Add explicit void/reversal workflow for completed receipts if accounting audit requires it.

## 8. Stock Adjustment Rule

### Business Description

Stock adjustment is used for inventory correction, loss, count differences, or operational correction. It creates a ledger movement with `movement_type = ADJUSTMENT`.

Adjustment quantity can be positive or negative but cannot be zero.

### Business Flow

```text
Authorized user records adjustment
-> StockMovement ADJUSTMENT
-> Current inventory recalculates from ledger
```

### Source Tables

- `stock_movements`
- `stores`
- `ingredients`
- `users`

### Related APIs

- `POST /api/v1/inventory/stock-adjustments`
- `POST /api/v1/manager/inventory/stock-adjustments`

### Future Extension

Add reason codes, approval flow, and attachment evidence for high-value adjustments.

## 9. Manager Scope

### Business Description

Manager can access only the active store assignment derived from authenticated backend context.

Frontend-provided `storeId` must never decide permission. It may be used as a filter only after backend validates access.

### Business Flow

```text
JWT user -> store_users active assignment -> manager store scope -> scoped data
```

### Source Tables

- `users`
- `roles`
- `store_users`
- `stores`

### Related APIs

- `/api/v1/manager/orders`
- `/api/v1/manager/inventory/**`
- `/api/v1/manager/goods-receipts/**`
- `/api/v1/manager/staff/**`
- `/api/v1/manager/dashboard/summary`

### Future Extension

If a manager can manage multiple stores, manager context must support explicit validated store selection.

## 10. Admin Scope

### Business Description

Admin can access the full system and may optionally filter by store.

Admin actions still require matching permissions. Admin is not a replacement for audit.

### Business Flow

```text
Admin JWT -> permission check -> optional store filter -> full-system data
```

### Source Tables

- all operational tables, according to the target API

### Related APIs

- `/api/v1/admin/**`
- `/api/v1/orders`
- `/api/v1/payments/**`
- `/api/v1/inventory/**`
- `/api/v1/goods-receipts/**`

### Future Extension

Add audit trail for high-impact admin actions such as refund, stock adjustment, user disable, and master data deletion.

## 11. Dashboard Rule

### Business Description

Dashboard is read-only analytics. It must not introduce new business formulas.

Dashboard revenue must use the Revenue Rule:

```text
Payment.status = PAID
AND
Order.status = COMPLETED
```

Dashboard order KPI must use the Order Rule:

```text
Order.status = COMPLETED
```

Dashboard inventory widgets must use ledger-derived current stock.

### Business Flow

```text
Operational tables -> business formulas -> dashboard widgets
```

### Source Tables

- `orders`
- `payments`
- `order_items`
- `products`
- `categories`
- `stock_movements`
- `goods_receipts`
- `stores`
- `store_users`

### Related APIs

- existing dashboard summary APIs
- future dashboard widget APIs

### Future Extension

Dashboard implementation should start only after queries are updated to the frozen formulas and tested with paid/completed/cancelled edge cases.

## 12. Report Rule

### Business Description

Reports are formal read models. They must use the same formulas as dashboard and must support permission/store scope.

Reports must not read mock frontend data.

### Business Flow

```text
User selects report + time range
-> backend applies permission and store scope
-> backend calculates from source tables
-> frontend renders/export result
```

### Source Tables

- depends on report type, listed in the report contract

### Related APIs

- future report APIs

### Future Extension

Add export, scheduled reports, and BI views after the report contracts are implemented and tested.

## 13. Future Rules

### Business Description

The following domains are not frozen as production-ready rules in this sprint:

- combo inventory expansion;
- refund inventory reversal;
- real payment gateway settlement;
- inventory reservation;
- promotion accounting and reporting;
- customer loyalty;
- notification;
- staff performance pay/commission.

### Business Flow

Each future domain must have its own gap report, implementation report, regression tests, and business rule update before being used by Dashboard or Report.

### Source Tables

- future migrations and existing operational tables, depending on scope

### Related APIs

- future APIs only

### Future Extension

Update this document whenever a future rule becomes source of truth.

## Dashboard Data Contract

### Admin Dashboard

| Widget | Source Table | Business Formula | Filter Rule | Permission |
| --- | --- | --- | --- | --- |
| Revenue Today | `orders`, `payments` | sum `orders.total_amount` where order completed and payment paid | today by order/payment business date; optional store | `REPORT_VIEW` |
| Revenue Week | `orders`, `payments` | same revenue rule | current week; optional store | `REPORT_VIEW` |
| Revenue Month | `orders`, `payments` | same revenue rule | current month; optional store | `REPORT_VIEW` |
| Revenue Year | `orders`, `payments` | same revenue rule | current year; optional store | `REPORT_VIEW` |
| Orders | `orders` | count all orders by status buckets | time range; optional store | `REPORT_VIEW` |
| Completed Orders | `orders` | count status `COMPLETED` | time range; optional store | `REPORT_VIEW` |
| Cancelled Orders | `orders` | count status `CANCELLED` | time range; optional store | `REPORT_VIEW` |
| Payment Breakdown | `payments`, `orders` | group paid completed orders by payment method | time range; optional store | `REPORT_VIEW`, `PAYMENT_VIEW` |
| Top Products | `order_items`, `orders`, `payments` | sum quantity/revenue for paid completed orders | time range; optional store | `REPORT_VIEW` |
| Top Categories | `order_items`, `products`, `categories`, `orders`, `payments` | aggregate top products by category | time range; optional store | `REPORT_VIEW` |
| Low Stock | `stock_movements`, `ingredients` | current stock <= ingredient min stock | optional store | `REPORT_VIEW`, `INVENTORY_VIEW` |
| Store Ranking | `orders`, `payments`, `stores` | revenue rule grouped by store | time range | `REPORT_VIEW` |

### Manager Dashboard

| Widget | Source Table | Business Formula | Filter Rule | Permission |
| --- | --- | --- | --- | --- |
| Store Revenue | `orders`, `payments` | revenue rule for manager store | manager active store; time range | `REPORT_VIEW` |
| Store Orders | `orders` | count orders by status; KPI uses completed only | manager active store; time range | `REPORT_VIEW` |
| Store Inventory | `stock_movements`, `ingredients` | ledger current stock by ingredient | manager active store | `REPORT_VIEW`, `INVENTORY_VIEW` |
| Low Stock | `stock_movements`, `ingredients` | current stock <= min stock | manager active store | `REPORT_VIEW`, `INVENTORY_VIEW` |
| Goods Receipt Today | `goods_receipts` | count/sum receipts created or completed today | manager active store | `REPORT_VIEW`, `GOODS_RECEIPT_VIEW` |
| Ingredient Consumption | `stock_movements` | sum OUT where reference type ORDER | manager active store; time range | `REPORT_VIEW`, `INVENTORY_VIEW` |
| Top Products | `order_items`, `orders`, `payments` | quantity/revenue from paid completed orders | manager active store; time range | `REPORT_VIEW` |

## Report Contract

| Report | Source Tables | Business Formula | Permission | Time Range | Store Scope |
| --- | --- | --- | --- | --- | --- |
| Revenue Report | `orders`, `payments`, `stores` | sum order total where payment paid and order completed | `REPORT_VIEW` | required | Admin all/filtered; Manager own store |
| Inventory Report | `stock_movements`, `ingredients`, `stores` | current stock from ledger formula | `REPORT_VIEW`, `INVENTORY_VIEW` | optional snapshot date/future | Admin all/filtered; Manager own store |
| Payment Report | `payments`, `orders`, `stores` | group/count/sum by payment status and method | `REPORT_VIEW`, `PAYMENT_VIEW` | required | Admin all/filtered; Manager own store |
| Order Report | `orders`, `order_items`, `stores` | count by status; KPI completed only | `REPORT_VIEW`, `ORDER_VIEW` | required | Admin all/filtered; Manager own store |
| Goods Receipt Report | `goods_receipts`, `goods_receipt_items`, `suppliers`, `stores` | count/sum receipts and items by status | `REPORT_VIEW`, `GOODS_RECEIPT_VIEW` | required | Admin all/filtered; Manager own store |
| Ingredient Consumption Report | `stock_movements`, `ingredients`, `orders` | sum OUT where reference type ORDER | `REPORT_VIEW`, `INVENTORY_VIEW` | required | Admin all/filtered; Manager own store |
| Staff Performance Report | `orders`, `payments`, `users`, `store_users`, `shifts` | future formula; do not infer revenue without staff attribution | `REPORT_VIEW` | required | Admin all/filtered; Manager own store |
