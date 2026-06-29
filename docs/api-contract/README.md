# Lowlands Coffee API Contracts

## Purpose

This folder documents the API contract between the Spring Boot backend and the Next.js frontend based on the current implementation. These files are the working agreement for request DTOs, response DTOs, permissions, frontend integration, and future sprint gaps.

Old API contract documents are reference only. Backend code, frontend code, database design, conventions, and current migrations are the source of truth.

## Folder Structure

- `auth-api.md` - login, register, refresh token, current profile.
- `product-api.md` - public menu/catalog plus admin product, category, and topping APIs.
- `inventory-api.md` - stock movements, stock balances, and manual stock adjustment.
- `supplier-api.md` - supplier master data.
- `ingredient-api.md` - ingredient categories and ingredients.
- `recipe-api.md` - product variant recipes and recipe ingredients.
- `goods-receipt-api.md` - goods receipt draft/update/cancel/complete flow.
- `user-api.md` - user account administration.
- `role-api.md` - role administration.
- `permission-api.md` - permission administration.
- `dashboard-api.md` - admin and manager dashboard summaries.

## Naming Convention

- One business module per file.
- File names use kebab-case and end with `-api.md`.
- Endpoint paths are documented relative to the backend base URL `/api/v1`.
- All backend responses use `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

## Backend Usage

Backend changes must keep the matching contract file current in the same sprint. When adding or changing an endpoint, update endpoint list, request DTO, response DTO, business validation, permission matrix, and HTTP statuses.

## Frontend Usage

Frontend services in `code/frontend/src/services` should match these contracts exactly. Pages should call services rather than hardcoded Axios calls. Mock data must not hide backend integration errors after the backend API exists.

## Update Workflow

1. Read the current backend controller, DTO, service, repository, security config, and migration/ERD state.
2. Read the current frontend page/service/store usage.
3. Update only the contract file for the affected business module.
4. Mark APIs that do not exist yet as `Future Sprint`; do not present them as implemented.
5. Record integration gaps in the module contract and, when rebuilding broadly, in `docs/api-contract-rebuild-report.md`.
