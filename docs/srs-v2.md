# Software Requirements Specification v2 - Lowlands Coffee

## 1. Document Control

- Document: Software Requirements Specification
- Version: v2
- Project: Lowlands Coffee
- Source basis: current backend modules, frontend routes, services, database migrations, and project documents in this repository
- Date: 2026-07-08

## 2. Purpose

This SRS defines the current functional and non-functional requirements of the Lowlands Coffee system. It replaces the older high-level frontend-only SRS with a fuller product specification that reflects the implemented fullstack system.

The system supports:

- Customer-facing online coffee ordering.
- Staff POS and order operations.
- Manager store-scoped operations.
- Admin global operations.
- Product catalog, toppings, categories, recipes, ingredients, suppliers, inventory, goods receipts, orders, payments, promotions, reports, notifications, storage, users, roles, and permissions.

## 3. Product Scope

Lowlands Coffee is a web-based coffee shop management and ordering platform. It consists of:

- A public customer website for browsing menu, managing cart, checkout, payment result, profile, and order tracking.
- A dashboard portal for Admin, Manager, and Staff roles.
- A Spring Boot backend API with JWT authentication and RBAC authorization.
- A PostgreSQL database managed by Flyway migrations.
- MinIO-backed storage for product image uploads.

## 4. System Context

### 4.1 Frontend

- Framework: Next.js 16, React 19, TypeScript.
- Routing: App Router with locale segment `[locale]`.
- UI: Tailwind CSS, shadcn-style components, lucide-react icons.
- State: Zustand for client state such as cart/auth.
- API access: Axios services in `code/frontend/src/services`.
- i18n: Vietnamese and English locale files.

### 4.2 Backend

- Framework: Spring Boot 4.1, Java 21.
- Architecture: Modular layered architecture.
- API style: REST under `/api/v1`.
- Persistence: Spring Data JPA with PostgreSQL.
- Migration: Flyway.
- Security: JWT authentication, RBAC permissions, `@PreAuthorize`.
- Object storage: MinIO for product images.

### 4.3 External Services

- PostgreSQL database.
- MinIO object storage.
- Sandbox payment integrations for MoMo and VNPAY-style flows.

## 5. Actors

### 5.1 Guest Customer

An unauthenticated website visitor who can browse products, view stores, add items to cart, place public orders, and track orders.

### 5.2 Registered Customer

An authenticated customer who can manage profile information, view personal order history, and place orders with stored identity context.

### 5.3 Staff

A store staff user who can operate POS/order workflows according to assigned permissions.

### 5.4 Manager

A store-scoped user who can view and manage operations only for their assigned store, including orders, staff, shifts, inventory, goods receipts, and reports.

### 5.5 Admin

A global operator who can manage all stores and system master data, including users, roles, products, ingredients, stores, reports, and operational modules.

## 6. Roles and Authorization

The backend must authorize protected operations using JWT and RBAC permission codes.

General permission naming:

- `MODULE_VIEW`
- `MODULE_CREATE`
- `MODULE_UPDATE`
- `MODULE_DELETE`
- Special workflow permissions such as `ORDER_CANCEL`, `ORDER_COMPLETE`, `PAYMENT_REFUND`, `INVENTORY_ADJUST`, `GOODS_RECEIPT_COMPLETE`, `SHIFT_MANAGE`.

Route scope rules:

- `/api/v1/admin/**` requires authenticated dashboard roles and endpoint-level permissions.
- `/api/v1/manager/**` must be scoped to the current manager store where applicable.
- `/api/v1/staff/**` supports staff-facing operations.
- Public catalog, public order creation, and order tracking may be accessible without dashboard permissions where explicitly implemented.

## 7. Functional Requirements

### FR-01 Authentication and Profile

The system shall provide authentication and account profile management.

Implemented API coverage:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh-token`
- `GET /api/v1/auth/profile`
- `PUT /api/v1/auth/profile`

Requirements:

- Users shall log in with credentials and receive JWT tokens.
- Users shall refresh access tokens using the refresh token flow.
- Authenticated users shall view and update profile data.
- Frontend shall provide customer login/register and dashboard portal login pages.

Frontend routes:

- `/(customer)/login`
- `/(customer)/register`
- `/(customer)/profile`
- `/(dashboard)/portal/login`

### FR-02 Product Catalog and Public Menu

The system shall expose an active product catalog to customers and staff.

Implemented API coverage:

- `GET /api/v1/menu`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/categories`
- `GET /api/v1/products/{productId}/reviews`
- `GET /api/v1/products/{productId}/reviews/eligibility`
- `POST /api/v1/products/{productId}/reviews`
- `GET /api/v1/staff/products/availability`

