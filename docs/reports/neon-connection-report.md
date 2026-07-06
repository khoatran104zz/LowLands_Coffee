# Neon Connection Report

## Summary

Backend is now configured to use environment variables for PostgreSQL/Neon runtime connection settings. No Neon connection string, password, or JWT secret is committed to source control.

## Files Changed

- `.gitignore`
- `.env.example`
- `README.md`
- `code/backend/src/main/resources/application.properties`
- `scripts/run-backend-neon.ps1`
- `docs/neon-connection-report.md`

## Environment Variables Used

Backend runtime:

| Variable | Purpose |
|---|---|
| `DB_URL` | JDBC PostgreSQL URL. For Neon, use `jdbc:postgresql://<host>/<database>?sslmode=require`. |
| `DB_USERNAME` | Neon database username. |
| `DB_PASSWORD` | Neon database password. |
| `JWT_SECRET` | JWT signing secret. |

Frontend:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Browser-facing Spring Boot API base URL, currently `http://localhost:8080/api/v1`. |

## Datasource Configuration

`application.properties` now reads runtime values from environment variables:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
```

Flyway continues to use the same Spring datasource. `spring.jpa.hibernate.ddl-auto=validate` is unchanged.

## Flyway Status

Local build verification:

- Command: `mvn clean install`
- Result: Passed
- Flyway test profile applied 17 migrations successfully against H2 test database.

Neon verification:

- Status: Not executed in this workspace because no real `.env` with Neon credentials was present.
- Expected behavior: when `scripts/run-backend-neon.ps1` is run with a valid `.env`, Spring Boot will connect to Neon and Flyway will apply only missing migrations based on `flyway_schema_history`.

## Seed Status

Local test profile confirmed migrations and bootstrap can run. Expected Neon seed data after first successful run:

- Roles: `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER`
- Permissions from migration seed files, standardized by V17
- Product/category/topping seed data from V15 and V16
- Bootstrap demo users and inventory from `DataBootstrap`

Neon seed verification is pending until a local `.env` with Neon credentials is provided.

## API Test Result

Not executed against Neon because no real Neon `.env` was available in the workspace.

Endpoints to verify after creating `.env`:

- `GET http://localhost:8080/swagger-ui/index.html`
- `GET http://localhost:8080/api/v1/menu`
- `GET http://localhost:8080/api/v1/products`
- `POST http://localhost:8080/api/v1/auth/login`

Recommended seeded login payload:

```json
{
  "email": "admin@lowlands.coffee",
  "password": "Admin@123"
}
```

## Security Notes

- No real `.env` file was created or committed.
- `.env` and `.env.*` remain ignored.
- `.env.example` is explicitly allowed for tracking.
- No real connection string, username, password, or JWT secret is printed in this report.
- Frontend continues to call Spring Boot via `NEXT_PUBLIC_API_URL`; it does not connect directly to Neon.

## How To Run Neon Locally

1. Create local `.env` from `.env.example`.
2. Fill Neon values without committing the file.
3. Run:

```powershell
.\scripts\run-backend-neon.ps1
```

4. In another terminal, run frontend:

```powershell
cd code/frontend
npm run dev
```

## Remaining Issues

- Live Neon migration/API verification is pending until the developer provides a local `.env`.
- Existing backend build warnings remain:
  - MapStruct unmapped target warnings in role/permission mappers.
  - Mockito dynamic Java agent warning during tests.
