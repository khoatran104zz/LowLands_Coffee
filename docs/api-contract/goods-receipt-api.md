# Goods Receipt API Contract

## 1. Purpose

Manages warehouse receiving documents. Completed goods receipts create stock `IN` movements.

## 2. Current Frontend Usage

No current frontend page or service calls goods receipt APIs. Manager inventory page only supports stock balance and manual adjustment.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/goods-receipts` | `GOODS_RECEIPT_VIEW` | List goods receipts. |
| GET | `/api/v1/goods-receipts/{id}` | `GOODS_RECEIPT_VIEW` | Get goods receipt by id. |
| POST | `/api/v1/goods-receipts` | `GOODS_RECEIPT_CREATE` | Create draft goods receipt. |
| PUT | `/api/v1/goods-receipts/{id}` | `GOODS_RECEIPT_UPDATE` | Update a draft goods receipt. |
| DELETE | `/api/v1/goods-receipts/{id}` | `GOODS_RECEIPT_DELETE` | Cancel a draft goods receipt. |
| POST | `/api/v1/goods-receipts/{id}/complete` | `GOODS_RECEIPT_COMPLETE` | Complete receipt and create stock `IN` movements. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `GoodsReceiptCreateRequest` | `supplierId` | required |
|  | `storeId` | required |
|  | `createdById` | required |
|  | `receiptCode` | required, max 50 |
|  | `note` | max 255 |
|  | `items` | required non-empty list |
| `GoodsReceiptUpdateRequest` | same fields | same validation |
| `GoodsReceiptItemRequest` | `ingredientId` | required |
|  | `quantity` | required, decimal >= 0.01 |
|  | `unit` | required, max 20 |
|  | `unitPrice` | required, decimal >= 0 |

Example:

```json
{
  "supplierId": 1,
  "storeId": 1,
  "createdById": 1,
  "receiptCode": "GR-20260629-001",
  "note": "Morning delivery",
  "items": [
    { "ingredientId": 1, "quantity": 1000, "unit": "gram", "unitPrice": 180 }
  ]
}
```

## 5. Response DTO

`GoodsReceiptResponse`: `id`, `supplierId`, `supplierName`, `storeId`, `storeName`, `createdById`, `createdByName`, `receiptCode`, `totalAmount`, `status`, `note`, `items`, `createdAt`, `updatedAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "supplierId": 1,
    "storeId": 1,
    "createdById": 1,
    "receiptCode": "GR-20260629-001",
    "totalAmount": 180000,
    "status": "DRAFT",
    "items": [
      {
        "id": 1,
        "ingredientId": 1,
        "ingredientCode": "ROBUSTA_BEAN",
        "ingredientName": "Robusta Coffee Bean",
        "quantity": 1000,
        "unit": "gram",
        "unitPrice": 180,
        "totalPrice": 180000
      }
    ]
  }
}
```

## 6. Business Validation

- Receipt code must be unique.
- Supplier, store, created-by user, and all ingredients must exist.
- Goods receipt starts with status `DRAFT`; request status is not accepted.
- Only `DRAFT` receipts can be updated, cancelled, or completed.
- Ingredient ids must be unique within one receipt.
- `totalPrice = quantity * unitPrice`; `totalAmount` is sum of item totals.
- Completing creates one `stock_movements` row per item with `movement_type = IN`, `reference_type = GOODS_RECEIPT`, `reference_id = receipt.id`.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET goods receipts | Y | Y | Y | N | N |
| POST goods receipts | Y | Y | Y | N | N |
| PUT goods receipts | Y | Y | N | N | N |
| POST complete | Y | Y | N | N | N |
| DELETE cancel | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/update/delete/complete.
- 201: goods receipt created.
- 400: validation error, non-draft mutation, duplicate item ingredient.
- 401: missing/invalid token.
- 403: missing authority.
- 404: receipt, supplier, store, user, or ingredient not found.
- 409: duplicate receipt code.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- Create `goods-receipt.service.ts` and UI workflow before use.
- The UI should disable update/cancel/complete actions unless `status = DRAFT`.
- Supplier and ingredient selectors require supplier and ingredient APIs.

## 10. Future Extension

Future Sprint:

- Goods receipt approval workflow.
- Receive partial shipments.
- Print/export receipt document.
