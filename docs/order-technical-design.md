# Order Technical Design

## 1. Design Scope

This document designs the future Order/POS backend implementation. It does not create code or migrations.

The design follows existing Lowlands Coffee conventions:

- Modular Layered Architecture.
- Controller receives and validates request only.
- Service owns business logic and transactions.
- Repository accesses PostgreSQL.
- Response uses common `ApiResponse`.
- RBAC uses action-level permission codes.

## 2. Proposed Module Structure

Future backend module:

```text
code/backend/src/main/java/com/lowlands/coffee/modules/order/
  controller/
    OrderController.java
  dto/request/
    OrderCreateRequest.java
    OrderItemCreateRequest.java
    OrderCancelRequest.java
  dto/response/
    OrderResponse.java
    OrderItemResponse.java
    OrderItemToppingResponse.java
    PaymentResponse.java
  entity/
    OrderEntity.java
    OrderItemEntity.java
    OrderItemToppingEntity.java
    PaymentEntity.java
  mapper/
    OrderMapper.java
  repository/
    OrderRepository.java
    OrderItemRepository.java
    PaymentRepository.java
  service/
    OrderService.java
    impl/
      OrderServiceImpl.java
```

Optional helper service inside order module:

```text
OrderPricingService
OrderStockDeductionService
OrderCodeGenerator
```

Keep helper classes package-local if they do not need to be public module APIs.

## 3. API Flow

### Create Order Flow

```text
POST /api/v1/orders
-> OrderController.create(@Valid request)
-> OrderService.create(request, authenticatedUser)
-> Validate store and actor permission
-> Validate items
-> Load product variant with product/category
-> Validate product/category/variant active
-> Validate toppings exist/active/allowed
-> Snapshot product/topping data
-> Calculate subtotal/discount/total
-> Generate orderCode
-> Create OrderEntity + OrderItemEntity + OrderItemToppingEntity
-> Create PaymentEntity if payment info present
-> Save in transaction
-> Return OrderResponse
```

Important:

- Do not deduct stock during create.
- Do not use client-sent product names, sizes, prices, or totals.
- If POS wants instant paid receipt, create order can set payment status `PAID`, but stock deduction still happens only through `POST /api/v1/orders/{id}/complete`.
- POS fast-pay may call complete directly after create and may transition `PENDING`, `CONFIRMED`, or `PREPARING` to `COMPLETED` only if that workflow is approved.

### Complete Order Flow

```text
POST /api/v1/orders/{id}/complete
-> OrderService.complete(id, authenticatedUser)
-> Load order with items using pessimistic lock when possible
-> If status is COMPLETED, check existing stock_movements OUT by ORDER reference
-> Validate status transition to COMPLETED
-> Validate store permission
-> Validate stock deduction not already done
-> For each item:
   -> Load active recipe by productVariantId
   -> Load recipe ingredients
   -> Calculate required ingredient quantity
   -> Validate current stock for order.store_id
-> Create stock_movements OUT rows
-> Set order.status = COMPLETED
-> Save in one transaction
-> Return OrderResponse
```

Transaction boundary:

- Status update and stock movements must commit together.
- If one ingredient is insufficient, no status change and no stock movement is saved.
- If status update fails, stock movement rows must not be committed.
- Complete order must run in `@Transactional`.
- Preferred concurrency control: pessimistic lock on `Order` during complete.
- Minimum concurrency guard: check existing `stock_movements` with `reference_type = ORDER` and `reference_id = order.id` in the same transaction before inserting OUT rows.

Idempotency:

- If the order is not `COMPLETED`, validate stock, create OUT movements, set status `COMPLETED`, and return the updated order.
- If the order is already `COMPLETED` and OUT movements exist for the order reference, return current `OrderResponse` without creating any new OUT movements.
- If the order is already `COMPLETED` but no OUT movement exists, return `409 Conflict` and log the abnormal data state.
- Never deduct stock twice for the same order.

## 4. DTO Design

### OrderCreateRequest

Fields:

```text
Long storeId
String orderType
String receiverName
String receiverPhone
String deliveryAddress
String tableNumber
String paymentMethod
BigDecimal cashReceived
String promotionCode
String note
List<OrderItemCreateRequest> items
```

Validation:

- `storeId`: required.
- `orderType`: required enum.
- `paymentMethod`: required enum for POS.
- `items`: required non-empty.
- `note`: max 255.
- `receiverName`: max 100.
- `receiverPhone`: max 20.
- `deliveryAddress`: max 255.
- `tableNumber`: optional/future. Current DB has no dedicated column, so V1 must not require it. If needed temporarily for DINE_IN, store it in `note` until a migration is approved.
- `cashReceived`: optional display-only value for POS; V1 must not require or persist it because DB has no dedicated column.

### OrderItemCreateRequest

Fields:

```text
Long productVariantId
Integer quantity
List<Long> toppingIds
String note
```

Validation:

