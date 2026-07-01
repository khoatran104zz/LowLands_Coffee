# Admin Implementation Report

Date: 2026-07-01

## Pages Integrated With Real API

- Admin Branches: now uses Store API through `store.service.ts` for list/create/update/delete and reloads after mutations.
- Admin Employees: uses User API through `dashboardStore.hydrateUsers`, `createUser`, `updateUser`, `deleteUser`; filters STAFF/MANAGER only and displays backend `employeeCode` from the Employee profile.
- Admin Customers: uses User API and filters CUSTOMER users.
- Admin Dashboard: uses `/api/v1/admin/dashboard/summary` only.
- Admin Categories, Products, Toppings: kept on real Product/Category/Topping admin APIs.
- Admin Ingredients, Suppliers, Recipes: kept on existing real services.
- Admin Goods Receipts: still uses Goods Receipt/Supplier/Ingredient APIs and now loads Store selector from Store API.
- Admin Stock: still uses Inventory/Ingredient APIs and now loads Store selector from Store API.
- Public Featured Products and Store Locator were also moved away from runtime mock data to public Product/Category and Store APIs.

## Pages Changed To Placeholder

- Admin Orders: shows "Order backend chua trien khai"; no `INITIAL_ORDERS`, local status updates, or mock order table.
- Admin Promotions: shows "Promotion backend chua trien khai"; no `INITIAL_PROMOTIONS` or local CRUD.
- Admin Reports: shows "Order/Payment backend chua trien khai"; no mock revenue, random branch revenue, or mock order charts.
- Admin Dashboard charts: no-data states for revenue by month, revenue by branch, best sellers, and customer growth until real report endpoints exist.

## Services Added / Changed

- Added `code/frontend/src/services/store.service.ts`
  - `getStores`
  - `getStoreById`
  - `createStore`
  - `updateStore`
  - `deleteStore`
- Added `code/frontend/src/services/promotion.service.ts`
  - `getPromotions` throws a clear "Promotion backend chua trien khai" error.
- Changed `auth.service.ts`
  - now only contains auth/profile functions.
  - removed Store and Promotion runtime helpers.
- Changed `order.service.ts`
  - no longer imports mock orders.
  - `createOrder` and `getOrderHistory` throw clear "Order backend chua trien khai" errors.
- Changed `inventory.service.ts`
  - added `getStockMovements`; UI does not yet have a stock movement history section.

## Runtime Mocks Removed / Kept

Removed from runtime Admin/source-of-truth paths:

- `INITIAL_BRANCHES`
- `INITIAL_EMPLOYEES`
- `INITIAL_CUSTOMERS`
- `INITIAL_ORDERS`
- `INITIAL_PROMOTIONS`
- `INITIAL_INGREDIENTS`
- Store locator fallback mock stores
- Homepage featured product mock catalog
- POS promotion source from `dashboardStore.promotions`

Kept:

- Files under `code/frontend/src/mock/*` still exist as fixtures, but they are not imported by the updated Admin runtime/services/store/home/POS paths.

## Backend APIs Used

- `/api/v1/stores`
- `/api/v1/users`
- `employees.employee_code` is returned through User API responses for STAFF/MANAGER users.
- `/api/v1/admin/dashboard/summary`
- `/api/v1/admin/categories`
- `/api/v1/admin/products`
- `/api/v1/admin/toppings`
- `/api/v1/ingredients`
- `/api/v1/ingredient-categories`
- `/api/v1/suppliers`
- `/api/v1/recipes`
- `/api/v1/goods-receipts`
- `/api/v1/inventory/stock-balances`
- `/api/v1/inventory/stock-adjustments`
- `/api/v1/products`
- `/api/v1/categories`

## Backend APIs Missing

- Order API
- Payment API
- Promotion API
- Cart API
- Customer Address API
- StoreUser assignment API for employee-to-store assignment
- Detailed revenue/report endpoints

## Files Changed

- `code/frontend/src/services/store.service.ts`
- `code/frontend/src/services/promotion.service.ts`
- `code/frontend/src/services/auth.service.ts`
- `code/frontend/src/services/order.service.ts`
- `code/frontend/src/services/inventory.service.ts`
- `code/frontend/src/store/dashboardStore.ts`
- `code/frontend/src/app/[locale]/(dashboard)/admin/branches/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/employees/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/customers/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/import-notes/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/stock/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/orders/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/promotions/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/admin/reports/page.tsx`
- `code/frontend/src/components/pos/POSCart.tsx`
- `code/frontend/src/components/features/home/FeaturedProducts.tsx`
- `code/frontend/src/components/features/home/StoreLocator.tsx`
- `code/frontend/src/app/[locale]/(customer)/cart/page.tsx`

## Test Result

- `npm.cmd run type-check`: passed.
- `npm.cmd run dev`: started successfully at `http://localhost:3000`.
- Backend employee integration added later: `mvn test` passed after Flyway V20 and Employee module changes.

## Remaining Issues

- Employee store assignment is shown as unsupported until StoreUser assignment API exists.
- Employee profile exists for STAFF/MANAGER users, but StoreUser assignment still references `users.id` through `store_users.staff_id`.
- Admin Reports and detailed Dashboard charts remain no-data placeholders until Order/Payment/report APIs exist.
- POS checkout still cannot create a real backend order because Order backend is missing.
- Customer cart promotion entry now routes to a clear backend-not-implemented service instead of mock data.

## Next Recommended Sprint

1. Implement Order backend and wire Admin Orders/POS checkout/customer checkout to real API.
2. Implement Payment backend so dashboard/report revenue can use a trustworthy source.
3. Implement Promotion backend and replace placeholder promotion service.
4. Add StoreUser assignment endpoint and integrate employee-to-store assignment.
5. Add report endpoints for revenue by store/month, best sellers, and customer growth.