Requirements:

- Customers shall browse products by category.
- Customers shall view product detail, variants, toppings, price, description, and image.
- Product availability shall be calculated by backend, not by frontend.
- Product reviews shall be supported where eligibility allows.
- Public pages shall not expose admin-only product maintenance actions.

Frontend routes:

- `/(customer)/menu`
- `/(customer)/menu/[id]`

### FR-03 Admin Product Management

The system shall allow authorized admin users to manage products, categories, and toppings.

Implemented API coverage:

- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`
- `GET /api/v1/admin/categories`
- `POST /api/v1/admin/categories`
- `PUT /api/v1/admin/categories/{id}`
- `DELETE /api/v1/admin/categories/{id}`
- `GET /api/v1/admin/toppings`
- `POST /api/v1/admin/toppings`
- `PUT /api/v1/admin/toppings/{id}`
- `DELETE /api/v1/admin/toppings/{id}`

Requirements:

- Admin shall create, update, list, and delete or deactivate products.
- Product records shall support category, variants, toppings, image URL, and status.
- Product image upload shall be handled by the storage module before saving product JSON.
- Product API shall continue to receive `imageUrl` in JSON rather than multipart product requests.

Frontend routes:

- `/(dashboard)/admin/products`
- `/(dashboard)/admin/categories`
- `/(dashboard)/admin/toppings`

### FR-04 Product Image Storage

The system shall support product image upload through MinIO.

Implemented API coverage:

- `POST /api/v1/storage/products/images`

Requirements:

- Only Admin or users with `PRODUCT_CREATE` or `PRODUCT_UPDATE` shall upload product images.
- Upload request shall use `multipart/form-data` with field `file`.
- Backend shall validate empty file, max file size, and allowed content types.
- Backend shall generate object keys using UUID and shall not trust original filenames.
- Backend shall return `objectKey`, public `url`, `contentType`, and `size`.
- MinIO credentials must not be exposed to frontend.

### FR-05 Cart and Checkout

The frontend shall provide a customer cart and checkout flow.

Requirements:

- Customers shall add product variants and toppings to cart.
- Customers shall adjust quantities and remove cart items.
- Checkout shall collect receiver name, phone, delivery address, note, and payment method.
- Checkout shall submit order creation to backend.
- Cart pricing displayed on frontend is for user experience; backend remains source of truth for order totals.

Frontend routes:

- `/(customer)/cart`
- `/(customer)/checkout`

### FR-06 Order Management

The system shall support public order creation and operational order management.

Implemented API coverage:

- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/my`
- `GET /api/v1/orders/track`
- `GET /api/v1/orders/{id}`
- `GET /api/v1/orders/code/{orderCode}`
- `POST /api/v1/orders/{id}/confirm`
- `POST /api/v1/orders/{id}/prepare`
- `POST /api/v1/orders/{id}/ready`
- `POST /api/v1/orders/{id}/cancel`
- `POST /api/v1/orders/{id}/complete`
- `GET /api/v1/manager/orders`
- `GET /api/v1/manager/orders/{id}`
- `POST /api/v1/manager/orders/{id}/confirm`
- `POST /api/v1/manager/orders/{id}/cancel`

Requirements:

- Order status flow shall follow:

```text
PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED
                     \-> CANCELLED
```

- Order items shall store product, variant, topping, quantity, and price snapshots.
- Completing an order shall trigger inventory OUT movements based on product recipes.
- Completing an order must not mark payment as paid.
- Payment state must be handled separately.
- Manager order visibility shall be scoped to the manager assigned store.

Frontend routes:

- `/(customer)/track-order`
- `/(dashboard)/admin/orders`
- `/(dashboard)/manager/orders`
- `/(dashboard)/staff/orders`
- `/(dashboard)/staff/history`
- `/(dashboard)/staff/pos`

### FR-07 Payment

The system shall manage order payments and sandbox gateway flows.

Implemented API coverage:

