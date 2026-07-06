# Role Integration Report

## Backend APIs added/updated

- `POST /api/v1/auth/register`: creates a real `users` row, hashes password with `PasswordEncoder`, assigns `CUSTOMER`, checks duplicate email/phone, and returns auth payload.
- `POST /api/v1/auth/login`: returns access token, refresh token, token type, user info, role, and permission codes.
- `GET /api/v1/admin/dashboard/summary`: returns `totalUsers`, `totalStores`, `totalProducts`, `totalOrders = 0`, `totalRevenue = 0`.
- `GET /api/v1/manager/dashboard/summary`: resolves the manager store from `store_users`, returns product/inventory counts, `totalOrders = 0`, `totalRevenue = 0`.
- Public product/menu APIs are used by frontend: `GET /api/v1/menu`, `GET /api/v1/categories`, `GET /api/v1/products`, `GET /api/v1/products/{id}`.
- Inventory read/write APIs are used by manager inventory: `GET /api/v1/inventory/stock-balances`, `POST /api/v1/inventory/stock-adjustments`.
- Security updated so only `login`, `register`, and `refresh-token` are public under auth; `/api/v1/auth/profile` requires JWT. Admin/manager/staff path matchers remain role protected.

## Seed data added

- Java bootstrap seeder creates idempotent system users with hashed passwords:
  - `admin@lowlands.coffee` / `Admin@123` / `ADMIN`
  - `manager@lowlands.coffee` / `Manager@123` / `MANAGER`
  - `staff@lowlands.coffee` / `Staff@123` / `STAFF`
  - `customer@lowlands.coffee` / `Customer@123` / `CUSTOMER`
- Manager, staff, and admin are assigned to the default store through `store_users`.
- Product/menu demo data already exists in Flyway migrations V15/V16.
- Bootstrap now also creates demo supplier, ingredient categories, ingredients, a completed goods receipt `GR-DEMO-001`, and matching `stock_movements` IN rows for inventory testing.

## Auth/register/login result

- Login verified against running backend with `admin@lowlands.coffee`; API returned `success: true`, JWTs, `role: ADMIN`, and permissions.
- Register path uses backend API and persists newly registered customers as real `CUSTOMER` users.
- Passwords are encoded by `PasswordEncoder`; no plaintext password is written by auth/register/bootstrap.

## Role redirect result

- Frontend login redirects by role:
  - `CUSTOMER` -> `/vi`
  - `ADMIN` -> `/vi/admin/dashboard`
  - `MANAGER` -> `/vi/manager/dashboard`
  - `STAFF` -> `/vi/staff/pos`
- Token, refresh token, and user are stored through `auth.store.ts`; Axios attaches `Authorization: Bearer <token>`.

## Frontend files changed

- Auth: `src/services/auth.service.ts`, `src/store/auth.store.ts`, login/register pages.
- Dashboard/product integration: `src/services/dashboard.service.ts`, `src/store/dashboardStore.ts`, admin dashboard/products/categories, manager dashboard, staff POS.
- Inventory integration: `src/services/inventory.service.ts`, manager inventory page.
- Types updated for role/permission and inventory store id support.

## Mock data removed/kept

- Product/menu/customer product detail/POS product source now uses backend API; no silent mock fallback for customer menu/product detail.
- Admin product/category hydration uses admin API explicitly; POS uses public product/category API explicitly.
- Mock data is still kept for modules without real backend scope in this task: local order history, employees, customers, promotions, and chart-only dashboard visuals.
- Backend dashboard order/revenue values intentionally return `0` until order/payment modules are implemented.

## Test result

- `cd code/backend && mvn clean install`: PASS.
- `cd code/frontend && npm.cmd run type-check`: PASS.
- `cd code/frontend && npm.cmd run build`: PASS after allowing network for Google Fonts fetch.
- Backend runtime check: PASS. `GET http://localhost:8080/api/v1/menu` returned `200`; login and product API calls returned data.
- Protected API check: PASS. Admin dashboard summary, manager dashboard summary, and inventory stock balances returned data with JWT.
- Frontend background runtime: build output is valid, but `npm run dev`, `next start`, and standalone Node server printed Ready then exited immediately in this tool-runner background process. Manual browser verification should use `cd code/frontend && npm.cmd run dev` in an interactive terminal.

## Remaining issues

- Manual browser redirects were not fully clicked through because the frontend background process would not stay alive in the tool-runner environment.
- Some dashboard charts still visualize local demo orders because order/payment reporting APIs are not implemented yet.
- Existing UI text contains mojibake in several older files; this task avoided large UI copy cleanup.
- Next.js warns that the `middleware` file convention is deprecated in favor of `proxy`.