- `productVariantId`: required.
- `quantity`: required, integer > 0.
- `toppingIds`: optional; duplicates should be removed or rejected. Recommended: reject duplicate topping ids with 400.
- `note`: max 255.

### OrderResponse

Must include at least:

```text
id
orderCode
storeId
storeName
orderType
status
items
subtotal
discountAmount
totalAmount
createdAt
updatedAt
```

Also include if available:

```text
receiverName
receiverPhone
deliveryAddress
tableNumber
paymentMethod
paymentStatus
cashReceived
changeReturned
note
```

## 5. Entity Mapping Design

### orders

Maps:

- `id`
- `user_id`
- `store_id`
- `address_id`
- `order_code`
- `order_type`
- `status`
- `receiver_name`
- `receiver_phone`
- `delivery_address`
- `subtotal`
- `discount_amount`
- `total_amount`
- `note`
- `created_at`
- `updated_at`

Needed DB decision:

- Future migration/check constraint must include `READY`.
- Future migration/check constraint must include `DINE_IN` and `TAKEAWAY`.
- Future optional column: `table_number`.
- Future optional columns: `tax_amount`, `service_fee`.

### order_items

Maps:

- `order_id`
- `product_id`
- `product_variant_id`
- `product_name`
- `size`
- `unit_price`
- `quantity`
- `total_price`
- `note`

Design:

- Save product snapshot from backend-loaded product/variant.
- `total_price` should include item base plus topping total for that item, or base only. Recommended: include item total including toppings and document it clearly.

### order_item_toppings

Maps:

- `order_item_id`
- `topping_id`
- `topping_name`
- `unit_price`
- `quantity`
- `total_price`

Design:

- v1 request uses selected `toppingIds`, so topping quantity defaults to 1 per order item.
- If topping quantity is needed later, change request from `toppingIds` to `{toppingId, quantity}` objects.

### payments

Maps:

- `order_id`
- `payment_method`
- `payment_status`
- `amount`
- `paid_at`
- `created_at`

Needed DB decision:

- Cash received/change returned are needed by current POS receipt but not supported in DB. V1 does not persist them; frontend may calculate change for temporary display.

## 6. Repository Design

OrderRepository:

- `findByIdWithItems(Long id)`
- `findByOrderCode(String orderCode)`
- `existsByOrderCode(String orderCode)`
- filtered list by store/status/date/search, preferably pageable

Product/Variant/Topping access:

- Use existing product repositories where possible.
- Need efficient query to load `ProductVariant` with `Product` and `Category`.
- Need query to validate allowed product toppings.

RecipeRepository:

- Need method to find active recipe by product variant id with ingredients.

StockMovementRepository:

- Existing inventory repository has current stock calculation.
- Completion service can reuse current stock calculation by `storeId + ingredientId`.
- Need save `StockMovementEntity` rows with `OUT`.
- Need lookup for existing OUT movement by `reference_type = ORDER` and `reference_id = order.id` for complete idempotency.

## 7. Service Validation Design

### Create Validation

```text
validateStoreActive(storeId)
validateActorCanCreateForStore(authUser, store)
validateItemsNonEmpty(items)
for each item:
  validate quantity > 0
  load variant/product/category
  validate category active
  validate product active
  validate variant active
  validate selected toppings:
    exists
    active
    belongs to product via product_toppings
  snapshot and price
calculate totals
save order
```

Errors:

- Missing store/product variant/topping: 404.
- Inactive product/category/variant/topping: 409.
- Topping not allowed for product: 400 or 409. Recommended: 400 for invalid request.
- Empty items/invalid quantity: 400.

### Status Transition Validation

Represent transition rules as a small state machine:

```text
PENDING: CONFIRMED, CANCELLED, COMPLETED if POS shortcut approved
CONFIRMED: PREPARING, CANCELLED, COMPLETED if POS shortcut approved
PREPARING: READY, CANCELLED, COMPLETED if POS shortcut approved
READY: COMPLETED, CANCELLED
COMPLETED: no transitions
CANCELLED: no transitions
```

Invalid transition:

- Return 400 with message `Invalid order status transition`.

### Complete Validation

```text
validate order not CANCELLED
if order already COMPLETED:
  if existing OUT movement by ORDER reference exists:
    return current response
  else:
    throw 409 abnormal data state
validate transition to COMPLETED
for each order item:
  recipe = active recipe by productVariantId
  if missing: 409
  for each recipe ingredient:
    required = recipe quantity * item quantity
    current = current stock(storeId, ingredientId)
    if current < required: 409
create OUT movements
set status COMPLETED
```

Stock deduction idempotency:

- Required: if order is already `COMPLETED`, return current order only when existing OUT movements are found for `reference_type = ORDER` and `reference_id = order.id`.
- Required: if order is `COMPLETED` without an OUT movement for the order reference, return `409 Conflict` and log an abnormal data state.
- Required: never create duplicate OUT movements for the same completed order.

