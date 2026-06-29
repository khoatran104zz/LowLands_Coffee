# Dashboard API Contract

## 1. Purpose

Provides compact summary metrics for admin and manager dashboards.

## 2. Current Frontend Usage

- Pages: `src/app/[locale]/(dashboard)/admin/dashboard/page.tsx`, `manager/dashboard/page.tsx`.
- Service: `src/services/dashboard.service.ts`.
- Flow: pages call summary endpoint on mount and render cards/charts around returned counters.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard/summary` | Role `ADMIN` | Admin global summary. |
| GET | `/api/v1/manager/dashboard/summary` | Role `MANAGER` | Summary for manager's assigned active store. |

## 4. Request DTO

No request body. Manager summary uses authenticated email from JWT.

## 5. Response DTO

`AdminDashboardSummaryResponse`: `totalUsers`, `totalStores`, `totalProducts`, `totalOrders`, `totalRevenue`.

`ManagerDashboardSummaryResponse`: `storeId`, `totalProducts`, `inventoryItems`, `lowStockItems`, `totalOrders`, `totalRevenue`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalUsers": 4,
    "totalStores": 1,
    "totalProducts": 4,
    "totalOrders": 0,
    "totalRevenue": 0
  }
}
```

## 6. Business Validation

- Admin summary counts users, stores, products; order and revenue are placeholders returning `0`.
- Manager summary requires user by authenticated email.
- Manager must have an active `store_users` assignment.
- Manager inventory item count and low-stock count derive from stock movement calculations.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET `/admin/dashboard/summary` | Y | N | N | N | N |
| GET `/manager/dashboard/summary` | N | Y | N | N | N |

## 8. HTTP Status

- 200: successful summary.
- 401: missing/invalid token.
- 403: wrong role.
- 404: manager user or active store assignment not found.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- `dashboard.service.ts` matches both implemented endpoints.
- Admin and manager pages should treat order/revenue values as placeholders until order/payment backend exists.
- Some report/revenue pages still use mock order data and should not be confused with dashboard summary API.

## 10. Future Extension

Future Sprint:

- Real order/revenue metrics after order/payment APIs exist.
- Date-range filters.
- Staff dashboard endpoint.
