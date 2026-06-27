# Sprint 2 Product Module Report

## Migrations created

- `V9__create_product_menu_tables.sql`
- `V10__seed_product_permissions.sql`
- `V11__fix_product_topping_unique_constraints.sql`
- `V12__add_category_name_unique_constraint.sql`

## Tables created

- `categories`
- `products`
- `product_variants`
- `toppings`
- `product_toppings`

## Permissions seeded

- `CATEGORY_VIEW`, `CATEGORY_CREATE`, `CATEGORY_UPDATE`, `CATEGORY_DELETE`
- `PRODUCT_VIEW`, `PRODUCT_CREATE`, `PRODUCT_UPDATE`, `PRODUCT_DELETE`
- `TOPPING_VIEW`, `TOPPING_CREATE`, `TOPPING_UPDATE`, `TOPPING_DELETE`
- All product module permissions are assigned to `ADMIN`.

## Backend files created

- Product module package: `code/backend/src/main/java/com/lowlands/coffee/modules/product`
- Created 39 product module files across `controller`, `dto/request`, `dto/response`, `entity`, `mapper`, `repository`, `service`, and `service/impl`.
- Added `DuplicateResourceException`.
- Updated `GlobalExceptionHandler` for `409 Conflict`.

## APIs implemented

- Public:
  - `GET /api/v1/menu`
  - `GET /api/v1/categories`
  - `GET /api/v1/products`
  - `GET /api/v1/products/{id}`
- Admin category:
  - `GET /api/v1/admin/categories`
  - `POST /api/v1/admin/categories`
  - `PUT /api/v1/admin/categories/{id}`
  - `DELETE /api/v1/admin/categories/{id}`
- Admin product:
  - `GET /api/v1/admin/products`
  - `POST /api/v1/admin/products`
  - `PUT /api/v1/admin/products/{id}`
  - `DELETE /api/v1/admin/products/{id}`
- Admin topping:
  - `GET /api/v1/admin/toppings`
  - `POST /api/v1/admin/toppings`
  - `PUT /api/v1/admin/toppings/{id}`
  - `DELETE /api/v1/admin/toppings/{id}`

## Security changes

- Public `permitAll`: `/api/v1/menu`, `/api/v1/categories`, `/api/v1/products`, `/api/v1/products/**`.
- Admin controllers use `@PreAuthorize` with requested permissions:
  - Category: `CATEGORY_VIEW/CREATE/UPDATE/DELETE`
  - Product: `PRODUCT_VIEW/CREATE/UPDATE/DELETE`
  - Topping: `TOPPING_VIEW/CREATE/UPDATE/DELETE`

## Frontend files changed

- `code/frontend/src/services/product.service.ts`
  - Calls real backend APIs through `axiosInstance`.
  - Unwraps `ApiResponse.data`.
  - Adds admin product/category/topping helpers.
- `code/frontend/src/store/dashboardStore.ts`
  - Hydrates products/categories from backend APIs.
  - Keeps the existing frontend state shape.
  - Admin product/category CRUD now calls backend APIs.
- `code/frontend/.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`

## Test result

- `mvn test -q`: PASS. Flyway applied 12 migrations on H2 test DB.
- `mvn clean install`: PASS.
- PostgreSQL Flyway: PASS. Local schema is at version 12.
- Constraint check: `categories.name` and `toppings.name` are unique; `products.name` is not unique.
- `npm install` at repo root: PASS.
- `npm run type-check` in frontend: PASS.
- `npm run dev` at repo root: PASS. Backend runs on `8080`, frontend runs on `3000`.
- Swagger: `GET /swagger-ui.html` returns `302` to `/swagger-ui/index.html`.
- Public APIs:
  - `GET /api/v1/menu`: `success=true`, active categories `1`, active products `1`.
  - `GET /api/v1/products`: `success=true`, products `1`.
- Auth/admin APIs:
  - Admin login: `200`.
  - Admin product/category/topping CRUD with token: create `201`, update `200`, delete `200`.
  - Duplicate category/topping name: `409`.
  - Duplicate variant size validation: `400`.
  - Missing public product: `404`.
- Frontend:
  - `GET /vi/menu`: `200`.
  - Customer menu/detail code paths call real `product.service.ts`.
  - Admin product/category and POS read products/categories from API-hydrated dashboard store.

## Remaining issues

- No blocking ERD/contract/code conflict found. For audit fields, implementation follows the product API contract and ERD shape: product/category include timestamps; variant/topping responses match contract without timestamps.
- In-app browser session `iab` was unavailable, so frontend verification was done through HTTP checks plus service/store code-path inspection.
- Existing non-blocking warnings remain: Next middleware deprecation, Spring open-in-view warning, and older MapStruct unmapped-property warnings outside the product module.
- Admin CRUD verification leaves soft-deleted inactive temporary rows in the local database, which do not appear in public active menu results.