## 8. Stock Deduction Design

Deduction calculation:

```text
requiredByIngredient = sum(recipeIngredient.quantity * orderItem.quantity)
group by ingredientId, unit
```

Recommended implementation:

- Aggregate requirements per ingredient before checking stock.
- This avoids false pass when two order items use the same ingredient separately.
- Create one OUT movement per ingredient per completed order, or one per order item recipe ingredient.

Preferred:

- One OUT movement per ingredient per order, because it is easier to audit total stock used by the order.

Movement fields:

```text
store = order.store
ingredient = ingredient
movementType = OUT
quantity = required positive quantity
unit = recipeIngredient.unit
referenceType = ORDER
referenceId = order.id
note = "Order " + order.orderCode
createdBy = authenticated user
```

Unit consistency:

- RecipeIngredient unit should match Ingredient unit.
- If unit conversion is needed, it must be designed before coding. Current inventory design does not include conversions.

## 9. Pricing Design

Backend pricing source:

- Variant price: `product_variants.price`.
- Topping price: `toppings.price`.

Formula:

```text
base = variant.price * item.quantity
toppings = sum(topping.price * item.quantity)
item.totalPrice = base + toppings
subtotal = sum(item.totalPrice)
discountAmount = 0
taxAmount = 0
serviceFee = 0
totalAmount = subtotal
```

Current POS has local VAT/service fee. Backend V1 must not accept client tax/service values as authoritative and must not require DB columns that do not exist.

## 10. Order Code Design

Recommended format:

```text
LL-{YYMMDD}-{sequence}
```

Example:

```text
LL-260630-001
```

Requirements:

- Unique via `orders.order_code`.
- Generated server-side only.
- Collision-safe under concurrent order creation.

Options:

- Database sequence per day.
- Retry on unique collision.
- Use timestamp plus sequence.

For v1, a simple retry around unique constraint is acceptable if concurrency is low.

## 11. Permission Design

Permission codes:

- `ORDER_VIEW`
- `ORDER_CREATE`
- `ORDER_UPDATE`
- `ORDER_CANCEL`
- `ORDER_COMPLETE`

Access rules:

- ADMIN has full order permissions across all stores.
- MANAGER can manage orders in assigned active stores.
- STAFF can create, update, complete, and cancel POS orders in assigned active stores.
- CUSTOMER can create and view own online orders later.
- `ORDER_COMPLETE` is separated from `ORDER_UPDATE` because completion deducts stock.
- `ORDER_CANCEL` is separated from generic update because cancellation is a business transition.

Security placement:

- Use `@PreAuthorize` on controller methods.
- Use service-level store assignment validation for store-scoped access.

## 12. Exception Design

Use current common exceptions:

- `BadRequestException`: invalid request, invalid status transition.
- `ResourceNotFoundException`: missing order/store/product variant/topping.
- `DuplicateResourceException`: duplicate order code if surfaced.

Potential new exception later:

- `InsufficientStockException` mapped to 409.
- Or use existing runtime exception if a conflict handler exists later.

Response must stay in `ApiResponse` format.

## 13. API Implementation Sequence

Recommended coding sequence after approval:

1. Confirm DB gaps and create migration only after approval.
2. Add order permissions seed migration for `ORDER_VIEW`, `ORDER_CREATE`, `ORDER_UPDATE`, `ORDER_CANCEL`, `ORDER_COMPLETE`.
3. Create Order entities/repositories.
4. Create DTOs and mapper.
5. Implement create order without stock deduction.
6. Implement list/detail.
7. Implement status transitions except complete.
8. Implement complete with stock OUT transaction.
9. Add unit/integration tests.
10. Update frontend `order.service.ts` and POS checkout.

## 14. Test Design

Backend tests should cover:

- Create order with valid `productVariantId`, quantity, toppings.
- Reject inactive product/category/variant/topping.
- Reject topping not allowed for product.
- Backend ignores client price/name if present.
- Generates unique orderCode.
- Status transition valid path.
- Invalid transition returns 400.
- Complete order creates OUT stock movements.
- Complete order with missing recipe returns 409.
- Complete order with insufficient stock returns 409.
- Repeated complete does not double-deduct stock.

Frontend integration tests/manual checks later:

- POS checkout sends backend request.
- Receipt uses backend orderCode and totals.
- POS history loads backend orders.
- Payment method enum mapping works.
- Store id is no longer hardcoded.

## 15. Deferred / Blocked Design Items

Need approval before coding:

- Migration/seed timing for finalized order statuses/types and order permissions.
- Optional future DB columns: `table_number`, `tax_amount`, `service_fee`, `cash_received`, `change_returned`.
- Whether POS fast-pay should call complete immediately after create or stay as a two-step UI flow.
- Product owner approval for any future promotion engine/payment gateway/table management scope.

Current decision: core Order API can be coded with existing ERD fields, using V1 defaults for fields without DB support and postponing optional columns to a later approved migration.