- `POST /api/v1/payments/orders/{orderId}/pay`
- `GET /api/v1/payments/{id}`
- `GET /api/v1/payments/orders/{orderId}`
- `POST /api/v1/payments/{id}/refund`
- `POST /api/v1/payments/{id}/fail`
- `POST /api/v1/payment/momo/create`
- `POST /api/v1/payment/vnpay/create`
- `GET /api/v1/payment/momo/return`
- `POST /api/v1/payment/momo/ipn`
- `GET /api/v1/payment/vnpay/return`
- `GET|POST /api/v1/payment/vnpay/ipn`

Requirements:

- One order has one main payment in the current version.
- Payment status flow shall support:

```text
UNPAID -> PAID
UNPAID -> FAILED
PAID   -> REFUNDED
```

- Backend shall calculate payment amount from order total.
- Frontend shall not be trusted to decide payment amount, store ID, or payment ownership.
- Payment result page shall display gateway outcome to customer.

Frontend routes:

- `/(customer)/payment/result`

### FR-08 Promotion Management

The system shall support promotion configuration and application.

Implemented API coverage:

- `GET /api/v1/promotions`
- `GET /api/v1/promotions/{id}`
- `POST /api/v1/promotions`
- `PUT /api/v1/promotions/{id}`
- `DELETE /api/v1/promotions/{id}`
- `POST /api/v1/promotions/{id}/activate`

Requirements:

- Admin shall manage promotion code, name, discount type, discount value, date range, usage limit, status, and applicable scope.
- Promotion may apply to products or categories according to promotion configuration.
- Checkout/cart UI may display promotion-related data, but backend must be source of truth for persisted order totals.

Frontend route:

- `/(dashboard)/admin/promotions`

### FR-09 Store and Branch Management

The system shall manage coffee store branches and staff-store assignments.

Implemented API coverage:

- `GET /api/v1/stores`
- `GET /api/v1/stores/{id}`
- `POST /api/v1/stores`
- `PUT /api/v1/stores/{id}`
- `DELETE /api/v1/stores/{id}`
- `GET /api/v1/store-users`
- `GET /api/v1/stores/{storeId}/users`
- `POST /api/v1/store-users`
- `PUT /api/v1/store-users/{id}`
- `PATCH /api/v1/store-users/{id}/deactivate`

Requirements:

- Admin shall manage store name, address, phone, and status.
- Admin shall assign users to stores.
- Manager-scoped modules shall resolve the manager store from assignment data.

Frontend route:

- `/(dashboard)/admin/branches`

### FR-10 User, Role, and Permission Management

The system shall support RBAC administration.

