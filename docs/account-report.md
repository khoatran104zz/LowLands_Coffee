# Lowlands Coffee Account Report

## 1. Seed Accounts

The backend bootstrap currently creates these default accounts when they do not already exist.

| Role | Email | Password | Login Page | Default Status |
|---|---|---|---|---|
| ADMIN | `admin@lowlands.coffee` | `Admin@123` | `/portal/login` | `ACTIVE` |
| MANAGER | `manager@lowlands.coffee` | `Manager@123` | `/portal/login` | `ACTIVE` |
| STAFF | `staff@lowlands.coffee` | `Staff@123` | `/portal/login` | `ACTIVE` |
| CUSTOMER | `customer@lowlands.coffee` | `Customer@123` | `/login` | `ACTIVE` |

Source:

- `code/backend/src/main/java/com/lowlands/coffee/config/DataBootstrap.java`

## 2. Login Routing

| Account Type | Expected Login Route | Notes |
|---|---|---|
| ADMIN | `/portal/login` | Redirects to admin dashboard after login. |
| MANAGER | `/portal/login` | Redirects to manager dashboard after login. |
| STAFF | `/portal/login` | Redirects to POS after login. |
| CUSTOMER | `/login` | Customer-facing login page. |

Customer login blocks staff/admin/manager accounts and redirects them to the portal login.

## 3. Register Flow

Customer registration sends this request to the backend:

```http
POST /api/v1/auth/register
```

Request fields:

| Field | Required | Validation |
|---|---:|---|
| `fullName` | Yes | Not blank, max 100 characters |
| `email` | Yes | Valid email, unique, max 100 characters |
| `phone` | Yes | Must have 10 digits and start with `0`, unique |
| `password` | Yes | 6 to 100 characters |

Frontend source:

- `code/frontend/src/app/[locale]/(customer)/register/page.tsx`
- `code/frontend/src/services/auth.service.ts`

Backend source:

- `code/backend/src/main/java/com/lowlands/coffee/modules/auth/controller/AuthController.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/auth/service/impl/AuthServiceImpl.java`
- `code/backend/src/main/java/com/lowlands/coffee/modules/auth/dto/request/RegisterRequest.java`

## 4. Where Registered Accounts Are Stored

Registered accounts are stored in the PostgreSQL `users` table.

Main columns:

| Column | Description |
|---|---|
| `id` | User primary key |
| `full_name` | Customer full name |
| `email` | Unique login email |
| `phone` | Customer phone |
| `password` | BCrypt-hashed password |
| `role_id` | Role foreign key; customer registration uses `CUSTOMER` |
| `status` | Account status, currently `ACTIVE` on registration |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |

Database/entity source:

- `code/backend/src/main/resources/db/migration/V4__create_users.sql`
- `code/backend/src/main/java/com/lowlands/coffee/modules/user/entity/UserEntity.java`

## 5. Browser Session Storage

After successful login or registration, the frontend stores authentication state in browser `localStorage`:

| Key | Purpose |
|---|---|
| `lowlands_token` | Access token |
| `lowlands_refresh_token` | Refresh token |
| `lowlands_user` | Current user profile snapshot |

Frontend source:

- `code/frontend/src/store/auth.store.ts`

## 6. Security Notes

- Passwords are never stored as plain text in the database.
- Backend hashes passwords with BCrypt before saving.
- Duplicate email is rejected.
- Duplicate phone is rejected when registering a customer.
- Seed accounts are intended for local development/demo use and should be changed before production.
