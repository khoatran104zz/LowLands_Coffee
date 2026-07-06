# Admin Implementation Gap Report

Date: 2026-07-01

## 1. Scope

This report audits the current Admin implementation against the new Admin UI and the documented business domain. It does not change code, migrations, or database state.

Reviewed areas:

- `docs/convention.md`
- `docs/system-business-domain-analysis.md`
- `docs/system-business-flow.md`
- `docs/system-module-relationship.md`
- `docs/system-permission-matrix.md`
- `docs/system-gap-analysis.md`
- `docs/DB-erd/database-note.md`
- `docs/api-contract/*`
- `code/backend/src/main/java/com/lowlands/coffee`
- `code/backend/src/main/resources/db/migration`
- `code/frontend/src/app/[locale]/(dashboard)/admin`
- `code/frontend/src/services`
- `code/frontend/src/store`
- `code/frontend/src/components`
- `code/frontend/src/types`
- `code/frontend/src/lib/axios.ts`

## 2. Executive Summary

The new Admin UI already has routes for most target business modules:

- Dashboard
- Branches
- Employees
- Categories
- Products
- Toppings
- Ingredients
- Suppliers
- Goods receipts
- Stock
- Recipes
- Orders
- Customers
- Promotions
- Reports

The backend already supports the main setup and inventory domains:

- Auth
- User
- Role
- Permission
- Store
- Product
- Category
- Topping
- Supplier
- Ingredient
- Ingredient Category
- Recipe
- Goods Receipt
- Inventory / Stock Movement
- Dashboard summary

Major gaps remain in Sales and Marketing:

- No backend module was found for Order, Payment, Cart, Promotion, or Customer Address.
- Admin Orders and Promotions are still runtime mock/local-state screens.
- Dashboard and Reports still derive revenue/order charts from mock/local orders when backend summary is incomplete.
- Branch CRUD exists in backend, but the Admin Branch page still uses local Zustand state.
- Store data is mixed into `auth.service.ts`; no dedicated `store.service.ts` exists.
- `order.service.ts` returns mock data and creates local orders.

## 3. Admin Screens With UI

| Screen | Route file | UI status |
| --- | --- | --- |
| Dashboard | `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx` | Exists |
| Branch management | `code/frontend/src/app/[locale]/(dashboard)/admin/branches/page.tsx` | Exists |
| Category management | `code/frontend/src/app/[locale]/(dashboard)/admin/categories/page.tsx` | Exists |
| Product management | `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx` | Exists |
| Topping management | `code/frontend/src/app/[locale]/(dashboard)/admin/toppings/page.tsx` | Exists |
| Employee management | `code/frontend/src/app/[locale]/(dashboard)/admin/employees/page.tsx` | Exists |
| Customer management | `code/frontend/src/app/[locale]/(dashboard)/admin/customers/page.tsx` | Exists |
| Order management | `code/frontend/src/app/[locale]/(dashboard)/admin/orders/page.tsx` | Exists |
| Promotion management | `code/frontend/src/app/[locale]/(dashboard)/admin/promotions/page.tsx` | Exists |
| Reports | `code/frontend/src/app/[locale]/(dashboard)/admin/reports/page.tsx` | Exists |
| Ingredients | `code/frontend/src/app/[locale]/(dashboard)/admin/ingredients/page.tsx` | Exists |
| Suppliers | `code/frontend/src/app/[locale]/(dashboard)/admin/suppliers/page.tsx` | Exists |
| Goods receipts | `code/frontend/src/app/[locale]/(dashboard)/admin/import-notes/page.tsx` | Exists |
| Stock | `code/frontend/src/app/[locale]/(dashboard)/admin/stock/page.tsx` | Exists |
| Recipes | `code/frontend/src/app/[locale]/(dashboard)/admin/recipes/page.tsx` | Exists |
| POS shortcut | `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx` | Exists outside Admin menu |

