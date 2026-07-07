# Business Freeze Report

## Scope

This Business Freeze Sprint audited documents, reports, backend code, database migrations, and frontend integration points to freeze business rules before Dashboard and Reporting work.

No new feature, UI redesign, Dashboard, Report, Customer, Notification, or BI implementation was performed.

Important source documents requested but not present at repo root:

- `docs/api-contract.md`
- `docs/database-note.md`

Available related sources were used instead:

- `docs/reports/api-contract-rebuild-report.md`
- current source code
- Flyway migrations
- existing module/report docs

## Business Rules Frozen

The source-of-truth rules are now documented in `docs/system-business-rules.md`.

Frozen rules:

- Revenue requires `Payment.status = PAID` and `Order.status = COMPLETED`.
- Order KPI counts only `Order.status = COMPLETED`.
- Payment and Order are separate workflows.
- Payment does not complete order.
- Complete order does not mark payment paid.
- Current inventory is derived from `stock_movements`.
- Ingredient consumption comes from `StockMovement OUT` with `referenceType = ORDER`.
- Product availability is backend-owned.
- Order completion deducts inventory only at `COMPLETED`.
- Refund does not reverse inventory in the current version.
- Manager scope is derived from backend authenticated store assignment.
- Admin can access all stores or filter by store.

## Data Source Rules

| Domain | Frozen Source of Truth |
| --- | --- |
| Revenue | `orders` + `payments`, paid and completed only |
| Order KPI | `orders.status = COMPLETED` |
| Payment | `payments` table, one main payment per order |
| Inventory balance | `stock_movements` ledger |
| Consumption | `stock_movements` where `movement_type = OUT` and `reference_type = ORDER` |
| Availability | backend availability service using catalog, recipe, ingredient, and stock ledger |
| Goods receipt impact | `goods_receipts` complete creates `stock_movements IN` |
| Adjustment impact | `stock_movements ADJUSTMENT` |
| Store scope | `store_users` active assignment checked by backend |

## Document to Code Audit

### Consistent

- Payment V1 separates payment from order completion.
- Order create creates payment as `UNPAID`.
- Pay API marks payment `PAID` and uses backend order total.
- Complete order creates `StockMovement OUT`.
- Complete order is idempotent for existing completed orders with existing OUT movement.
- Inventory is calculated from stock movement ledger.
- POS loads backend availability and reloads after checkout/complete.
- Manager inventory/goods receipt/order wrappers derive store from backend context.
- Master data now has 100% active variant recipe and availability coverage for seeded store 1.

### Not Yet Consistent

- Existing Dashboard service revenue still sums completed orders only. It does not yet require paid payments.
- Some older docs still describe Order/Payment/Promotion as not implemented; code and newer reports supersede them.
- Availability service assumes one active recipe by repository lookup and master-data tests; the exact-one rule is not enforced as a database unique active constraint.
- Admin/global inventory and goods receipt APIs still accept `storeId` in request payload. This is acceptable for Admin workflows, but must not be reused for Manager permission decisions.
- Promotion code is present in the current codebase, but Promotion is outside this Business Freeze scope and is not frozen as a reporting rule.
- Frontend still contains hardcoded/mojibake UI text in some POS/admin files; this is not a business rule blocker, but violates the i18n convention.

## Dashboard Contract

Dashboard implementation must follow `docs/system-business-rules.md`.

### Admin Dashboard Widgets

| Widget | Formula |
| --- | --- |
| Revenue Today/Week/Month/Year | sum completed orders with paid payment only |
| Orders | count order rows by selected period/status |
| Completed Orders | count `COMPLETED` |
| Cancelled Orders | count `CANCELLED` |
| Payment Breakdown | paid completed orders grouped by method |
| Top Products | order item quantity/revenue from paid completed orders |
| Top Categories | top product result grouped by category |
| Low Stock | ledger current stock <= min stock |
| Store Ranking | paid completed revenue grouped by store |

### Manager Dashboard Widgets

| Widget | Formula |
| --- | --- |
| Store Revenue | paid completed revenue for manager active store |
| Store Orders | order status counts for manager active store; KPI completed only |
| Store Inventory | ledger current stock for manager active store |
| Low Stock | ledger current stock <= min stock |
| Goods Receipt Today | receipt count/sum for manager active store |
| Ingredient Consumption | OUT/ORDER movement sum for manager active store |
| Top Products | paid completed order item quantity/revenue for manager active store |

## Report Contract

