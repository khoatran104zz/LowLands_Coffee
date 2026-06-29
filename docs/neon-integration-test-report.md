# Neon Integration Test Report

## Environment

| Item | Result |
|---|---|
| `.env` exists | Pass |
| `.env` ignored by Git | Pass |
| `.env.example` exists and is trackable | Pass |
| `DB_URL` present | Pass |
| `DB_USERNAME` present | Pass |
| `DB_PASSWORD` present | Pass |
| `JWT_SECRET` present | Pass |
| Backend reads environment variables through `scripts/run-backend-neon.ps1` | Pass |
| Backend still points to local PostgreSQL | No |
| PostgreSQL driver | `org.postgresql.Driver` |
| Hibernate DDL mode | `validate` |

Database:

- Database name parsed from `DB_URL`: `Lowlands_coffee`
- Database provider: Neon PostgreSQL
- PostgreSQL version reported by runtime connection: `18.4`
- JDBC URL and credentials are intentionally not printed.
- `DB_URL` uses JDBC PostgreSQL format, does not point to localhost, and contains `sslmode=require`.

## Flyway

| Check | Result |
|---|---|
| HikariCP connection to Neon | Pass |
| Flyway connection to Neon | Pass |
| Migrations validated | 17 |
| Current schema version | `17` |
| Pending migration | None detected |
| Failed migration | None detected |

Runtime log evidence:

```text
HikariPool-1 - Added connection
Successfully validated 17 migrations
Current version of schema "public": 17
Schema "public" is up to date. No migration necessary.
```

No migration was added, edited, dropped, repaired, or forced during this test.

## Seed

Seed counts were not queried directly because the final API/database verification steps were skipped by request.

Expected seed sources remain:

| Data | Expected Source |
|---|---|
| Roles | `V1__create_roles.sql` |
| Permissions | `V2`, `V7`, `V10`, `V14`, `V17` |
| Users | `DataBootstrap` |
| Stores | `V5`, `DataBootstrap` |
| Categories | `V15`, `V16` |
| Products | `V15`, `V16` |
| Variants | `V15`, `V16` |
| Toppings | `V15`, `V16` |

## Backend Startup

| Check | Result |
|---|---|
| `mvn clean install` | Pass |
| `mvn spring-boot:run` directly | Not valid for `.env`; Spring Boot does not auto-load `.env` |
| `scripts/run-backend-neon.ps1` on port `8080` | Neon/Flyway pass, final startup blocked by port in use |
| `scripts/run-backend-neon.ps1` on temporary port `18080` | Started and listened successfully |

Port note:

- Port `8080` was already in use by another Java process during this test.
- The backend was started on temporary port `18080` to confirm the Neon-backed application can run.
- The temporary test process on port `18080` was stopped after verification.

## API Test

The final API test phase was skipped by request.

| API | Result |
|---|---|
| `GET /api-docs` | Skipped |
| `GET /swagger-ui/index.html` | Skipped |
| `GET /api/v1/menu` | Skipped |
| `GET /api/v1/products` | Skipped |
| `GET /api/v1/categories` | Skipped |
| `POST /api/v1/auth/login` | Skipped |
| `POST /api/v1/auth/register` | Skipped |
| `GET /api/v1/admin/products` | Skipped |
| `GET /api/v1/admin/categories` | Skipped |

JWT was not re-tested in this pass because the final API flow was skipped.

## Frontend Test

The final frontend integration test phase was skipped by request.

| Flow | Result |
|---|---|
| Frontend connects to backend | Skipped |
| Menu reads database products | Skipped |
| Product detail reads real API | Skipped |
| Login | Skipped |
| Register saves user to Neon | Skipped |

Frontend configuration note:

- `code/frontend/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`.
- Frontend does not connect directly to Neon.

## Commands Run

```powershell
mvn clean install
```

Result: passed.

```powershell
.\scripts\run-backend-neon.ps1
```

Result: Neon datasource and Flyway passed; application startup on `8080` was blocked because the port was already in use.

```powershell
$env:SERVER_PORT='18080'
.\scripts\run-backend-neon.ps1
```

Result: backend started and listened on temporary port `18080`; process was stopped after verification.

## Remaining Issues

1. Port `8080` is currently occupied by another Java process.
   - Stop that process or configure `SERVER_PORT` before running the backend.
2. Final API and frontend integration tests were skipped by request.
3. Existing non-blocking build warnings remain:
   - MapStruct unmapped target warnings in role/permission mappers.
   - Mockito dynamic agent warning during tests.
   - Hibernate warns that explicit `PostgreSQLDialect` is no longer required.

## Conclusion

Neon PostgreSQL connection is working. HikariCP connects successfully, Flyway validates all 17 migrations, schema `public` is at version `17`, and there are no pending migrations detected. The remaining blocker for normal local startup is that port `8080` is already in use.
