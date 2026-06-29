# Permission API Contract

## 1. Purpose

Manages permission catalog entries used by Spring Security method authorization and role assignment.

## 2. Current Frontend Usage

- Component: `src/components/account/PermissionList.tsx` displays permissions from authenticated `UserResponse`.
- No frontend service currently calls `/permissions`.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/permissions` | `PERMISSION_VIEW` | List permissions. |
| GET | `/api/v1/permissions/{id}` | `PERMISSION_VIEW` | Get permission by id. |
| POST | `/api/v1/permissions` | `PERMISSION_CREATE` | Create permission. |
| PUT | `/api/v1/permissions/{id}` | `PERMISSION_UPDATE` | Update permission. |
| DELETE | `/api/v1/permissions/{id}` | `PERMISSION_DELETE` | Hard-delete permission. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `PermissionCreateRequest` | `code` | required, max 100 |
|  | `name` | required, max 100 |
| `PermissionUpdateRequest` | `code` | required, max 100 |
|  | `name` | required, max 100 |

Example:

```json
{
  "code": "PRODUCT_VIEW",
  "name": "View products"
}
```

## 5. Response DTO

`PermissionResponse`: `id`, `code`, `name`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "code": "PRODUCT_VIEW",
    "name": "View products"
  }
}
```

## 6. Business Validation

- Permission code must be unique on create.
- Permission id must exist for read/update/delete.
- Current update maps code/name without duplicate-code validation.
- Delete currently hard-deletes the permission.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET permissions | Y | N | N | N | N |
| POST/PUT/DELETE permissions | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/create/update/delete.
- 400: validation error or duplicate permission on create.
- 401: missing/invalid token.
- 403: missing authority.
- 404: permission not found.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- Add `permission.service.ts` before creating permission admin UI.
- `PermissionList.tsx` should continue reading from `UserResponse.permissions` for current account display.

## 10. Future Extension

Future Sprint:

- Permission grouping by module.
- Role-permission assignment API.
