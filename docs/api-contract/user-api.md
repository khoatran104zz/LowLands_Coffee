# User API Contract

## 1. Purpose

Administers user accounts for staff, managers, admins, and customers.

## 2. Current Frontend Usage

- Pages: `src/app/[locale]/(dashboard)/admin/employees/page.tsx`, `admin/customers/page.tsx`.
- Service/store: `src/services/user.service.ts`, `src/store/dashboardStore.ts`.
- Flow: dashboard store hydrates users, maps non-customer users to employee rows, and maps `CUSTOMER` users to customer rows.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/users` | `USER_VIEW` | List users. |
| GET | `/api/v1/users/{id}` | `USER_VIEW` | Get user by id. |
| POST | `/api/v1/users` | `USER_CREATE` | Create user. |
| PUT | `/api/v1/users/{id}` | `USER_UPDATE` | Update user. |
| DELETE | `/api/v1/users/{id}` | `USER_DELETE` | Hard-delete user. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `UserCreateRequest` | `fullName` | required, max 100 |
|  | `email` | required, email, max 100 |
|  | `phone` | max 20 |
|  | `password` | required, size 6..100 |
|  | `roleId` | required |
|  | `status` | required, max 20 |
| `UserUpdateRequest` | `fullName`, `email`, `phone`, `roleId`, `status` | same as create, except no password |

Example:

```json
{
  "fullName": "Lowlands Staff",
  "email": "staff@lowlands.coffee",
  "phone": "0900000003",
  "password": "Staff@123",
  "roleId": 3,
  "status": "ACTIVE"
}
```

## 5. Response DTO

`UserResponse`: `id`, `fullName`, `email`, `phone`, `roleId`, `roleName`, `role`, `permissions`, `status`, `createdAt`, `updatedAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 3,
    "fullName": "Lowlands Staff",
    "email": "staff@lowlands.coffee",
    "roleId": 3,
    "roleName": "STAFF",
    "role": "STAFF",
    "permissions": ["STORE_VIEW", "USER_VIEW"],
    "status": "ACTIVE"
  }
}
```

## 6. Business Validation

- Email must be unique on create.
- Update rejects email already used by another user.
- Role id must exist.
- Password is BCrypt-hashed on create.
- Delete currently hard-deletes the user record.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET users | Y | Y | Y | N | N |
| POST/PUT/DELETE users | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/create/update/delete.
- 400: validation error or duplicate email.
- 401: missing/invalid token.
- 403: missing authority.
- 404: user or role not found.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- `user.service.ts` matches implemented endpoints.
- Frontend assumes role ids `1=admin`, `2=manager`, `3=staff`; this depends on seed order and should be replaced with role lookup.
- `src/types/index.ts` and `dashboardStore.ts` contain merge-conflict markers affecting user typing/hydration.

## 10. Future Extension

Future Sprint:

- Soft-delete/deactivate user instead of hard delete.
- User search/filter/pagination.
- Role assignment UI based on `/roles` instead of hardcoded ids.
