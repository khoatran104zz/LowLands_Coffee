# Supplier API Contract

## 1. Purpose

Manages suppliers used by goods receipts and inventory procurement.

## 2. Current Frontend Usage

No frontend service or page currently calls supplier APIs. Manager inventory UI does not yet expose supplier CRUD.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/suppliers` | `SUPPLIER_VIEW` | List suppliers. |
| GET | `/api/v1/suppliers/{id}` | `SUPPLIER_VIEW` | Get supplier by id. |
| POST | `/api/v1/suppliers` | `SUPPLIER_CREATE` | Create supplier. |
| PUT | `/api/v1/suppliers/{id}` | `SUPPLIER_UPDATE` | Update supplier. |
| DELETE | `/api/v1/suppliers/{id}` | `SUPPLIER_DELETE` | Soft-delete supplier by setting `inactive`. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `SupplierCreateRequest` | `code` | required, max 50 |
|  | `name` | required, max 100 |
|  | `contactName` | max 100 |
|  | `phone` | max 20 |
|  | `email` | email format, max 100 |
|  | `address` | max 255 |
|  | `taxCode` | max 50 |
|  | `status` | `active` or `inactive`, optional; defaults to `active` |
| `SupplierUpdateRequest` | same fields | `status` required |

Example:

```json
{
  "code": "SUP-DEMO",
  "name": "Lowlands Demo Supplier",
  "contactName": "Demo Supply Team",
  "phone": "02838224466",
  "email": "supplier@lowlands.coffee",
  "address": "Ho Chi Minh City",
  "taxCode": "DEMO-TAX",
  "status": "active"
}
```

## 5. Response DTO

`SupplierResponse`: `id`, `code`, `name`, `contactName`, `phone`, `email`, `address`, `taxCode`, `status`, `createdAt`, `updatedAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "code": "SUP-DEMO",
    "name": "Lowlands Demo Supplier",
    "status": "active"
  }
}
```

## 6. Business Validation

- Supplier code is trimmed and must be unique.
- Update rejects code already used by another supplier.
- Delete is a soft delete: status becomes `inactive`.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET suppliers | Y | Y | Y | N | N |
| POST/PUT/DELETE suppliers | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/update/delete.
- 201: supplier created.
- 400: request validation error.
- 401: missing/invalid token.
- 403: missing authority.
- 404: supplier not found.
- 409: duplicate supplier code.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- Create `supplier.service.ts` before adding supplier UI.
- Goods receipt UI will need this endpoint for supplier selection.
- No mock supplier source was detected in frontend services.

## 10. Future Extension

Future Sprint:

- Supplier search/filter by status or code.
- Supplier performance/history based on goods receipts.
