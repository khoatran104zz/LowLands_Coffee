# Development Script Standardization Report

## Scope

Standardized development scripts after moving the backend runtime database from local PostgreSQL to Neon PostgreSQL.

No business logic, API behavior, frontend UI, migration, or architecture changes were made.

## Root Scripts Before

Previous root `package.json` scripts:

```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
  "dev:backend": "cd code/backend && mvn spring-boot:run",
  "dev:frontend": "cd code/frontend && npm run dev"
}
```

Findings:

- `npm run dev:backend` started Spring Boot directly.
- Direct Spring Boot startup does not load `.env` automatically.
- This could cause backend startup to miss `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`.
- No root `backend`, `frontend`, or `start` script existed.
- No root script hardcoded `localhost:5432`, but the backend command was not Neon-safe because it bypassed the `.env` loader.

## Root Scripts After

Current root `package.json` scripts:

```json
{
  "backend": "node scripts/run-backend-neon.js",
  "frontend": "npm --prefix code/frontend run dev",
  "dev": "concurrently -n backend,frontend -c blue,green \"npm run backend\" \"npm run frontend\"",
  "start": "npm run dev",
  "dev:backend": "npm run backend",
  "dev:frontend": "npm run frontend"
}
```

## Backend Script

New backend command:

```powershell
npm run backend
```

Implementation:

- Uses `scripts/run-backend-neon.js`.
- Loads root `.env` into the backend process.
- Requires:
  - `DB_URL`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `JWT_SECRET`
- Validates that `DB_URL`:
  - starts with `jdbc:postgresql://`
  - includes `sslmode=require`
  - does not point to `localhost` or `127.0.0.1`
- Runs `mvn spring-boot:run` inside `code/backend`.
- Does not print database credentials or the full database URL.

Existing PowerShell helper retained:

```powershell
.\scripts\run-backend-neon.ps1
```

## Frontend Script

New frontend command:

```powershell
npm run frontend
```

Implementation:

- Runs `npm --prefix code/frontend run dev`.
- Frontend continues to call the Spring Boot API through `NEXT_PUBLIC_API_URL`.
- Frontend does not connect directly to Neon.

## Full Project Script

New full development command:

```powershell
npm run dev
```

Implementation:

- Runs backend and frontend concurrently.
- Backend uses the Neon environment loader.
- Frontend uses the existing Next.js dev script.

## Environment Used

Backend environment variables:

| Variable | Purpose |
|---|---|
| `DB_URL` | Neon JDBC PostgreSQL URL |
| `DB_USERNAME` | Neon database username |
| `DB_PASSWORD` | Neon database password |
| `JWT_SECRET` | JWT signing secret |
| `SERVER_PORT` | Optional backend port override |

Frontend environment variable:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Spring Boot API base URL |

Security notes:

- `.env` remains ignored by Git.
- `.env.example` remains trackable.
- No secret value was added to source code or documentation.

## Verification Result

| Command | Result | Notes |
|---|---|---|
| `npm run backend` | Pass | Verified with temporary `SERVER_PORT=18080` to avoid the existing `8080` port conflict. |
| `npm run frontend` | Pass | Verified with temporary `PORT=3100`. |
| `npm run dev` | Pass | Verified with temporary `SERVER_PORT=18081` and `PORT=3101`. |

Backend verification evidence:

```text
Starting backend with Neon PostgreSQL environment.
HikariPool-1 - Added connection
Successfully validated 17 migrations
Current version of schema "public": 17
Schema "public" is up to date. No migration necessary.
```

Additional checks:

- No `localhost:5432` usage was found in root scripts, README development commands, Neon scripts, or backend runtime properties.
- `npm run dev` started both backend and frontend successfully during verification.
- Temporary verification processes were stopped after checks completed.

## Changes Made

| File | Change |
|---|---|
| `package.json` | Added canonical `backend`, `frontend`, `dev`, and `start` scripts; kept compatibility aliases. |
| `scripts/run-backend-neon.js` | Added Node-based Neon backend runner for root npm scripts. |
| `README.md` | Added `Development Commands` section and clarified Neon-backed workflow. |
| `docs/dev-script-report.md` | Added this report. |

## Remaining Notes

- Port `8080` was already occupied during earlier Neon testing. Use `SERVER_PORT` to override the backend port or stop the process currently using `8080`.
- `scripts/setup-local-db.ps1` remains in the repository as a legacy helper, but it is not part of the Neon-backed development workflow.