Implemented API coverage:

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`
- `GET /api/v1/roles`
- `GET /api/v1/roles/{id}`
- `POST /api/v1/roles`
- `PUT /api/v1/roles/{id}`
- `DELETE /api/v1/roles/{id}`
- `GET /api/v1/permissions`
- `GET /api/v1/permissions/{id}`
- `POST /api/v1/permissions`
- `PUT /api/v1/permissions/{id}`
- `DELETE /api/v1/permissions/{id}`

Requirements:

- Admin shall manage users and roles.
- Roles shall have permissions.
- Endpoint permissions shall use `@PreAuthorize` where required.
- Customer records and employee records shall be represented separately where implemented.

Frontend routes:

- `/(dashboard)/admin/customers`
- `/(dashboard)/admin/employees`

### FR-11 Manager Staff Management

The system shall allow managers to view staff for their store scope.

Implemented API coverage:

- `GET /api/v1/manager/staff`
- `GET /api/v1/manager/staff/{id}`

Requirements:

- Manager staff list shall be limited to the manager assigned store.
- Manager shall not view or manage staff from other stores.

Frontend route:

- `/(dashboard)/manager/staff`

### FR-12 Shift Management

The system shall support staff shift scheduling and management.

Implemented API coverage:

- `GET /api/v1/shifts`
- `POST /api/v1/shifts`
- `DELETE /api/v1/shifts/{id}`
- `GET /api/v1/manager/shifts`
- `POST /api/v1/manager/shifts`
- `PUT /api/v1/manager/shifts/{id}`
- `DELETE /api/v1/manager/shifts/{id}`

Requirements:

- Authorized users shall view shifts.
- Users with shift management permission shall create, update, or delete shifts.
- Manager shift operations shall be scoped to the manager assigned store.

Frontend route:

- `/(dashboard)/manager/shifts`

### FR-13 Supplier Management

The system shall manage suppliers for inventory procurement.

Implemented API coverage:

- `GET /api/v1/suppliers`
- `GET /api/v1/suppliers/{id}`
- `POST /api/v1/suppliers`
- `PUT /api/v1/suppliers/{id}`
- `DELETE /api/v1/suppliers/{id}`

Requirements:

- Admin shall manage supplier name, contact data, address, and status.
- Suppliers shall be selectable when creating goods receipts.

Frontend route:

- `/(dashboard)/admin/suppliers`

### FR-14 Ingredient and Ingredient Category Management

The system shall manage ingredient master data.

Implemented API coverage:

- `GET /api/v1/ingredients`
- `GET /api/v1/ingredients/{id}`
- `POST /api/v1/ingredients`
- `PUT /api/v1/ingredients/{id}`
- `DELETE /api/v1/ingredients/{id}`
- `GET /api/v1/ingredient-categories`
- `GET /api/v1/ingredient-categories/{id}`
- `POST /api/v1/ingredient-categories`
- `PUT /api/v1/ingredient-categories/{id}`
- `DELETE /api/v1/ingredient-categories/{id}`

Requirements:

- Admin shall manage ingredient code, name, unit, minimum stock, category, description, and status.
- Ingredient units must be consistent with recipe usage and inventory movement quantities.

Frontend route:

- `/(dashboard)/admin/ingredients`

### FR-15 Recipe Management

The system shall manage product recipes that connect product variants to ingredient quantities.

Implemented API coverage:

- `GET /api/v1/recipes`
- `GET /api/v1/recipes/{id}`
- `POST /api/v1/recipes`
- `PUT /api/v1/recipes/{id}`
- `DELETE /api/v1/recipes/{id}`

Requirements:

- Admin shall define recipes per product variant.
- A valid product variant availability check requires one active, non-empty recipe.
- Recipe ingredient unit must match ingredient unit.
- Completing an order shall use recipe quantities multiplied by order item quantity to create inventory OUT movements.

Frontend route:

- `/(dashboard)/admin/recipes`

### FR-16 Inventory Ledger and Stock Balance

The system shall use stock movements as inventory source of truth.

Implemented API coverage:

- `GET /api/v1/inventory/stock-movements`
- `POST /api/v1/inventory/stock-adjustments`
- `GET /api/v1/inventory/stock-balances`
- `GET /api/v1/inventory/stores/{storeId}/ingredients/{ingredientId}/stock`
- `GET /api/v1/manager/inventory/stock-balances`
- `GET /api/v1/manager/inventory/stock-movements`
- `POST /api/v1/manager/inventory/stock-adjustments`

Requirements:

- Current stock shall be derived from stock movements:

```text
current_stock = SUM(IN) - SUM(OUT) + SUM(ADJUSTMENT)
```

- Goods receipt completion shall create IN movements.
- Manual adjustment shall create ADJUSTMENT movements.
- Order completion shall create OUT movements.
- Manager inventory operations shall be limited to assigned store.

Frontend routes:

- `/(dashboard)/admin/stock`
- `/(dashboard)/manager/inventory`
- `/(dashboard)/manager/inventory/history`

### FR-17 Goods Receipt

The system shall support purchasing/import notes and stock receipt completion.

Implemented API coverage:

- `GET /api/v1/goods-receipts`
- `GET /api/v1/goods-receipts/{id}`
- `POST /api/v1/goods-receipts`
- `PUT /api/v1/goods-receipts/{id}`
- `DELETE /api/v1/goods-receipts/{id}`
- `POST /api/v1/goods-receipts/{id}/complete`
- `GET /api/v1/manager/goods-receipts`
- `GET /api/v1/manager/goods-receipts/{id}`
- `POST /api/v1/manager/goods-receipts`
- `PUT /api/v1/manager/goods-receipts/{id}`
- `POST /api/v1/manager/goods-receipts/{id}/complete`

Requirements:

- Authorized users shall create goods receipts with supplier, store, items, quantities, unit cost, and total amount.
- Completing a goods receipt shall create inventory IN stock movements.
- Pending goods receipts shall not affect inventory until completed.
- Manager goods receipt operations shall be scoped to assigned store.

Frontend routes:

- `/(dashboard)/admin/import-notes`
- `/(dashboard)/manager/inventory/import-notes`

### FR-18 Dashboard and Reports

The system shall provide operational summaries and business reports.

Implemented API coverage:

- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/manager/dashboard/summary`
- `GET /api/v1/admin/reports/revenue`
- `GET /api/v1/admin/reports/orders`
- `GET /api/v1/admin/reports/payments`
- `GET /api/v1/admin/reports/inventory`
- `GET /api/v1/admin/reports/goods-receipts`
- `GET /api/v1/admin/reports/ingredient-consumption`
- `GET /api/v1/manager/reports/revenue`
- `GET /api/v1/manager/reports/orders`
- `GET /api/v1/manager/reports/payments`
- `GET /api/v1/manager/reports/inventory`
- `GET /api/v1/manager/reports/goods-receipts`
- `GET /api/v1/manager/reports/ingredient-consumption`
- `POST /api/v1/reports/export`

