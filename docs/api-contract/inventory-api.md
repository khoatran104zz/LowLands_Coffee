# Inventory API Contract

## 1. Purpose

Documents inventory ledger APIs. Current stock is calculated from `stock_movements`; it is not stored on `ingredients`.

## 2. Current Frontend Usage

- Page: `src/app/[locale]/(dashboard)/manager/inventory/page.tsx`.
- Service: `src/services/inventory.service.ts`.
- Flow: manager page loads `/inventory/stock-balances` and posts `/inventory/stock-adjustments` using current user id as `createdById`.
- Mock gap: `dashboardStore.ts` still contains local `INITIAL_INGREDIENTS` and inventory mutation helpers for older UI flows.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/inventory/stock-movements` | `INVENTORY_VIEW` | List all stock movement ledger rows. |
| POST | `/api/v1/inventory/stock-adjustments` | `INVENTORY_ADJUST` | Create manual adjustment movement. |
| GET | `/api/v1/inventory/stock-balances` | `INVENTORY_VIEW` | List calculated stock by store and ingredient. |
| GET | `/api/v1/inventory/stores/{storeId}/ingredients/{ingredientId}/stock` | `INVENTORY_VIEW` | Get current stock for one store/ingredient. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `StockAdjustmentRequest` | `storeId` | required |
|  | `ingredientId` | required |
|  | `quantity` | required; business rule: not zero |
|  | `unit` | required, max 20 |
|  | `createdById` | required |
|  | `note` | max 255 |

Example:

```json
{
  "storeId": 1,
  "ingredientId": 2,
  "quantity": -5,
  "unit": "gram",
  "createdById": 2,
  "note": "Manual recount"
}
```

## 5. Response DTO

`StockBalanceResponse`: `storeId`, `storeName`, `ingredientId`, `ingredientCode`, `ingredientName`, `unit`, `currentStock`.

`StockMovementResponse`: `id`, `storeId`, `storeName`, `ingredientId`, `ingredientCode`, `ingredientName`, `movementType`, `quantity`, `unit`, `referenceType`, `referenceId`, `note`, `createdById`, `createdByName`, `createdAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "storeId": 1,
      "storeName": "Lowlands Coffee - Default Store",
      "ingredientId": 1,
      "ingredientCode": "ROBUSTA_BEAN",
      "ingredientName": "Robusta Coffee Bean",
      "unit": "gram",
      "currentStock": 6000
    }
  ]
}
```

## 6. Business Validation

- `storeId`, `ingredientId`, and `createdById` must reference existing records.
- Adjustment quantity must not be zero.
- Manual adjustment creates `stock_movements.movement_type = ADJUSTMENT` and `reference_type = MANUAL_ADJUSTMENT`.
- Stock balance is calculated by summing `IN`, subtracting `OUT`, and adding signed `ADJUSTMENT`.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET stock movements/balances/current stock | Y | Y | Y | N | N |
| POST stock adjustment | Y | Y | N | N | N |

## 8. HTTP Status

- 200: successful reads.
- 201: stock adjustment created.
- 400: validation error or zero adjustment.
- 401: missing/invalid token.
- 403: missing authority.
- 404: store, ingredient, or user not found.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- `inventory.service.ts` matches the implemented stock balance and adjustment endpoints.
- The UI currently sends `createdById` from the authenticated user; backend trusts the supplied id.
- Replace remaining mock inventory state in `dashboardStore.ts` when all inventory pages use backend responses.

## 10. Future Extension

Future Sprint:

- Low-stock threshold configuration per store/ingredient.
- Stock movement filter by store, ingredient, type, date range.
- Order completion stock-out integration.