Admin menu coverage in `code/frontend/src/components/admin/Sidebar.tsx` is mostly aligned with the target domain. It includes Organization, Menu, Warehouse, Recipe, Business, and Reports groups.

## 4. Screens Using Mock Or Local State

| Screen / area | Current source | Issue |
| --- | --- | --- |
| Branches | `useDashboardStore.branches` initialized from `INITIAL_BRANCHES` | Backend Store API exists, but Admin Branch CRUD is local only. |
| Employees | `useDashboardStore.employees`, hydrated from User API but branch/performance fields are synthetic | User CRUD is real, but branch assignment uses `branchId = 1`; performance and shift are fake. |
| Customers | `useDashboardStore.customers`, hydrated from User API role `CUSTOMER` | Customer profile list is real-ish from User API, but order count and spending are hardcoded `0`. |
| Orders | `useDashboardStore.orders` initialized from `INITIAL_ORDERS` | No backend Order module; status updates are local only. |
| Promotions | `useDashboardStore.promotions` initialized from `INITIAL_PROMOTIONS` | No backend Promotion module; CRUD is local only. |
| Dashboard charts | `useDashboardStore.orders`, `customers`, `branches` plus partial dashboard summary | Summary call is real, but revenue by branch, best sellers, customer growth, and fallback counts use local/mock state. |
| Reports | `useDashboardStore.orders`, `branches` | Reports are based on local/mock order data. |
| Stock branch selector | `useDashboardStore.branches` | Stock balances come from backend, but store options are mock/local branches. |
| Goods receipt store selector | `useDashboardStore.branches` | Goods receipt API is real, but store selection uses mock/local branches. |
| POS promotions | `useDashboardStore.promotions` | POS discount source is local promotion mock. |
| Public featured products | `src/mock/products` via `FeaturedProducts.tsx` | Public home can diverge from backend product source. |
| Store locator fallback | fallback mock stores in `StoreLocator.tsx` | API failures are hidden by fallback mock stores. |

Runtime mock sources found:

- `code/frontend/src/mock/branches.ts`
- `code/frontend/src/mock/employees.ts`
- `code/frontend/src/mock/customers.ts`
- `code/frontend/src/mock/orders.ts`
- `code/frontend/src/mock/products.ts`
- `code/frontend/src/store/dashboardStore.ts`
- `code/frontend/src/services/order.service.ts`
- `code/frontend/src/services/auth.service.ts` via `getPromotions()` returning `[]`

## 5. Screens Calling Real API

| Screen / area | API usage | Notes |
| --- | --- | --- |
| Dashboard summary | `getAdminDashboardSummary()` | Uses `/admin/dashboard/summary`; charts still use mock/local order data. |
| Categories | `hydrateProductCatalog("admin")`, `createAdminCategory`, `updateAdminCategory`, `deleteAdminCategory` | Uses Admin Category API through `dashboardStore`. |
| Products | `hydrateProductCatalog("admin")`, `createAdminProduct`, `updateAdminProduct`, `deleteAdminProduct` | Uses Admin Product API through `dashboardStore`. |
| Toppings | `hydrateProductCatalog("admin")`, `createAdminTopping`, `updateAdminTopping`, `deleteAdminTopping` | Uses Admin Topping API through `dashboardStore`. |
| Employees | `getUsers`, `createUser`, `updateUser`, `deleteUser` | Uses User API, but branch assignment and performance are synthetic. |
| Customers | `getUsers` filtered by `CUSTOMER` | Uses User API, but customer sales summary is not real. |
| Suppliers | `getSuppliers`, `createSupplier`, `updateSupplier`, `deleteSupplier` | Uses Supplier API. |
| Ingredients | `getIngredients`, `getIngredientCategories`, create/update/delete APIs | Uses Ingredient and Ingredient Category API. |
| Recipes | `getRecipes`, `createRecipe`, `updateRecipe`, `deleteRecipe`, plus products/ingredients | Uses Recipe API. |
| Goods receipts | `getGoodsReceipts`, `getGoodsReceiptById`, create/update/delete/complete APIs | Uses Goods Receipt API. |
| Stock | `getStockBalances`, `createStockAdjustment`, `getIngredients` | Uses Inventory API for balances/adjustments. |

