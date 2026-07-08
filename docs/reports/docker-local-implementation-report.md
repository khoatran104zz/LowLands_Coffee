# Docker Local Implementation Report

## Scope

This sprint Dockerizes Lowlands Coffee for local execution.

Out of scope:

- VPS deployment
- Business logic changes
- Database migration changes
- API changes
- UI redesign

Target command:

```bash
docker compose up --build
```

## Docker Architecture

Local Docker services:

- `frontend`
  - Next.js standalone production server.
  - Exposes port `3000`.
- `backend`
  - Spring Boot 4 application on Java 21.
  - Exposes port `8080`.
  - Connects to Neon PostgreSQL through environment variables.
  - Connects to MinIO through the Docker network.
- `minio`
  - Object storage for product images.
  - Exposes API port `9000`.
  - Exposes console port `9001`.

No PostgreSQL container was added because the project uses Neon PostgreSQL.

## Dockerfiles

### Backend

Added:

- `code/backend/Dockerfile`
- `code/backend/.dockerignore`

Backend Dockerfile:

- Uses a Maven build stage.
- Uses Java 21 runtime.
- Builds the Spring Boot jar with `mvn -B -DskipTests package`.
- Runs the jar in a smaller JRE image.
- Runs as non-root user `lowlands`.
- Does not hardcode database, JWT, or MinIO secrets.

### Frontend

Changed:

- `code/frontend/Dockerfile`
- `code/frontend/.dockerignore`

Frontend Dockerfile:

- Keeps multi-stage Node 20 Alpine build.
- Uses `npm ci`.
- Uses `next build`.
- Uses Next standalone output.
- Runs as non-root user `nextjs`.
- Adds build args for:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_MINIO_URL`
- Runs the standalone server from the actual container build path:
  - `node app/server.js`

Reason:

- `NEXT_PUBLIC_*` variables are inlined by Next.js during build, so they must be passed as build args for Docker production builds.

## Compose

Changed:

- `docker-compose.yml`

Services:

- `frontend`
- `backend`
- `minio`

Network:

- `lowlands-network`

Volume:

- `minio-data`

Restart policy:

- `unless-stopped`

Health checks:

- Backend: `GET /api-docs`
- MinIO: `mc ready local`

## Container Communication

Backend to MinIO:

```text
http://minio:9000
```

Browser to backend:

```text
http://localhost:8080/api/v1
```

Browser to MinIO public objects:

```text
http://localhost:9000/lowlands
```

This keeps internal container traffic off `localhost` while preserving browser-accessible local URLs.

## Environment Variables

Changed:

- `.env.example`
- `.env.production.example`
- `.gitignore`
- `code/frontend/package.json`
- `code/frontend/package-lock.json`

Created locally and ignored by Git:

- `.env.local`

Important variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MINIO_URL`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_PUBLIC_BASE_URL`

Docker Compose reads `.env` automatically for `docker compose up --build`.

For local Docker:

```properties
MINIO_ENDPOINT=http://minio:9000
MINIO_PUBLIC_BASE_URL=http://localhost:9000/lowlands
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

No real secret was added to tracked files.

## Files Modified

- `docker-compose.yml`
- `.env.example`
- `.env.production.example`
- `.gitignore`
- `code/backend/Dockerfile`
- `code/backend/.dockerignore`
- `code/frontend/Dockerfile`
- `code/frontend/.dockerignore`
- `docs/reports/docker-audit-report.md`
- `docs/reports/docker-local-implementation-report.md`

Ignored local file:

- `.env.local`

## Validation Result

Compose validation:

```bash
docker compose --env-file .env.example config --quiet
```

Result:

- PASS
- Docker printed a local warning about reading `C:\Users\scarl\.docker\config.json`, but Compose config validation completed successfully.

Backend package:

```bash
mvn -q -DskipTests package
```

Result:

- PASS

Frontend type-check:

```bash
npm.cmd run type-check
```

Result:

- PASS

Frontend production build:

```bash
npm.cmd run build
```

Result:

- PASS when run outside sandbox with network access.
- The first sandboxed run failed because Next.js could not fetch Google Fonts from `fonts.googleapis.com`.

Docker build:

```bash
docker compose build
```

Result:

- PASS through `docker compose up --build -d`.

Notes:

- The first frontend Docker build failed because `package-lock.json` was missing `@swc/helpers@0.5.23`.
- Fixed by adding `@swc/helpers@0.5.23` to frontend dependencies so `npm ci` works in the Linux container.
- The first frontend runtime failed because Next standalone output placed `server.js` under `/app/app/server.js`, not `/app/server.js`.
- Fixed the frontend Dockerfile copy paths and CMD.

## Smoke Test Result

Completed after Docker Desktop was started.

Command:

```bash
docker compose up --build -d
```

Container status:

- `lowlands-backend`: running, healthy.
- `lowlands-frontend`: running.
- `lowlands-minio`: running, healthy.

HTTP checks:

- `GET http://localhost:8080/api-docs`: `200`
- `GET http://localhost:3000`: `200`
- `GET http://localhost:9000/minio/health/live`: `200`

Auth smoke test:

- `POST http://localhost:8080/api/v1/auth/login`
- Admin login result: success.

Not manually verified in browser during this run:

- Product image upload through UI.
- Dashboard page after login.
- Reports page after login.

## Known Issues

- Docker Desktop must be running before `docker compose build` or `docker compose up --build`.
- Compose currently uses `minio/minio:latest` for local convenience. Production deployment should pin a tested MinIO release tag.
- The frontend production build requires network access to fetch Google Fonts because the current app uses `next/font/google`.
- Fresh environments must create a real `.env` from `.env.example` before running Compose.
- `npm audit` reports moderate vulnerabilities in frontend dependencies. This sprint did not change dependency security posture beyond the required Docker build fix.

## Deployment Readiness

Local Docker readiness:

- Configuration ready.
- Build scripts ready.
- Compose topology ready.
- Local Docker build and startup verified.
- Basic HTTP and auth smoke tests passed.

VPS deployment readiness:

- Not in scope for this sprint.
- Recommended next sprint: pin production image tags, add deployment secrets management, configure reverse proxy/TLS, and run production smoke tests on the VPS.
