# API Contract Rebuild Report

## Source of Truth Scanned

- Documentation: `docs/convention.md`, `docs/srs.md`, `docs/DB-erd/database-note.md`, `docs/DB-erd/coffee-shop-management.dbml`.
- Backend: `code/backend/src/main/java/com/lowlands/coffee/common`, `config`, `security`, and all `modules/*` controllers, DTOs, entities, repositories, services, mappers.
- Database migrations: `code/backend/src/main/resources/db/migration`.
- Frontend: `code/frontend/src/app`, `components`, `services`, `store`, `types`, `mock`, and Axios config.

## Modules Scanned

- Implemented backend modules: auth, user, role, permission, store, product, dashboard, supplier, ingredient, recipe, inventory, goods receipt.
- Frontend service modules: auth, product, dashboard, inventory, user, order.
- Frontend mock modules: products, branches, employees, customers, orders, local dashboard ingredients/promotions.

## APIs Discovered

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh-token`
- `GET /api/v1/auth/profile`
- `PUT /api/v1/auth/profile`

### Product Catalog

- Public: `GET /api/v1/menu`, `GET /api/v1/products`, `GET /api/v1/products/{id}`, `GET /api/v1/categories`
- Admin product: `GET/POST /api/v1/admin/products`, `PUT/DELETE /api/v1/admin/products/{id}`
- Admin category: `GET/POST /api/v1/admin/categories`, `PUT/DELETE /api/v1/admin/categories/{id}`
- Admin topping: `GET/POST /api/v1/admin/toppings`, `PUT/DELETE /api/v1/admin/toppings/{id}`

### Inventory and Receiving

- Inventory: `GET /api/v1/inventory/stock-movements`, `POST /api/v1/inventory/stock-adjustments`, `GET /api/v1/inventory/stock-balances`, `GET /api/v1/inventory/stores/{storeId}/ingredients/{ingredientId}/stock`
- Goods receipt: `GET/POST /api/v1/goods-receipts`, `GET/PUT/DELETE /api/v1/goods-receipts/{id}`, `POST /api/v1/goods-receipts/{id}/complete`
- Suppliers: `GET/POST /api/v1/suppliers`, `GET/PUT/DELETE /api/v1/suppliers/{id}`
- Ingredients: `GET/POST /api/v1/ingredient-categories`, `GET/PUT/DELETE /api/v1/ingredient-categories/{id}`, `GET/POST /api/v1/ingredients`, `GET/PUT/DELETE /api/v1/ingredients/{id}`
- Recipes: `GET/POST /api/v1/recipes`, `GET/PUT/DELETE /api/v1/recipes/{id}`

### RBAC and Users

- Users: `GET/POST /api/v1/users`, `GET/PUT/DELETE /api/v1/users/{id}`
- Roles: `GET/POST /api/v1/roles`, `GET/PUT/DELETE /api/v1/roles/{id}`
- Permissions: `GET/POST /api/v1/permissions`, `GET/PUT/DELETE /api/v1/permissions/{id}`

### Dashboard

- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/manager/dashboard/summary`

### Store

- `GET/POST /api/v1/stores`, `GET/PUT/DELETE /api/v1/stores/{id}`
- Store APIs were discovered and are used by `auth.service.ts#getStores`, but no `store-api.md` was requested in the target output list.

## Contracts Generated

- `docs/api-contract/README.md`
- `docs/api-contract/auth-api.md`
- `docs/api-contract/product-api.md`
- `docs/api-contract/inventory-api.md`
- `docs/api-contract/supplier-api.md`
- `docs/api-contract/ingredient-api.md`
- `docs/api-contract/recipe-api.md`
- `docs/api-contract/goods-receipt-api.md`
- `docs/api-contract/user-api.md`
- `docs/api-contract/role-api.md`
- `docs/api-contract/permission-api.md`
- `docs/api-contract/dashboard-api.md`

## Missing APIs

- Order APIs are not implemented in backend, while frontend `order.service.ts` creates orders locally and returns mock order history.
- Cart APIs are not implemented in backend; cart is local Zustand state.
- Promotion APIs are not implemented in backend; `getPromotions()` returns an empty array and dashboard promotions are local state.
- Customer address APIs are described in SRS/DBML but not implemented.
- Payment APIs are described in DBML but not implemented.
- Store APIs exist but no requested contract file was generated.
- Role-permission assignment APIs do not exist; roles expose permissions only in response.

## Deprecated or Inconsistent APIs

- `auth.service.ts#getStores()` calls `/stores` from the auth service; it should move to a store service/module contract.
- Permission naming has been standardized to `VIEW`, `CREATE`, `UPDATE`, `DELETE` in controllers and current contracts. Historical Flyway migrations still contain old codes, but V17 migrates active database state away from them.
- Store, user, role, and permission controllers now use action-level permissions instead of grouped manage permissions.
- `RoleServiceImpl.update()` and `PermissionServiceImpl.update()` do not check duplicate role name/permission code for other records.
- User delete is hard delete; several other modules use soft delete by setting `inactive`.

## Mock Usages Detected

- `src/services/order.service.ts` returns local order data and generated order ids/codes.
- `src/store/dashboardStore.ts` initializes branches, employees, customers, orders, promotions, and ingredients from local/mock data.
- `src/components/features/home/FeaturedProducts.tsx` imports `INITIAL_PRODUCTS` and `INITIAL_CATEGORIES`.
- `src/components/features/home/StoreLocator.tsx` falls back to mock stores if backend store API fails.
- Admin/manager/staff order/history/revenue pages import mock orders.
- Admin employee/customer pages hydrate users from backend but still derive branch/performance/order summary values locally.

## Frontend Issues Affecting Contracts

- `src/types/index.ts` contains unresolved merge-conflict markers around `role` and `permissions`.
- `src/store/dashboardStore.ts` contains unresolved merge-conflict markers around `hydrateProductCatalog`, `hydrateUsers`, and rehydrate behavior.
- `RegisterRequest.password` is required in both frontend and backend.
- Product creation in `dashboardStore.ts` currently excludes toppings when creating products.
- Dashboard admin/manager summary endpoints return placeholder `totalOrders = 0` and `totalRevenue = 0`.

## Recommended Improvements

- Add a `store-api.md` contract in a future docs pass, or add it to the requested contract list.
- Resolve frontend merge-conflict markers before relying on TypeScript builds.
- Replace hardcoded frontend role ids with `/roles`.
- Move store calls from `auth.service.ts` to a store service.
- Implement order, cart, promotion, customer address, and payment APIs before removing related mocks.
- Keep future permission seeds aligned with controller `@PreAuthorize` values using `VIEW`, `CREATE`, `UPDATE`, `DELETE`.
- Add duplicate checks on role and permission update.
- Consider soft delete/deactivation for users, roles, and permissions if historical records are required.
