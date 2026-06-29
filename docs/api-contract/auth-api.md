# Auth API Contract

## 1. Purpose

Provides public authentication and authenticated profile management. Registration creates a `CUSTOMER` account. Login and refresh issue JWT bearer tokens.

## 2. Current Frontend Usage

- Pages: `src/app/[locale]/(customer)/login/page.tsx`, `register/page.tsx`, `profile/page.tsx`, `src/app/[locale]/(dashboard)/portal/login/page.tsx`.
- Components: `src/components/account/ProfileCard.tsx`.
- Service/store: `src/services/auth.service.ts`, `src/store/auth.store.ts`, `src/lib/axios.ts`.
- Flow: login/register returns tokens and user; store writes `lowlands_token`, `lowlands_refresh_token`, `lowlands_user`; Axios attaches bearer token.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | PUBLIC | Authenticate by email/password. |
| POST | `/api/v1/auth/register` | PUBLIC | Register a customer account. |
| POST | `/api/v1/auth/refresh-token` | PUBLIC | Validate refresh token and issue new tokens. |
| GET | `/api/v1/auth/profile` | Authenticated | Get current user profile from JWT subject. |
| PUT | `/api/v1/auth/profile` | Authenticated | Update current user's full name and phone. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `LoginRequest` | `email` | `@Email`, `@NotBlank` |
| `LoginRequest` | `password` | `@NotBlank` |
| `RegisterRequest` | `fullName` | `@NotBlank`, max 100 |
| `RegisterRequest` | `email` | `@Email`, `@NotBlank`, max 100 |
| `RegisterRequest` | `phone` | `@NotBlank`, must match `^0[0-9]{9}$`, max 20 |
| `RegisterRequest` | `password` | `@NotBlank`, size 6..100 |
| `RefreshTokenRequest` | `refreshToken` | `@NotBlank` |
| `ProfileUpdateRequest` | `fullName` | `@NotBlank`, max 100 |
| `ProfileUpdateRequest` | `phone` | max 20 |

Example:

```json
{
  "email": "customer@lowlands.coffee",
  "password": "Customer@123"
}
```

## 5. Response DTO

`ApiResponse<AuthResponse>`:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "tokenType": "Bearer",
    "user": {
      "id": 4,
      "fullName": "Lowlands Customer",
      "email": "customer@lowlands.coffee",
      "phone": "0900000004",
      "roleId": 4,
      "roleName": "CUSTOMER",
      "role": "CUSTOMER",
      "permissions": [],
      "status": "ACTIVE",
      "createdAt": "2026-06-29T00:00:00",
      "updatedAt": "2026-06-29T00:00:00"
    }
  }
}
```

Profile endpoints return `ApiResponse<UserResponse>`.

## 6. Business Validation

- Login uses Spring authentication; invalid credentials return 401.
- Register rejects duplicate email and duplicate nonblank phone.
- Register requires phone and password. Frontend and backend use the same messages for required/format/size validation.
- Register requires the `CUSTOMER` role to exist.
- Refresh token must parse to an existing user and pass JWT validation.
- Profile is resolved from authenticated email; missing user returns bad request.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| POST `/auth/login` | Y | Y | Y | Y | Y |
| POST `/auth/register` | Y | Y | Y | Y | Y |
| POST `/auth/refresh-token` | Y | Y | Y | Y | Y |
| GET `/auth/profile` | Y | Y | Y | Y | N |
| PUT `/auth/profile` | Y | Y | Y | Y | N |

## 8. HTTP Status

- 200: successful auth/profile operations.
- 400: validation error, invalid refresh token, invalid user.
- 401: invalid credentials or missing/invalid token.
- 403: authenticated but forbidden by security.
- 409: duplicate email or phone on register.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- `RegisterRequest.password` is required in both frontend and backend.
- `getStores()` is currently placed in `auth.service.ts` but belongs in a store service contract; it calls `/stores`.
- `src/types/index.ts` currently contains merge-conflict markers around `role` and `permissions`; resolve before relying on TypeScript DTOs.

## 10. Future Extension

Future Sprint:

- Logout/revoke refresh token API.
- Password change/reset API.
- Customer address APIs for profile checkout flow.
