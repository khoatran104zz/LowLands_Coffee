# Employee Design Gap Report

## 1. Current Employee Table Status

- `docs/DB-erd/coffee-shop-management.dbml` does not define an `employees` table.
- `docs/DB-erd/database-note.md` does not describe an Employee domain/table.
- Existing Flyway migrations through `V19__enforce_positive_product_variant_price.sql` do not create an `employees` table.
- Backend has no `code/backend/src/main/java/com/lowlands/coffee/modules/employee` package.

Conclusion: a new Flyway migration is required. Existing migrations should not be edited.

## 2. Current Employee Code Status

- `users` table does not have an `employee_code` column in `V4__create_users.sql`.
- `UserEntity`, `UserCreateRequest`, and `UserUpdateRequest` do not contain `employeeCode`.
- `UserResponse` does not currently return `employeeCode`.
- Frontend Admin Employees page displays the `Employee.id` column as `Ma NV`.
- `dashboardStore.hydrateUsers()` maps STAFF/MANAGER users into employee rows using the backend user id and synthetic branch fields.

Conclusion: there is no backend employee code source of truth yet. The new source of truth should be `employees.employee_code`.

## 3. Store User Assignment Status

- `store_users` exists, created first as `staff_stores` in `V6__create_staff_stores.sql` and renamed in `V8__rename_staff_stores_to_store_users.sql`.
- The table still uses column `staff_id`, which references `users(id)`.
- `StoreUserEntity` maps `staff_id` to `UserEntity user`.
- There is no StoreUser controller/service API for Admin employee assignment.

Conclusion: keep the current `store_users.staff_id -> users.id` design for now to avoid broad rewrites. Future StoreUser assignment should validate that the user has an active employee profile.

## 4. Migration Need

Create a new migration after V19:

- `employees.id`
- `employees.user_id` unique FK to `users(id)`
- `employees.employee_code` unique
- `employees.status`
- `employees.created_at`
- `employees.updated_at`

Optional seed/backfill should create employee profiles for existing MANAGER/STAFF users.

Implementation note: `V20__create_employees.sql` creates the table, and `V21__ensure_employees_table.sql` is an idempotent safeguard/backfill migration for environments where V20 metadata exists but the table is missing.

## 5. Files That Need Changes

Backend:

- Add `code/backend/src/main/resources/db/migration/V20__create_employees.sql`
- Add `code/backend/src/main/resources/db/migration/V21__ensure_employees_table.sql`
- Add `code/backend/src/main/java/com/lowlands/coffee/modules/employee/**`
- Update `UserResponse` to expose `employeeCode`
- Update `UserMapper`/`UserServiceImpl` to create and return employee profiles for STAFF/MANAGER users

Frontend:

- Update `code/frontend/src/types/index.ts` to include `employeeCode`
- Update `code/frontend/src/store/dashboardStore.ts` employee mapping to use backend `employeeCode`
- Update `code/frontend/src/app/[locale]/(dashboard)/admin/employees/page.tsx` to show backend employee code and avoid frontend code generation/hardcoded branch id

Docs:

- Update `docs/DB-erd/database-note.md`
- Update `docs/system-business-domain-analysis.md`
- Update `docs/system-permission-matrix.md`
- Update `docs/admin-implementation-report.md` if needed
- Add `docs/employee-implementation-report.md`
