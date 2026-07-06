# Frontend Product Test Report

## 1. Environment Result

- `code/frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`.
- Backend was started through the existing backend script path (`npm.cmd run backend` / `scripts/run-backend-neon.js`).
- Backend Swagger check passed: `http://localhost:8080/swagger-ui/index.html` returned `200`.
- Backend product API check passed: `GET /api/v1/products` returned real `ApiResponse.data`.
- Frontend `npm.cmd run dev` started successfully with Next.js 16.2.9 and `.env.local`.
- Frontend routes compiled and returned `200`:
  - `http://localhost:3000/vi/menu`
  - `http://localhost:3000/vi/menu/1`
  - `http://localhost:3000/vi/admin/products`
  - `http://localhost:3000/vi/admin/categories`
  - `http://localhost:3000/vi/staff/pos`
- No missing package error was found. `next-intl` is installed and Next dev reached `Ready`.

Note: Maven initially failed inside the sandbox because dependency download was blocked. Backend was then run with approved network access and started successfully.
Note: The frontend dev server was verified during foreground/parallel route checks. A persistent hidden background Next.js process did not stay alive in this CLI session, so browser click-through was not left running at the end.

## 2. Admin Category Test Result

Tested through real backend API with admin token:

- Admin login succeeded with `admin@lowlands.coffee`.
- `GET /api/v1/admin/categories` works with Bearer token.
- `POST /api/v1/admin/categories` created a test category in the real database.
- `PUT /api/v1/admin/categories/{id}` updated the category.
- `DELETE /api/v1/admin/categories/{id}` soft-deleted/deactivated the category.
- Inactive category no longer appears in public `GET /api/v1/categories`.
- Products under inactive category do not appear in public `GET /api/v1/products`.
- Frontend category page defers success toast until awaited store action succeeds.

Result: PASS.

## 3. Admin Product Test Result

Tested through real backend API with admin token:

- `GET /api/v1/admin/products` works with Bearer token.
- `POST /api/v1/admin/products` created a product with active category, M/L variants, active status, and active topping.
- Created product was persisted in the real database and returned by product detail API.
- `PUT /api/v1/admin/products/{id}` updated the product.
- Variant ids were preserved after update.
- `DELETE /api/v1/admin/products/{id}` soft-deleted/deactivated the product.
- Variant price `0` was rejected with HTTP `400`.
- Active product assigned to inactive category was rejected with HTTP `400`.
- Active product assigned to inactive topping was rejected with HTTP `400`.
- Frontend product page defers success toast until awaited store action succeeds.

Bug fixed:

- Admin Product update previously generated fake variant ids (`productId * 100 + n`) instead of preserving backend `product_variants.id`.
- Create request now omits variant `id`; update request sends real existing variant ids when available.

Result: PASS after fix.

## 4. Public Menu Test Result

Verified through real backend API and compiled frontend route:

- `GET /api/v1/products` returns active public products from backend.
- `GET /api/v1/categories` returns active categories from backend.
- `GET /api/v1/menu` returns active categories and active products.
- Active product in active category appears in public API.
- Product under inactive category is hidden.
- Inactive/deleted product is hidden.
- Product detail/list only expose active toppings and active variants.
- Frontend menu route compiled successfully at `/vi/menu`.
- Source check found no `INITIAL_PRODUCTS` or `mock/products` use as primary source in product service/store/menu/POS paths. The only `fallback` match is a loading UI fallback, not mock data.

Result: PASS.

## 5. Product Detail Test Result

Verified through real backend API and compiled frontend route:

- `GET /api/v1/products/{id}` returns product detail from backend.
- Detail response includes correct variants.
- Detail response includes active topping.
- Inactive topping is not exposed in public detail.
- Frontend detail route compiled successfully at `/vi/menu/1`.
- Product detail page uses `getProductById()` and does not fallback to mock product data.

Result: PASS for API and route compile. Full browser click-through was not available because the in-app browser instance was unavailable in this session.

## 6. Staff POS Test Result

Verified by source review, backend API, and compiled frontend route:

- POS page calls `hydrateProductCatalog("public")`.
- `hydrateProductCatalog("public")` calls real `getProducts()` and `getCategories()`.
- POS route compiled successfully at `/vi/staff/pos`.
- Search/filter logic uses backend-loaded `products` and `categories` from Zustand state.
- Add-to-cart remains local POS behavior, as expected because Order Module is not integrated yet.
- No mock product catalog is used as primary source.

Result: PASS for Product/POS catalog integration. Order checkout remains intentionally local.

## 7. API Calls Verified

Public:

- `GET /api/v1/products`
- `GET /api/v1/categories`
- `GET /api/v1/menu`
- `GET /api/v1/products/{id}`

Admin:

- `POST /api/v1/auth/login`
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`
- `GET /api/v1/admin/categories`
- `POST /api/v1/admin/categories`
- `PUT /api/v1/admin/categories/{id}`
- `DELETE /api/v1/admin/categories/{id}`
- `POST /api/v1/admin/toppings`

Authorization:

- Admin APIs work with `Authorization: Bearer <token>`.
- `GET /api/v1/admin/products` without Bearer token returned `403`.
- `product.service.ts` unwraps `ApiResponse.data`.
- `axios.ts` attaches Bearer token from `localStorage.lowlands_token`.

## 8. Files Changed

- `code/frontend/src/store/dashboardStore.ts`
- `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx`
- `docs/frontend-product-test-report.md`

No backend code, backend migration, or large UI redesign was added.

## 9. Bugs Fixed

- Fixed Admin Product update request to preserve real backend variant ids by size.
- Fixed create request mapping so new product variants do not send fake ids to backend.

## 10. Remaining Issues

- In-app browser `iab` was unavailable in this session, so full visual click-through could not be automated. API verification and route compilation were completed instead.
- Hidden background Next.js process did not stay alive in this CLI session after reporting `Ready`; run `npm.cmd run dev` in `code/frontend` for continued manual browser testing.
- Admin Product UI still has no real topping selector; create currently sends no toppings from UI unless product data already contains toppings.
- POS still creates checkout/order locally; this is expected until Order Module frontend integration.
- POS/product availability is not inventory-aware yet because store-specific availability endpoints are deferred.

## 11. Final Conclusion

Product frontend is integrated with real backend API and ready for the next module.