Requirements:

- Revenue shall be recognized only when:

```text
Order.status = COMPLETED
AND Payment.status = PAID
```

- Completed unpaid orders, paid cancelled orders, failed payments, unpaid payments, and refunded payments shall not count as revenue.
- Report pages shall use backend report APIs as source of truth.
- Frontend shall not calculate revenue from raw order lists.
- Manager report APIs shall be scoped to assigned store and shall not accept a frontend-provided `storeId`.
- Export logging is available; real Excel/PDF generation is outside the currently implemented scope.

Frontend routes:

- `/(dashboard)/admin/dashboard`
- `/(dashboard)/manager/dashboard`
- `/(dashboard)/admin/reports`
- `/(dashboard)/manager/reports`

### FR-19 Notification

The system shall provide user notifications.

Implemented API coverage:

- `GET /api/v1/notifications`
- `POST /api/v1/notifications/{id}/read`
- `POST /api/v1/notifications/read-all`

Requirements:

- Authenticated users shall retrieve their notifications.
- Users shall mark one notification as read.
- Users shall mark all notifications as read.

### FR-20 Public Content Pages

The frontend shall provide public brand and support pages.

Frontend routes:

- `/(customer)/`
- `/(customer)/about`
- `/(customer)/careers`
- `/(customer)/support`

Requirements:

- Public pages shall be localized.
- Public pages shall not require authentication.
- Public pages shall maintain consistent brand presentation and responsive layout.

## 8. Data Requirements

The system currently uses these primary data domains:

- Authentication and RBAC: `users`, `roles`, `permissions`, `role_permissions`.
- Store assignment: `stores`, `store_users`, `employees`.
- Product catalog: `categories`, `products`, `product_variants`, `toppings`, `product_toppings`, `combo_items`, `product_reviews`.
- Orders: `orders`, `order_items`, `order_item_toppings`.
- Payments: `payments`.
- Promotions: `promotions`, `promotion_products`, `promotion_categories`.
- Inventory: `suppliers`, `ingredient_categories`, `ingredients`, `recipes`, `recipe_ingredients`, `goods_receipts`, `goods_receipt_items`, `stock_movements`.
- Reporting: `report_export_logs`.
- Notifications: `notifications`.

Data integrity requirements:

- IDs are database-generated where applicable.
- Status fields shall be validated against module-specific allowed values.
- Monetary values shall be stored and calculated on backend using decimal types.
- Inventory stock shall be derived from movement ledger, not manually overwritten.
- Order line item data shall retain sale-time snapshots.

## 9. API Response Requirements

- Backend APIs shall return a consistent `ApiResponse<T>` wrapper where implemented.
- Validation failures shall return meaningful error messages.
- Protected APIs shall reject unauthenticated or unauthorized requests.
- Frontend service modules shall unwrap API response data and expose typed functions to UI components.

## 10. Non-Functional Requirements

### NFR-01 Security

- JWT authentication shall protect dashboard and user-specific APIs.
- RBAC shall guard business operations.
- MinIO secret keys shall not be sent to frontend.
- Manager scope shall be enforced by backend, not by frontend filters.

### NFR-02 Performance

- Public menu and dashboard pages shall load through API services and avoid frontend mock data as source of truth.
- Report V1 may use in-memory aggregation, but production-scale reporting should move aggregation into repository/database queries.
- Frontend shall use typed services to reduce duplicate request logic.

### NFR-03 Reliability

