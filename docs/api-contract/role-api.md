# Role API Contract

## 1. Purpose

Manages RBAC roles. Current role responses include assigned permission codes, but create/update only accept role name.

## 2. Current Frontend Usage

No frontend service currently calls role APIs. User management hardcodes role ids in `dashboardStore.ts`.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/roles` | `ROLE_VIEW` | List roles. |
| GET | `/api/v1/roles/{id}` | `ROLE_VIEW` | Get role by id. |
| POST | `/api/v1/roles` | `ROLE_CREATE` | Create role. |
| PUT | `/api/v1/roles/{id}` | `ROLE_UPDATE` | Update role name. |
| DELETE | `/api/v1/roles/{id}` | `ROLE_DELETE` | Hard-delete role. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `RoleCreateRequest` | `name` | required, max 50 |
| `RoleUpdateRequest` | `name` | required, max 50 |

Example:

```json
{
  "name": "MANAGER"
}
```

## 5. Response DTO

`RoleResponse`: `id`, `name`, `permissions`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 2,
    "name": "MANAGER",
    "permissions": ["USER_VIEW", "STORE_VIEW", "INVENTORY_VIEW"]
  }
}
```

## 6. Business Validation

- Role name must be unique on create.
- Role id must exist for read/update/delete.
- Current update maps only name; duplicate-name validation on update is not implemented.
- Delete currently hard-deletes the role.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET roles | Y | N | N | N | N |
| POST/PUT/DELETE roles | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/create/update/delete.
- 400: validation error or duplicate role on create.
- 401: missing/invalid token.
- 403: missing authority.
- 404: role not found.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- Add `role.service.ts` and use it to populate role selectors.
- User management should stop hardcoding role ids.

## 10. Future Extension

Future Sprint:

- Assign/unassign permissions to roles.
- Prevent deletion of system roles in use.