## 6. Frontend Service Layer Audit

| Service | Status | Gap |
| --- | --- | --- |
| `auth.service.ts` | Uses `axiosInstance` and unwraps `ApiResponse.data` | Contains `getStores()` and `getPromotions()`; should only handle auth/profile. `getPromotions()` returns an empty array. |
| `dashboard.service.ts` | Uses `axiosInstance` and unwraps API response | OK for summary; deeper reporting endpoints are missing. |
| `goods-receipt.service.ts` | Uses `axiosInstance` and unwraps API response | OK. |
| `ingredient.service.ts` | Uses `axiosInstance` and unwraps API response | OK. |
| `inventory.service.ts` | Uses `axiosInstance` and unwraps API response | Has balances and adjustment; no stock movement list method on frontend despite backend endpoint existing. |
| `order.service.ts` | Uses `INITIAL_ORDERS` mock | Must be replaced or marked placeholder until Order backend exists. |
| `product.service.ts` | Uses `axiosInstance` and unwraps API response | OK for product/category/topping. |
| `recipe.service.ts` | Uses `axiosInstance` and unwraps API response | OK. |
| `supplier.service.ts` | Uses `axiosInstance` and unwraps API response | OK. |
| `user.service.ts` | Uses `axiosInstance` and unwraps API response | OK for user CRUD; no store-user assignment API client. |
| Missing `store.service.ts` | N/A | Required for Store CRUD; currently store read is in `auth.service.ts` and Admin Branch CRUD is local. |
| Missing `promotion.service.ts` | N/A | Required if backend promotion API is added. |

`code/frontend/src/lib/axios.ts` attaches Bearer token automatically from `lowlands_token` and clears local auth state on 401. It does not currently surface a user-facing 401/403 message by itself.

## 7. Zustand Store Audit

`code/frontend/src/store/dashboardStore.ts` is the largest source of mixed real and mock runtime data.

Real API-backed actions:

- `hydrateProductCatalog`
- Product CRUD
- Category CRUD
- Topping CRUD
- `hydrateUsers`
- Employee user create/update/delete

Mock/local actions:

- Branch CRUD
- Order creation/status update
- Promotion CRUD
- Local ingredient quantity update/import

Important gaps:

- Initial branches, employees, customers, orders, promotions, and local ingredients are mock data.
- Employee hydration assigns all users to branch id `1`.
- Employee performance and working shift are generated on the frontend.
- Customer `orderCount` and `totalSpent` are generated as `0` unless local orders mutate them.
- Persisted Zustand storage can keep stale mock data in `localStorage`.

## 8. Backend API Coverage

Backend modules found under `code/backend/src/main/java/com/lowlands/coffee/modules`:

- `auth`
- `dashboard`
- `ingredient`
- `inventory`
- `permission`
- `product`
- `recipe`
- `role`
- `store`
- `supplier`
- `user`

Implemented API coverage:

