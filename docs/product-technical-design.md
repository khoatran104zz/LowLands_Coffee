# Product Technical Design

## 1. Design Scope

Tai lieu nay thiet ke ky thuat cho Product Module truoc sprint coding tiep theo. Chua de xuat migration cu the va khong yeu cau tao entity moi trong sprint phan tich nay.

Muc tieu thiet ke:

- Giu Modular Layered Architecture hien co.
- Business logic nam o service, controller chi nhan request/validate annotation/goi service.
- Product public/admin phai nhat quan voi Category, Variant, Topping, Recipe, Inventory va Order.
- Chu an bi cho availability theo store ma khong pha API hien tai.

## 2. Business Flow

### Customer Menu Flow

```text
Client
-> GET /api/v1/products or /api/v1/menu
-> ProductService
-> Query products with category/variant/topping details
-> Filter sellable public product
-> Return active category + active product + active variants + active toppings
```

Sellable public product toi thieu:

- `product.status = active`
- `category.status = active`
- co it nhat mot `variant.status = active`

Neu sprint sau them availability theo store:

```text
Client selects store
-> GET /api/v1/stores/{storeId}/menu
-> ProductService + AvailabilityService concept
-> ProductVariant -> Recipe -> RecipeIngredient -> StockMovement balance
-> Mark variant/product available or unavailable
```

### Product Detail Flow

```text
Client
-> GET /api/v1/products/{id}
-> Validate product public sellable
-> Return only active variants and active toppings
-> Client selects size/topping/quantity
-> Add to cart local
```

Can bo sung trong sprint order:

- Khi checkout, backend phai validate lai product/variant/topping, khong tin cart local.

### POS Flow

Hien tai:

```text
POS
-> dashboardStore hydrate public catalog
-> Client-side filter/search
-> Local cart
-> Local order in dashboardStore
```

Muc tieu dung nghiep vu:

```text
POS authenticated staff/manager/admin
-> Resolve active store assignment
-> GET store menu with availability
-> Add item
-> Checkout API validates product/variant/topping/store/stock
-> Order created/paid
-> On completed, stock OUT by recipe
```

## 3. Validation Flow

### Create Product

```text
Controller @Valid
-> ProductService.create
-> Validate variants non-empty and unique size
-> Load category
-> Validate category active if product active
-> Load toppings
-> Validate topping ids exist
-> Validate toppings active if product active
-> Normalize name/description/imageUrl/status
-> Save product with variants and product_toppings
-> Return ProductResponse
```

Recommended validation decisions:

- Product name: can duplicate unless business confirms unique.
- SKU: not required because DB/API do not have SKU.
- Category: required and must exist.
- Active product should not be created under inactive category.
- Product must have at least one variant.
- Variant size unique per product.
- Variant price for sellable variant must be `> 0`.
- Topping is optional.
- Topping price can be `>= 0`.

### Update Product

```text
Controller @Valid
-> ProductService.update(id)
-> Load product with details
-> Validate category/topping/variant rules
-> Update scalar fields
-> Update variants
-> Update product_toppings
-> Return ProductResponse
```

Important technical risk:

- Current implementation clears and recreates variants.
- Recipe references `product_variants.id`.
- If a product has recipe rows, clearing variants can break FK or lose recipe continuity.

Recommended design:

- Preserve existing variant ids when `ProductVariantUpdateRequest.id` is provided.
- Create a new variant only when request variant has no `id`.
- Treat missing existing variants in update as `status = inactive`.
- Do not hard delete variants, so recipe references to `product_variant_id` remain valid.

### Category Validation

```text
Create/Update Category
-> name required
-> case-insensitive duplicate check
-> status active/inactive
-> save
```

When category inactive:

- Do not cascade update product status automatically.
- Public product queries must exclude products under inactive category.
- Admin UI should warn that all products in this category disappear from menu/POS.
- Creating/updating active product into inactive category should fail.

### Topping Validation

```text
Create/Update Topping
-> name required
-> price valid
-> duplicate name check
-> status active/inactive
-> save
```

When topping inactive:

- Public product response excludes it.
- Existing product_toppings relation can remain for history/admin.
- Checkout validation must reject selected inactive topping.

## 4. CRUD Flow

### Admin Product List

Current:

```text
GET /api/v1/admin/products
-> list all products, all variants, all toppings
```

Recommended:

- Add pagination before catalog grows.
- Add filters: status, categoryId, search.
- Keep admin response including inactive variants/toppings.