Reports must be backend-calculated, permission-scoped, and store-scoped.

| Report | Frozen Formula |
| --- | --- |
| Revenue Report | paid completed order revenue |
| Inventory Report | stock ledger balance |
| Payment Report | payment status/method aggregated with order/store scope |
| Order Report | order counts/statuses; KPI completed only |
| Goods Receipt Report | receipt/item data by status and time range |
| Ingredient Consumption Report | OUT/ORDER stock movement sum |
| Staff Performance Report | future only until staff attribution rule is frozen |

## Technical Debt

| Item | Impact | Priority | Future Sprint |
| --- | --- | --- | --- |
| Dashboard revenue uses completed orders only | Can overstate revenue when completed but unpaid | High | Dashboard Sprint before release |
| Combo recipe strategy is duplicated at combo level | Consumption may differ from component-level business reality | Medium | Combo Inventory Sprint |
| Refund does not reverse inventory | Correct for current V1, but future refund reports need clear treatment | Medium | Refund Sprint |
| Payment lacks audit/gateway fields | Payment report cannot show gateway references or refund timestamps | Medium | Payment Audit/Gateway Sprint |
| No inventory reservation | POS may create orders that later fail at completion if stock changes | Medium | Inventory Reservation Sprint |
| Promotion work exists but rule is not frozen | Discounts/revenue reporting can be inconsistent if promoted before contract | High | Promotion Rule Sprint |
| Customer address/customer ownership not fully frozen | Customer report and self-service flows remain incomplete | Medium | Customer Sprint |
| Notification not defined | Operational alerts should not be used as source of truth | Low | Notification Sprint |
| Frontend hardcoded/mojibake text | UI polish/i18n quality risk | Low | UI/i18n Cleanup Sprint |
| Root docs `api-contract.md` and `database-note.md` missing | Onboarding/audit source confusion | Medium | Documentation Cleanup Sprint |
| Active recipe uniqueness not enforced by DB | Duplicate active recipes could make availability/order completion ambiguous | High | Recipe Integrity Sprint |

## Remaining Risks

- Reporting must not use current dashboard revenue query until it is changed to require paid payment.
- Promotion is visible in the current codebase but is explicitly not frozen here.
- If frontend sends stale POS availability, backend completion still protects stock with HTTP 409; manual POS UX verification remains useful.
- Admin APIs can see all stores; frontend must not expose global admin endpoints to manager routes.
- Current production runtime still needs valid DB/JWT environment variables for `spring-boot:run`.

## Regression Result

Regression checks:

- `mvn -q -Dtest=OrderInventoryFlowIntegrationTest test`: passed.
- `mvn -q clean install`: passed on the current codebase with 33 migrations.
- `npm.cmd run type-check`: passed on the current frontend codebase.
- Frontend dev smoke: passed on `localhost:3001` because `localhost:3000` was already occupied.
- Backend runtime smoke reached Tomcat, then stopped due missing runtime environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`.

Business Freeze audit result:

- Admin: no business-rule code changes in this sprint.
- Manager: store-scope remains documented and existing wrappers are aligned.
- POS: availability and payment/order flow remain aligned with source-of-truth rules.
- Inventory: ledger rule is aligned.
- Recipe: business rule is aligned, but DB uniqueness hardening remains future work.
- Payment: workflow is aligned.
- Order: completion/inventory flow is aligned.
- Storage: no change required; outside business rule freeze.

## Project Readiness

The project is conditionally ready to start Dashboard and Report design, but not ready to release Dashboard/Report until the revenue query contract is implemented and tested.

Ready:

- Order/payment/inventory source rules are frozen.
- Availability source of truth is frozen.
- Dashboard and Report contracts are documented.
- Store scope principle is documented.

Not ready:

- Existing Dashboard revenue implementation does not yet follow the frozen Revenue Rule.
- Report endpoints are not implemented.
- Promotion reporting must remain excluded until Promotion rules are frozen.
- Staff Performance Report cannot be built until staff attribution is defined.

## Recommended Next Sprint

Dashboard/Report Foundation Sprint:

1. Replace dashboard revenue formulas with paid-completed revenue queries.
2. Add repository/service tests for completed-unpaid, paid-cancelled, paid-completed, and refunded edge cases.
3. Implement read-only dashboard widget APIs from the frozen contract.
4. Implement report read contracts after dashboard formulas pass regression.
5. Keep Promotion, Customer, Notification, and Payment Gateway out of Dashboard until their rules are separately frozen.
