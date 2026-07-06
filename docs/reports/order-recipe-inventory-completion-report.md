# Order Recipe Inventory Completion Report

## Backend files added/changed

- Added `OrderCompletionException` and structured failure DTOs:
  - `code/backend/src/main/java/com/lowlands/coffee/modules/order/exception/OrderCompletionException.java`
  - `code/backend/src/main/java/com/lowlands/coffee/modules/order/dto/response/OrderCompletionFailureResponse.java`
  - `code/backend/src/main/java/com/lowlands/coffee/modules/order/dto/response/StockShortageResponse.java`
- Updated `GlobalExceptionHandler` to return HTTP 409 with `ApiResponse.data` for order completion business failures.
- Updated `OrderServiceImpl`:
  - missing active recipe now returns reason `MISSING_RECIPE`
  - active recipe without ingredients now returns reason `EMPTY_RECIPE`
  - insufficient inventory now returns reason `INSUFFICIENT_STOCK` with shortage details
  - completed orders remain idempotent when stock movements already exist
- Added product availability API:
  - `StaffProductAvailabilityController`
  - `ProductAvailabilityService`
  - `ProductAvailabilityServiceImpl`
  - `ProductAvailabilityResponse`
- Added migration `V30__seed_matcha_latte_recipe_inventory.sql` for demo/test data:
  - product `Matcha Latte`
  - size `M`
  - active recipe
  - `Sugar Syrup` ingredient if missing
  - opening stock for Matcha Powder, Fresh Milk, Sugar Syrup, and Ice at store `1`

## Frontend files added/changed

- Updated `code/frontend/src/services/product.service.ts`:
  - added `ProductAvailability`
  - added `StockShortage`
  - added `getStaffProductAvailability(storeId)`
- Updated POS page:
  - loads store-scoped product availability
  - passes availability map into POS product cards
- Updated `ProductCard`:
  - disables product variants with missing recipe, empty recipe, or insufficient stock
  - shows clear labels such as `Chưa có công thức`, `Công thức thiếu nguyên liệu`, and `Không đủ nguyên liệu`
  - prevents adding unavailable variants to cart
- Updated Admin Recipe page:
  - shows a warning panel with active product variants that do not have an active recipe

## Upload/API contract

New endpoint:

```http
GET /api/v1/staff/products/availability?storeId={storeId}
```

Access:

- `ADMIN`
- `MANAGER`
- `STAFF`

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "productId": 1,
      "productName": "Matcha Latte",
      "variantId": 55,
      "size": "M",
      "available": true,
      "reason": null,
      "shortages": []
    }
  ]
}
```

Order complete failure now returns HTTP 409:

```json
{
  "success": false,
  "message": "Khong the hoan tat don: san pham Latte size M chua co cong thuc pha che.",
  "data": {
    "reason": "MISSING_RECIPE",
    "productId": 6,
    "productName": "Latte",
    "variantId": 13,
    "size": "M",
    "shortages": []
  }
}
```

## Product integration flow

1. POS loads public/admin product catalog as before.
2. POS calls `GET /api/v1/staff/products/availability` with the current store id.
3. Product variants are disabled when backend says they cannot be completed.
4. Staff can create/pay/complete orders for products with active recipe and enough stock.
5. Backend remains the final authority: completing an order still validates recipe and inventory inside the transaction.

## Test result

- `mvn -q -DskipTests compile`: passed.
- `npm.cmd run type-check`: passed.
- `mvn -q clean install`: passed.
  - Flyway validated and applied 30 migrations on H2 test database.
  - Migration `V30__seed_matcha_latte_recipe_inventory.sql` applied successfully.

## Manual test checklist

1. Login as Admin/Staff.
2. Open POS and verify unavailable variants show clear labels.
3. Confirm `Matcha Latte` size `M` is selectable.
4. Create order with `Matcha Latte` size `M`.
5. Pay order if payment flow requires it.
6. Move order to `READY`.
7. Complete order.
8. Verify stock movements include `OUT` rows for the completed order.
9. Try completing the same completed order again; no duplicate `OUT` should be created.
10. Create an order with a variant missing recipe and complete it; backend should return HTTP 409 with `reason = MISSING_RECIPE`.

## Remaining issues

- Availability checks recipe ingredients only; topping inventory is still outside scope.
- Product availability is loaded once when POS opens. A future improvement should refresh after stock movements, import notes, or order completion.
- API messages are clear but still mostly plain ASCII to match the current backend style.
- Existing products without active recipe remain unavailable until recipes are created.

## Next steps

- Add explicit backend integration tests for the three failure reasons and successful stock deduction.
- Add recipe coverage for the rest of the active demo product variants.
- Extend the same availability model to topping inventory if toppings should consume stock.