| Domain | Backend status | Controller base path |
| --- | --- | --- |
| Auth | Implemented | `/api/v1/auth` |
| User / Employee / Customer as user role | Implemented | `/api/v1/users` |
| Role | Implemented | `/api/v1/roles` |
| Permission | Implemented | `/api/v1/permissions` |
| Store | Implemented | `/api/v1/stores` |
| Category admin | Implemented | `/api/v1/admin/categories` |
| Category public | Implemented | `/api/v1/categories` |
| Product admin | Implemented | `/api/v1/admin/products` |
| Product public | Implemented | `/api/v1/products` |
| Public menu | Implemented | `/api/v1/menu` |
| Topping admin | Implemented | `/api/v1/admin/toppings` |
| Supplier | Implemented | `/api/v1/suppliers` |
| Ingredient | Implemented | `/api/v1/ingredients` |
| Ingredient Category | Implemented | `/api/v1/ingredient-categories` |
| Recipe | Implemented | `/api/v1/recipes` |
| Goods Receipt | Implemented | `/api/v1/goods-receipts` |
| Inventory / Stock Movement | Implemented | `/api/v1/inventory` |
| Admin dashboard summary | Implemented | `/api/v1/admin/dashboard/summary` |
| Manager dashboard summary | Implemented | `/api/v1/manager/dashboard/summary` |

Missing backend APIs for target Admin domain:

| Domain | Status | Impact |
| --- | --- | --- |
| Order | Missing/incomplete module | Admin Orders, POS checkout, customer checkout, revenue, stock OUT cannot be real. |
| Payment | Missing/incomplete module | Revenue and paid/refund lifecycle cannot be real. |
| Promotion | Missing module | Admin Promotions and POS/customer discount must remain placeholder or local-only until backend is added. |
| Cart | Missing module | Customer cart remains local. |
| Customer Address | Missing module | Delivery checkout cannot persist addresses. |
| Store User assignment | Entity/repository exists, but no clear Admin API found | Employee-to-store assignment cannot be completed from UI. |
| Report endpoints beyond summary | Missing | Admin Reports cannot use real revenue/order breakdowns yet. |

## 9. Backend Permission/Auth Audit

Current `SecurityConfig`:

- Public:
  - `/api/v1/auth/login`
  - `/api/v1/auth/register`
  - `/api/v1/auth/refresh-token`
  - `/api/v1/menu`
  - `/api/v1/categories`
  - `/api/v1/products`
  - `/api/v1/products/**`
- ADMIN role gate:
  - `/api/v1/admin/**`
- MANAGER role gate:
  - `/api/v1/manager/**`
- STAFF role gate:
  - `/api/v1/staff/**`
- All other APIs require authentication.

Controllers generally return `ApiResponse` and use `@PreAuthorize` for action-level permissions such as:

- `STORE_VIEW`, `STORE_CREATE`, `STORE_UPDATE`, `STORE_DELETE`
- `USER_VIEW`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
- `PRODUCT_*`, `CATEGORY_*`, `TOPPING_*`
- `SUPPLIER_*`
- `INGREDIENT_*`
- `RECIPE_*`
- `INVENTORY_VIEW`, `INVENTORY_ADJUST`
- `GOODS_RECEIPT_*`

Known conflict:

- Product/category/topping admin APIs live under `/api/v1/admin/**`, so they are effectively ADMIN-only even if another role had `PRODUCT_*`, `CATEGORY_*`, or `TOPPING_*` permissions.

## 10. File Change Candidates

### Replace or refactor

