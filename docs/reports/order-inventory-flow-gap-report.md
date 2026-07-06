# Order Inventory Flow Gap Report

## Current Flow

Target flow:

```text
Create Order -> Pay Order -> Complete Order -> Recipe -> StockMovement OUT -> Inventory decreases -> POS Availability reloads
```

Current implementation reaches the target flow:

1. POS creates an order through `POST /api/v1/orders`.
2. POS pays the order through `POST /api/v1/payments/orders/{orderId}/pay`.
3. Staff/Admin moves order through `CONFIRMED -> PREPARING -> READY`.
4. Staff/Admin completes order through `POST /api/v1/orders/{id}/complete`.
5. Backend looks up recipe by `order_item.product_variant_id`.
6. Backend aggregates recipe ingredient requirements by ingredient.
7. Backend checks inventory balance from `stock_movements`.
8. Backend writes `StockMovement OUT` with `reference_type = ORDER` and `reference_id = order.id`.
9. Inventory balance decreases because it is calculated from the stock movement ledger.
10. POS reloads availability after checkout success and after complete order.

## What Is Correct

- Order create stores `productVariant` on each order item from `OrderItemCreateRequest.productVariantId`.
- Order item quantity is stored on `OrderItemEntity.quantity`.
- Payment does not complete an order and does not create stock movements.
- Complete order uses `recipeRepository.findByProductVariant_IdAndStatus(...)`; it does not use only `productId`.
- Complete order multiplies `recipeIngredient.quantity * orderItem.quantity`.
- Multiple order items using the same ingredient are aggregated before stock deduction.
- Stock OUT uses:
  - `movementType = OUT`
  - `referenceType = ORDER`
  - `referenceId = order.id`
- Complete order checks existing ORDER OUT movements to avoid duplicate deductions.
- Inventory balance is calculated from `stock_movements` with `IN` positive, `OUT` negative, and `ADJUSTMENT` as signed quantity.
- POS calls `GET /api/v1/staff/products/availability`.
- POS reloads availability after checkout success and after order complete.
- Backend is still the source of truth; frontend does not calculate availability.

## Remaining Gaps

- Automated backend integration coverage for this exact end-to-end flow is still thin.
- Availability service needs explicit tests for missing recipe, empty recipe, inactive ingredient, insufficient stock, and stock depletion after order completion.
- Error response messages are structured, but wording is still ASCII and should be aligned with business wording.
- There is no dedicated manual verification guide for the order-inventory flow.

## APIs Involved

- `POST /api/v1/orders`
- `POST /api/v1/payments/orders/{orderId}/pay`
- `POST /api/v1/orders/{id}/confirm`
- `POST /api/v1/orders/{id}/prepare`
- `POST /api/v1/orders/{id}/ready`
- `POST /api/v1/orders/{id}/complete`
- `GET /api/v1/staff/products/availability`
- Inventory APIs for stock movement/balance inspection.

No new API is required for this sprint.

## Tests Needed

1. Create order -> pay -> complete -> StockMovement OUT is created.
2. Inventory decreases by `recipe quantity * order item quantity`.
3. Completing the same completed order again does not create duplicate OUT and does not reduce inventory again.
4. Insufficient stock blocks completion, leaves order not completed, and creates no OUT.
5. Missing recipe blocks completion with `MISSING_RECIPE`.
6. Empty recipe blocks completion with `EMPTY_RECIPE`.
7. Availability true when recipe and stock are sufficient.
8. Availability false for missing recipe.
9. Availability false for empty recipe.
10. Availability false for inactive ingredient.
11. Availability false for insufficient stock.
12. Availability flips to false after completion depletes stock below one-unit requirement.

## Repeated Complete Risk

If idempotency is broken, every repeated complete action could create another `OUT` movement and reduce stock again. Current backend has two protections:

- completed orders with existing ORDER OUT movements return the current order;
- non-completed orders with existing ORDER OUT movements throw conflict.

This still needs automated regression tests.

## Stock Reaches Zero Risk

If availability is not reloaded after completion, POS may still allow adding a variant that is now impossible to complete. Current frontend reloads availability after checkout success and after order completion, but the behavior should be covered by tests/manual verification.
