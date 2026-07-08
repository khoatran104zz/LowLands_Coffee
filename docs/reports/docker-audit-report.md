# Docker Audit Report

## Scope

This audit covers local Docker readiness for Lowlands Coffee.

Out of scope:

- VPS deployment
- Business logic changes
- Database schema changes
- API redesign
- Frontend redesign

## Files Reviewed

- `docker-compose.yml`
- `.env.example`
- `.gitignore`
- `code/backend/pom.xml`
- `code/backend/src/main/resources/application.properties`
- `code/frontend/Dockerfile`
- `code/frontend/.dockerignore`
- `code/frontend/next.config.ts`
- `code/frontend/src/lib/axios.ts`

## Current State

### Root docker-compose.yml

Status: incomplete.

Findings:

- Only MinIO is defined.
- Backend service is missing.
- Frontend service is missing.
- MinIO credentials are hardcoded.
- No shared network is defined.
- No restart policy is defined.
- No health checks are defined.
- MinIO data is mounted through a local folder instead of a named Docker volume.

### Backend Dockerfile

Status: missing.

Required:

- Multi-stage Maven build.
- Java 21 runtime.
- Non-root runtime user.
- Production jar execution.
- No hardcoded environment.

### Backend .dockerignore

Status: missing.

Required exclusions:

- `target`
- `.git`
- `.idea`
- `.vscode`
- `docs`
- logs
- tmp files

### Frontend Dockerfile

Status: mostly ready, needs small production hardening.

Findings:

- Already uses multi-stage build.
- Already uses `npm ci`.
- Already uses `next build`.
- Already uses standalone output.
- Already runs as a non-root user.
- Needs build args for `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_MINIO_URL` because `NEXT_PUBLIC_*` values are inlined during Next.js build.

### Frontend .dockerignore

Status: partially ready.

Findings:

- Excludes `node_modules`, `.next`, `.git`, and local debug files.
- Does not explicitly exclude `.idea`, `.vscode`, `docs`, `logs`, and tmp folders.

### Environment Files

Status: incomplete for Docker local.

Findings:

- `.env.example` exists.
- `.env.local` exists under frontend, but there is no root Docker `.env.local` template.
- `.env.production.example` is missing.
- `.gitignore` ignores `.env.*`, so `.env.production.example` must be explicitly allowed.

## Container Communication Gaps

Backend to MinIO:

- Must use `http://minio:9000` inside Docker network.
- Current `.env.example` uses `http://localhost:9000`, which is correct for host-local backend but not for backend container.

Frontend to Backend:

- Browser should call `http://localhost:8080/api/v1` for local Docker.
- This must be configured through `NEXT_PUBLIC_API_URL`, not hardcoded in source.

Browser to MinIO:

- Product image public URLs should use `http://localhost:9000/lowlands` for local Docker browser access.
- Backend upload endpoint should still talk to MinIO internally through `http://minio:9000`.

## Health Check Gaps

Backend:

- No actuator dependency is present.
- A lightweight health check can call `/api-docs` because it is publicly accessible and verifies the app is serving HTTP after startup.

MinIO:

- MinIO supports `/minio/health/live`.

Frontend:

- A health check is optional for this sprint. Compose can still restart the container with `unless-stopped`.

## Production Readiness Gaps

- Backend image does not exist yet.
- Compose is not enough to run the full local system.
- Secrets must not be committed.
- Local Docker values must be separated from production examples.
- Frontend build-time public env variables must be passed as build args.

## Recommendation

Implement:

- `code/backend/Dockerfile`
- `code/backend/.dockerignore`
- Harden `code/frontend/Dockerfile`
- Harden `code/frontend/.dockerignore`
- Complete root `docker-compose.yml`
- Update `.env.example`
- Add `.env.production.example`
- Create ignored root `.env.local` for local Docker placeholders
- Document the final local Docker architecture
