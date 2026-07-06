# Frontend Backend Integration Report

## Seed Migration Created

Created:

- `code/backend/src/main/resources/db/migration/V16__seed_frontend_demo_menu_data.sql`

Reason:

- Runtime API at `localhost:8080` was not reachable during the final integration check, so a new idempotent Flyway seed was added after the current migration version to guarantee the required demo catalog is available on the next PostgreSQL migration run.
- No old migration was modified.
- No Order, Payment, or Inventory runtime data was seeded.

## Demo Data Seeded

V16 seeds the required product catalog demo data idempotently:

- Categories:
  - Coffee
  - Tea
- Products:
  - Phin Sữa Đá
  - Latte
  - Trà Đào
- Variants:
  - Size M
  - Size L
  - Each seeded product has both sizes.
- Toppings:
  - Trân Châu
  - Coffee Jelly
- Links:
  - `product_variants` are linked to their products.
  - `product_toppings` links every seeded product to both seeded toppings.

Existing seed migration `V15__seed_sample_product_catalog.sql` is left unchanged.

## Frontend Files Changed

- `code/frontend/src/app/[locale]/(customer)/menu/[id]/page.tsx`
  - Removed `MOCK_PRODUCTS` fallback.
  - Product detail now loads only through `getProductById()`.
  - API failure now displays a clear backend API error.

- `code/frontend/src/store/dashboardStore.ts`
  - Product/category state remains hydrated from backend services.
  - Added `productCatalogError` so API failures are explicit instead of silent.
  - Product/category CRUD failures now set a visible error message.

- `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx`
  - Added a small API error banner bound to `productCatalogError`.
  - Existing table/form flow was kept.

Previously verified/kept:

- `code/frontend/src/services/product.service.ts`
  - Uses `axiosInstance`.
  - Calls real endpoints: `/products`, `/products/{id}`, `/categories`, `/admin/products`, `/admin/categories`, `/admin/toppings`.
  - Unwraps `ApiResponse.data`.

- `code/frontend/src/lib/axios.ts`
  - Uses `process.env.NEXT_PUBLIC_API_URL`.

- `code/frontend/.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`

## API Integration Result

Source check:

- Backend has `PublicMenuController` mapped to `/api/v1/menu`.
- Backend has `PublicProductController` mapped to `/api/v1/products`.
- Frontend menu list uses `getProducts()` and `getCategories()`.
- Frontend product detail uses `getProductById()`.
- Admin product store hydrates from backend product/category APIs.

Verification:

- `mvn test`: passed.
- Flyway test migration validation: passed with 16 migrations.
- `npm run type-check`: passed after clearing generated `.next` cache.
- `rg` check found no `MOCK_PRODUCTS`, `MOCK_CATEGORIES`, `offline_fallback`, or `constants/mock` usage in product menu routes, services, or store.

Runtime note:

- `GET http://localhost:8080/api/v1/menu` and `GET http://localhost:8080/api/v1/products` could not be completed in the final check because `localhost:8080` was not reachable.
- Attempts to keep backend running via `mvn spring-boot:run` and direct jar execution did not leave a listening process in this shell session.
- The backend code and migrations compile/test successfully; PostgreSQL runtime should apply V16 on the next normal backend startup.

## Mock Data Removed/Kept

Removed from product catalog integration path:

- Customer menu list no longer falls back to mock products.
- Customer menu detail no longer falls back to mock products.
- Dashboard product catalog state does not initialize from product mocks.
- Product services do not use mock data.

Kept outside this scope:

- Existing mock data for branches, employees, customers, orders, promotions, and some non-product UI/demo areas remains.
- Those mocks are not used as the primary source for product catalog data.

## Remaining Issues

- Live browser verification for:
  - `http://localhost:3000/vi/menu`
  - `http://localhost:3000/vi/menu/{id}`
  - `http://localhost:3000/vi/admin/products`

  was blocked in the final pass because backend `localhost:8080` and frontend `localhost:3000` could not be kept running persistently from this shell session.

- Admin product APIs may require a valid admin token in browser local storage. If admin auth is missing, the store read path can still use public backend product/category endpoints for hydration, but create/update/delete still require the admin backend API.
