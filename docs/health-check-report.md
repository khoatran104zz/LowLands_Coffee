# Health Check Report

## Database
- Status: PASS for Sprint 1 scope.
- Database name: `lowlands_coffee`.
- Connection source: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` environment variables with local defaults in `code/backend/src/main/resources/application.properties`.
- Migration status: PASS. Flyway validated and applied 7 migrations. Runtime log shows schema `public` is up to date at version `7`.
- Tables created: `roles`, `permissions`, `role_permissions`, `users`, `stores`, `staff_stores`.
- Issues:
  - Full ERD contains more modules than Sprint 1 (`customer_addresses`, products, cart, orders, payment, promotions, inventory). These are not migrated yet.
  - `coffee-shop-management.dbml` uses `staff_stores`; `Database-Notes.md` describes `store_users`. Existing code and migration use `staff_stores`, so no rename was performed.
  - Original permissions used `*_READ`/`*_MANAGE`; Sprint 1 requirement asked for `*_VIEW`, `*_CREATE`, `*_UPDATE`.
- Fixes:
  - Added `V7__seed_sprint1_permissions.sql` to seed Sprint 1 permissions idempotently without dropping data.
  - Kept `spring.jpa.hibernate.ddl-auto=validate`.
  - Kept admin seed in Java bootstrap with `PasswordEncoder`; no plain text password was inserted by SQL.

## Backend
- Build: PASS with `mvn clean install`.
- Run: PASS with `mvn spring-boot:run`.
- Port: `8080`.
- Swagger: PASS at `http://localhost:8080/swagger-ui/index.html`; `http://localhost:8080/api-docs` also returns 200.
- APIs tested:
  - `POST /api/v1/auth/login`: PASS with `admin@lowlands.coffee` / `Admin@123`.
  - `GET /api/v1/users`: PASS with admin bearer token.
  - `GET /api/v1/stores`: PASS with admin bearer token.
  - `GET /api/v1/roles`: PASS with admin bearer token.
  - `GET /api/v1/permissions`: PASS with admin bearer token.
  - CORS preflight from `http://localhost:3000`: PASS.
- Issues:
  - JWT generation failed with default non-Base64 secret before the fix.
  - `springdoc.swagger-ui.path` is configured as `/swagger-ui.html`, but `/swagger-ui/index.html` works through Springdoc resources.
  - Hibernate logs warn that explicit PostgreSQL dialect is no longer needed.
- Fixes:
  - Added CORS configuration for `http://localhost:3000`.
  - Made admin bootstrap idempotent by admin email, not by total user count.
  - Fixed JWT signing key fallback so plain text secrets work safely as UTF-8 bytes.
  - Made datasource username/password environment-variable driven.

## Frontend
- Install: PASS with `npm.cmd install`.
- Run: PASS during root `npm run dev`; log shows `GET /vi 200`.
- Build: PASS with `npm.cmd run build` outside sandbox. Sandbox blocks `.next/trace` with EPERM.
- Port: `3000`.
- API base URL: `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`.
- Issues:
  - Backend Sprint 1 does not have Product, Category, Order, or Promotion APIs yet.
  - Frontend lint still has pre-existing strict ESLint errors; this health check did not perform a large lint refactor.
  - Frontend install reports 19 moderate npm audit findings.
- Fixes:
  - Added `code/frontend/.env.local`.
  - Changed Axios to use `process.env.NEXT_PUBLIC_API_URL`.
  - Kept Product/Category and Order service calls as controlled mock placeholders for Sprint 1.
  - Store service tries backend and falls back to mock data for public customer pages.
  - Added `turbopack.root` to avoid Next choosing the root lockfile as the frontend workspace root.

## Full Project Run
- Command:
  ```bash
  npm install
  npm run dev
  ```
- Status: PASS with notes.
- Notes:
  - Root `package.json` runs backend and frontend via `concurrently`.
  - During verification, backend served `/api-docs` and Swagger with HTTP 200, and frontend served `/vi` with HTTP 200.
  - The automated probe command was interrupted earlier, so processes were checked and stopped manually afterward.
