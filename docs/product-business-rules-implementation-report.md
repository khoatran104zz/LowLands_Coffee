# Product Business Rules Implementation Report

## 1. Files Changed

Backend:

- `code/backend/src/main/java/com/lowlands/coffee/modules/product/dto/request/ProductVariantCreateRequest.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/product/dto/request/ProductVariantUpdateRequest.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/product/service/impl/ProductServiceImpl.java`
- `code/backend/src/main/resources/db/migration/V19__enforce_positive_product_variant_price.sql`
- `code/backend/src/test/java/com/lowlands/coffee/modules/product/service/ProductServiceImplTest.java`

Frontend:

- `code/frontend/src/store/dashboardStore.ts`
- `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/categories/page.tsx`

Documentation:

- `docs/api-contract/product-api.md`
- `docs/product-business-analysis.md`
- `docs/product-technical-design.md`
- `docs/product-business-rules-implementation-report.md`

## 2. Rules Implemented

### Variant Update Strategy

- Product update no longer clears/recreates all variants.
- Request variant with `id` updates the existing variant.
- Request variant without `id` creates a new variant.
- Existing variants omitted from the update request are set to `inactive`.
- Existing `product_variants.id` values are preserved, so `recipes.product_variant_id` references are not broken.
- Service rejects using a size already owned by another existing variant; callers must update the existing variant id instead.

### Category Rule

- Active product cannot be created or updated with an inactive category.
- Violation returns `BadRequestException`, mapped to HTTP 400 by `GlobalExceptionHandler`.
- Category inactive behavior remains non-cascading: product status is not changed automatically.
- Public API already excludes products under inactive categories.
- Admin API still lists inactive product/category data.

### Topping Rule

- Product still supports 0-N toppings.
- Public mapper already excludes inactive toppings.
- Active product cannot be created or updated with inactive toppings.
- Violation returns `BadRequestException`, mapped to HTTP 400.
- Product topping update now syncs relations by topping id instead of blindly clearing and recreating all rows.

### Price Rule

- Product variant price must be greater than 0.
- DTO validation changed from `@DecimalMin("0.00")` to `@DecimalMin("0.01")`.
- Migration V19 replaces the product variant price check constraint with `price > 0`.
- Topping price remains `>= 0`.

### Product Name Rule

- No global product name unique constraint was added.
- Documentation now records that duplicate prevention, if needed later, should be scoped within category.

### Frontend Integration

- Admin product create now sends `toppingIds` from the product data instead of forcibly sending an empty list.
- Since the current Admin Product form has no real topping selector, create sends `toppings: []` rather than hardcoded fake toppings.
- Product/category store actions now rethrow backend API failures.
- Admin product/category pages now show success toast only after awaited backend success.

## 3. Rules Deferred

- Store/POS availability endpoints were not implemented in this sprint.
  - Deferred endpoints:
    - `GET /api/v1/stores/{storeId}/menu`
    - `GET /api/v1/stores/{storeId}/products/{productId}/availability`
  - Reason: this needs new response models and stock/recipe availability composition. The current request allowed deferring if scope is too large and no Order Module should be built.
- Missing recipe and insufficient stock are not enforced in global `/api/v1/products`.
  - Global catalog still returns active catalog only.
  - Future store/POS availability should treat missing recipe or insufficient stock as unavailable.
- Order completion stock deduction was not implemented.
- Manager override was not implemented.
- Product duplicate-name validation within category was documented only; no migration or enforcement was added.

## 4. Migration Created

- `V19__enforce_positive_product_variant_price.sql`

Migration behavior:

- Drops old `chk_product_variants_price` if it exists.
- Adds `chk_product_variants_price CHECK (price > 0)`.
- Does not drop product data.
- Existing seed/demo variant prices are positive, so no data update was required.

## 5. Backend Test Result

Command:

```text
mvn clean install
```

Result:

- PASS.
- Tests run: 5.
- New ProductService tests cover:
  - Active product with inactive category is rejected.
  - Active product with inactive topping is rejected.
  - Variant price `0` is rejected by DTO validation.
  - Product update preserves requested variant id and inactivates omitted variant.
- Flyway validated and applied 19 migrations on H2 test DB.

Swagger check:

- `mvn spring-boot:run` was started with project `.env`.
- `/swagger-ui.html` returned `302 FOUND` to Swagger UI.
- The temporary backend process was stopped after the check.

## 6. Frontend Test Result

Command:

```text
npm.cmd run type-check
```

Result:

- PASS.
- `tsc --noEmit` completed successfully.

Note:

- `npm run type-check` through PowerShell `npm.ps1` is blocked by local execution policy, so `npm.cmd run type-check` was used.

## 7. Remaining Risks

- Admin Product UI still has no real topping selector, so create currently sends no toppings.
- Store/POS availability is still not inventory-aware.
- POS still uses local order state and hardcoded store behavior; no backend Order Module was implemented.
- Product list filtering/pagination is still in-memory in backend service and partially client-side in frontend.
- Product variant update preserves ids, but changing a variant size to one already used by another existing variant is rejected because DB unique `(product_id, size)` includes inactive variants.
- Existing non-blocking warnings remain from MapStruct unmapped properties, Spring open-in-view, and Mockito dynamic agent loading.