| File | Recommendation |
| --- | --- |
| `code/frontend/src/store/dashboardStore.ts` | Split runtime API state by domain or remove mock-backed source-of-truth behavior. Keep only cross-page state that is not backend-owned. |
| `code/frontend/src/services/auth.service.ts` | Move `getStores()` to `store.service.ts`; remove or replace `getPromotions()`. |
| `code/frontend/src/services/order.service.ts` | Replace mock implementation with backend client when Order API exists; otherwise make explicit placeholder that throws a clear backend-not-implemented error. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/branches/page.tsx` | Integrate with Store API. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/employees/page.tsx` | Remove fake performance/shift as source of truth; add real store assignment only when backend supports it. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/customers/page.tsx` | Keep User API list but remove/freeze fake order summary until Order backend exists. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/orders/page.tsx` | Replace mock order table with placeholder or real Order API after backend implementation. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/promotions/page.tsx` | Replace local CRUD with placeholder or real Promotion API after backend implementation. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx` | Stop deriving revenue/best-seller/customer charts from mock orders; use backend summary or show no-data state. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/reports/page.tsx` | Replace mock reports with backend data or no-data state. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/import-notes/page.tsx` | Replace branch options from mock store with Store API. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/stock/page.tsx` | Replace branch options from mock store with Store API; add stock movement list if needed. |
| `code/frontend/src/components/pos/POSCart.tsx` | Remove local promotion source or mark promotion backend as not implemented. |
| `code/frontend/src/components/features/home/FeaturedProducts.tsx` | Replace `INITIAL_PRODUCTS` / `INITIAL_CATEGORIES` with public product/category API. |
| `code/frontend/src/components/features/home/StoreLocator.tsx` | Remove silent fallback mock stores; show a clear API error state. |

### Add

| File | Purpose |
| --- | --- |
| `code/frontend/src/services/store.service.ts` | Store CRUD service using `axiosInstance`. |
| `code/frontend/src/services/promotion.service.ts` | Only after backend Promotion API exists. |
| Backend order module files | Needed for Admin Orders, POS/customer checkout, report revenue, and stock OUT. |
| Backend payment module files | Needed for real revenue/payment lifecycle. |
| Backend promotion module files | Needed for Admin Promotions and discount source of truth. |
| Store user assignment endpoint/service | Needed for employee-to-store assignment. |

### Remove or quarantine

| File / data | Recommendation |
| --- | --- |
| `src/mock/branches.ts` | Remove from runtime after Store API integration. Keep only under dev/test mock policy if needed. |
| `src/mock/employees.ts` | Remove from runtime after User API integration. |
| `src/mock/customers.ts` | Remove from runtime after User/Order integration. |
| `src/mock/orders.ts` | Remove from runtime; keep only for tests/story fixtures if needed. |
| `src/mock/products.ts` | Remove from runtime public home after public API integration. |
| `INITIAL_INGREDIENTS` in `dashboardStore.ts` | Remove from runtime; inventory source is backend stock ledger. |
| `INITIAL_PROMOTIONS` in `dashboardStore.ts` | Remove from runtime; no fake promotion source of truth. |

## 11. Proposed Implementation Order

1. Add `store.service.ts` and integrate Admin Branch page with real Store API.
2. Replace mock branch usage in Goods Receipt and Stock pages with real Store API.
3. Clean `auth.service.ts` so it only handles auth/profile.
4. Remove runtime store mocks for branches where backend is already available.
5. Normalize User/Employee/Customer pages:
   - use User API as source of truth;
   - remove fake performance;
   - keep customer order summary as `0` or "No data" until Order backend exists.
6. Replace Dashboard and Reports mock revenue/order charts with backend summary/no-data states.
7. For Orders and Promotions, choose one of two paths:
   - add real backend modules and integrate; or
   - show explicit "backend not implemented" placeholders and remove runtime mock source of truth.
8. Add store-user assignment backend/API if employee-to-store assignment is required in this sprint.
9. Add frontend stock movement list client if Admin Stock must display movement history.
10. Remove or quarantine remaining runtime mocks after each module is integrated.

## 12. Risk / Stop Conditions

Large cross-layer conflict remains around Sales:

- Admin Orders, POS checkout, customer checkout, revenue reporting, payment, promotion, and inventory OUT all require a real Order/Payment flow.
- Implementing only frontend Admin Orders without backend Order/Payment would continue the mock-source-of-truth problem.

Recommendation: before coding Order/Payment/Promotion, confirm the backend scope and database migration plan for the sales domain. Do not drop database or modify old migrations.

## 13. Phase 1 Conclusion

The Admin UI is visually broad enough for the target domain, but it is only partially integrated. The safest next implementation phase is to finish modules whose backend already exists, especially Store/Branch integration and removal of mock-derived dashboard/report values. Order, Payment, Promotion, Cart, and Customer Address should remain explicit placeholders unless backend modules are approved and implemented.