- Flyway migrations shall define and evolve database schema.
- Business workflows such as order completion and goods receipt completion shall be transactional.
- Inventory changes shall be recorded as append-only stock movements.

### NFR-04 Maintainability

- Backend modules shall follow controller/service/repository layering.
- Frontend API calls shall live under `src/services`.
- UI should use shared components where practical.
- New permissions shall follow established naming conventions.

### NFR-05 Internationalization

- Customer-facing and dashboard UI shall support Vietnamese and English locale routing.
- New visible frontend text should be added to locale files instead of hardcoded where feasible.

### NFR-06 Compatibility

- The frontend shall support modern browsers.
- The system shall be responsive for desktop, tablet, and mobile views.

## 11. Business Rules Summary

### Revenue

Revenue is counted only for completed and paid orders.

### Order Fulfillment

Order status progresses from pending to completed through explicit operational steps. Cancellation is allowed before completion according to service rules.

### Payment

Payment does not complete an order. Order completion does not mark payment as paid.

### Inventory

Inventory is a ledger. Stock balance is calculated from movements.

### Availability

Product availability must be determined by backend based on active product data, active recipe, and sufficient store stock.

### Manager Scope

Manager APIs shall use assigned store context instead of trusting frontend store filters.

## 12. Current Frontend Route Map

Customer:

- `/[locale]`
- `/[locale]/about`
- `/[locale]/careers`
- `/[locale]/cart`
- `/[locale]/checkout`
- `/[locale]/login`
- `/[locale]/menu`
- `/[locale]/menu/[id]`
- `/[locale]/payment/result`
- `/[locale]/profile`
- `/[locale]/register`
- `/[locale]/support`
- `/[locale]/track-order`

Admin:

- `/[locale]/admin/dashboard`
- `/[locale]/admin/branches`
- `/[locale]/admin/categories`
- `/[locale]/admin/customers`
- `/[locale]/admin/employees`
- `/[locale]/admin/import-notes`
- `/[locale]/admin/ingredients`
- `/[locale]/admin/orders`
- `/[locale]/admin/products`
- `/[locale]/admin/promotions`
- `/[locale]/admin/recipes`
- `/[locale]/admin/reports`
- `/[locale]/admin/stock`
- `/[locale]/admin/suppliers`
- `/[locale]/admin/toppings`

Manager:

- `/[locale]/manager/dashboard`
- `/[locale]/manager/inventory`
- `/[locale]/manager/inventory/history`
- `/[locale]/manager/inventory/import-notes`
- `/[locale]/manager/orders`
- `/[locale]/manager/reports`
- `/[locale]/manager/shifts`
- `/[locale]/manager/staff`

Staff:

- `/[locale]/staff/orders`
- `/[locale]/staff/history`
- `/[locale]/staff/pos`

Portal:

- `/[locale]/portal/login`

## 13. Out of Scope for Current Version

The following are not fully specified as completed system requirements in the current implementation:

- Real production payment gateway settlement.
- Real Excel/PDF file generation for reports.
- CDN integration for uploaded assets.
- Presigned direct-to-MinIO upload.
- Ingredient image, store logo, and avatar storage migration.
- Full customer loyalty program.
- Advanced staff performance BI.
- Advanced refund ledger and partial refund.
- Delivery partner integration.

## 14. Assumptions and Constraints

- PostgreSQL is the production database.
- H2 may be used for backend integration tests.
- MinIO is available where product image upload is used.
- Existing migrations are append-only and must not be edited retroactively.
- Existing product/order/inventory business rules are source of truth for dashboard and report modules.
- Frontend shall not use mock data as persisted operational truth.

## 15. Acceptance Criteria

The system satisfies this SRS v2 when:

- Customer can browse menu, view product details, manage cart, checkout, and track orders.
- Authenticated users can view/update profile.
- Admin can manage catalog, users, stores, suppliers, ingredients, recipes, inventory, goods receipts, orders, payments, promotions, dashboards, and reports within permissions.
- Manager can operate only within assigned store for orders, staff, shifts, inventory, goods receipts, dashboard, and reports.
- Staff can use POS/order workflows according to role permissions.
- Product images can be uploaded to MinIO and saved as product `imageUrl`.
- Revenue and report APIs follow backend business rules.
- Inventory balance is derived from stock movement ledger.
- Frontend type-check and backend compile/test pass for implemented modules.