### Public Product List

Current:

```text
GET /api/v1/products?categoryId=&search=&minPrice=&maxPrice=
-> load all
-> filter in memory
-> active-only response
```

Recommended:

- Move filtering to repository query/specification.
- Add pagination.
- Validate `minPrice <= maxPrice`.
- Price filter should use active variant price only.

### Delete Product

```text
DELETE /api/v1/admin/products/{id}
-> Load product
-> Set status inactive
-> Save
```

Recommended:

- Keep soft delete.
- Do not delete variants/toppings/recipes.
- Public APIs exclude inactive product.
- Order history remains intact via snapshot.

## 5. Permission Flow

Current security:

- `/api/v1/admin/**` requires role ADMIN in `SecurityConfig`.
- Admin product/category/topping methods also require `PRODUCT_*`, `CATEGORY_*`, `TOPPING_*`.
- Public menu/product/category permitAll.

Effective permission result:

- ADMIN with authorities can use admin product APIs.
- MANAGER/STAFF cannot access `/api/v1/admin/**` even if granted product authorities because route-level role gate blocks them.

Design decision needed:

- If only ADMIN can manage product catalog, current path is acceptable.
- If MANAGER should manage store-level menu/availability later, use separate manager/store endpoints, not `/admin/**`, or relax route-level gate carefully.

Recommended permission matrix:

| Flow | Permission |
|---|---|
| Public menu/product/category | PUBLIC |
| Admin product read | `PRODUCT_VIEW` + ADMIN route |
| Admin product create | `PRODUCT_CREATE` + ADMIN route |
| Admin product update | `PRODUCT_UPDATE` + ADMIN route |
| Admin product soft delete | `PRODUCT_DELETE` + ADMIN route |
| Recipe read | `RECIPE_VIEW` |
| Recipe mutate | `RECIPE_CREATE/UPDATE/DELETE` |
| Inventory stock read | `INVENTORY_VIEW` |
| Inventory adjust | `INVENTORY_ADJUST` |
| Store menu availability | STAFF/MANAGER role or explicit future permission |

## 6. Exception Flow

Current ApiResponse:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Current mappings:

- 400: validation/BadRequest.
- 401: bad credentials.
- 403: access denied.
- 404: resource not found.
- 409: duplicate resource.
- 500: unexpected.

Recommended product exceptions:

- Duplicate name/code where business requires uniqueness: 409.
- Duplicate variant size: 400.
- Category inactive when creating active product: 400.
- Topping inactive when assigning to active product: 400.
- Product unavailable/out of stock during checkout: 409 if conflict with current stock/status, or 400 if invalid request. Prefer 409 for state changed since client loaded menu.
- Recipe missing for stock-managed variant: 409 during sell/checkout.

Recommended logging:

- Log unexpected exceptions with request path and correlation id if available.
- Do not log JWT/token/password.

## 7. Soft Delete Flow

### Product

```text
Admin delete
-> product.status = inactive
-> public menu/detail no longer returns product
-> admin list still returns product
-> order snapshots unaffected
```

### Category

```text
Admin delete/inactivate category
-> category.status = inactive
-> public categories exclude category
-> public products under category excluded
-> product.status remains unchanged
```

### Topping

```text
Admin delete/inactivate topping
-> topping.status = inactive
-> public product responses exclude topping
-> product_toppings relation remains
-> checkout rejects inactive selected topping
```

### Recipe

```text
Admin delete recipe
-> recipe.status = inactive
-> availability check treats recipe as missing/unavailable
```

## 8. Product Availability Flow

### Current Minimum Availability

Current backend public sellability:

```text
product active
AND category active
AND has active variant
```

Current POS out-of-stock UI:

```text
product inactive
OR no variants
OR all variants inactive
```

This is UI-only and not inventory-aware.

### Target Store Availability

Availability must be evaluated per store:

```text
Input: storeId, productVariantId, quantity

1. Validate store exists and active.
2. Validate product exists and active.
3. Validate category active.
4. Validate variant exists, belongs to product, active.
5. Load active recipe by variant.
6. For each recipe ingredient:
   required = recipeIngredient.quantity * requestedQuantity
   currentStock = SUM(stock_movements) by storeId + ingredientId
   if currentStock < required -> unavailable
7. Return available/unavailable with missing ingredient details for internal/POS use.
```

Public customer menu design options:

- Option A: No store context. Show catalog only, validate stock during checkout. Simple but customer may see unavailable item late.
- Option B: Require selected store before menu. Return store-specific availability. Better for POS/pickup and inventory correctness.
- Option C: Hybrid. Public menu global, POS/store endpoints availability-aware.

Recommended for Lowlands:

- Keep `/api/v1/products` as global catalog.
- Add future `/api/v1/stores/{storeId}/menu` for POS/store-aware selling.
- Checkout must always revalidate availability server-side.

### Order Completed Stock OUT

Future flow:

```text
Order status -> COMPLETED
-> For each order item:
   productVariantId + quantity
   load active recipe
   create OUT stock_movements per recipe ingredient
   reference_type = ORDER
   reference_id = order.id
-> transaction commits order status and stock movements together
```

Rules:

- Stock deduction should be idempotent. Completing the same order twice must not create duplicate OUT rows.
- If stock is insufficient, reject completion or require manager override as a separate approved rule.
- Topping ingredients are not modeled; toppings currently do not consume inventory unless future `topping_ingredients` is introduced.

## 9. API Design Recommendations

Keep existing APIs:

- `GET /api/v1/menu`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/categories`
- Admin product/category/topping CRUD

Add/extend after confirmation:

| API | Purpose |
|---|---|
| `GET /api/v1/products?page=&size=&categoryId=&search=&minPrice=&maxPrice=` | Public paginated catalog |
| `GET /api/v1/admin/products?page=&size=&status=&categoryId=&search=` | Admin scalable list |
| `GET /api/v1/admin/products/{id}` | Admin detail including inactive children |
| `GET /api/v1/stores/{storeId}/menu` | Store/POS menu with availability |
| `GET /api/v1/stores/{storeId}/products/{productId}/availability` | Detail availability |
| `POST /api/v1/orders/validate-items` | Optional pre-check cart before checkout |

Response design for availability:

```json
{
  "productId": 1,
  "variantId": 10,
  "available": false,
  "reason": "INSUFFICIENT_STOCK",
  "missingIngredients": [
    {
      "ingredientId": 5,
      "ingredientName": "Milk",
      "required": 200,
      "currentStock": 120,
      "unit": "ml"
    }
  ]
}
```

## 10. Frontend Design Recommendations

### Admin Product

- Load admin toppings and provide real topping multi-select.
- Send selected `toppingIds` on create/update.
- Await API result before success toast.
- Prevent submit when no variant price > 0.
- Display backend validation errors from ApiResponse message.
- Warn when selected category is inactive.

### Customer Menu

- Use backend query params instead of client-only filtering when pagination is added.
- Keep no mock fallback.
- Quick add should either:
  - Add default variant only when no required choices exist, or
  - Navigate/open detail/configurator if product has toppings/multiple variants.

### Product Detail

- If store availability exists, disable unavailable variant and show unavailable status.
- Re-fetch product before checkout or rely on checkout validation.

### POS

- Replace public catalog hydration with future store menu endpoint.
- Resolve `storeId` from authenticated user's store assignment; remove hardcoded `storeId: 2`.
- Checkout through backend order API once available.
- Do not use local order store as source of truth for sales/stock.

## 11. Open Decisions Before Coding

Critical:

- Product name: resolved. Not globally unique; optional duplicate prevention should be category-scoped later.
- Variant/topping price: resolved. Variant price `> 0`; topping price `>= 0`.
- Availability scope: global catalog only, store-specific POS only, or store-specific customer menu too?
- Missing recipe: block selling or allow selling without stock deduction?
- Insufficient stock: block order, block completion, or allow manager override?
- Product update: resolved. Preserve variant ids and inactivate omitted variants.

Medium:

- Should Manager manage product catalog or only Admin?
- Should inactive category be selectable in Admin Product form?
- Should inactive topping remain attached but hidden, or be blocked from attachment?
- Should public API include availability reason, or only boolean?

Optional:

- SKU/code introduction.
- Product sort order and featured flags.
- Topping inventory model.
- Product image upload.

## 12. Danh Sach Viec Can Sua Truoc Sprint Coding

1. Chot business rules trong `docs/product-business-analysis.md`.
2. Cap nhat API contract neu them pagination/availability/store menu.
3. Quyet dinh variant update strategy de khong pha recipe FK.
4. Dong bo frontend admin topping selection voi backend `toppingIds`.
5. Dong bo enum order/payment/promotion truoc khi code Order Module.
6. Chon cach xu ly inventory availability theo store.
7. Chi sau khi cac muc tren duoc xac nhan moi bat dau coding.
