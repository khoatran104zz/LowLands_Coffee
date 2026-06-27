# Sprint 3 Backend Report

## 1. Scope

Implemented backend for the approved Sprint 3 database design:

- Supplier
- Ingredient
- Recipe
- Inventory
- Goods Receipt

Not implemented:

- Order flow
- Payment flow
- Inventory cache table

Stock quantity is calculated from `stock_movements`.

---

## 2. Migrations

Created migrations after current version `V12`:

- `code/backend/src/main/resources/db/migration/V13__create_sprint3_inventory_tables.sql`
- `code/backend/src/main/resources/db/migration/V14__seed_sprint3_permissions.sql`

`V13` creates:

- `suppliers`
- `ingredient_categories`
- `ingredients`
- `recipes`
- `recipe_ingredients`
- `goods_receipts`
- `goods_receipt_items`
- `stock_movements`

`V14` seeds permissions:

- `SUPPLIER_VIEW`, `SUPPLIER_CREATE`, `SUPPLIER_UPDATE`, `SUPPLIER_DELETE`
- `INGREDIENT_VIEW`, `INGREDIENT_CREATE`, `INGREDIENT_UPDATE`, `INGREDIENT_DELETE`
- `RECIPE_VIEW`, `RECIPE_CREATE`, `RECIPE_UPDATE`, `RECIPE_DELETE`
- `INVENTORY_VIEW`, `INVENTORY_ADJUST`
- `GOODS_RECEIPT_VIEW`, `GOODS_RECEIPT_CREATE`, `GOODS_RECEIPT_UPDATE`, `GOODS_RECEIPT_DELETE`, `GOODS_RECEIPT_COMPLETE`

---

## 3. Implemented APIs

### Supplier

- `GET /api/v1/suppliers`
- `GET /api/v1/suppliers/{id}`
- `POST /api/v1/suppliers`
- `PUT /api/v1/suppliers/{id}`
- `DELETE /api/v1/suppliers/{id}`

Delete is implemented as soft delete by setting `status = inactive`.

### Ingredient

- `GET /api/v1/ingredient-categories`
- `GET /api/v1/ingredient-categories/{id}`
- `POST /api/v1/ingredient-categories`
- `PUT /api/v1/ingredient-categories/{id}`
- `DELETE /api/v1/ingredient-categories/{id}`
- `GET /api/v1/ingredients`
- `GET /api/v1/ingredients/{id}`
- `POST /api/v1/ingredients`
- `PUT /api/v1/ingredients/{id}`
- `DELETE /api/v1/ingredients/{id}`

Deletes are soft deletes by setting `status = inactive`.

### Recipe

- `GET /api/v1/recipes`
- `GET /api/v1/recipes/{id}`
- `POST /api/v1/recipes`
- `PUT /api/v1/recipes/{id}`
- `DELETE /api/v1/recipes/{id}`

Recipe keeps a unique relationship with `product_variants` through `recipes.product_variant_id`.

### Goods Receipt

- `GET /api/v1/goods-receipts`
- `GET /api/v1/goods-receipts/{id}`
- `POST /api/v1/goods-receipts`
- `PUT /api/v1/goods-receipts/{id}`
- `DELETE /api/v1/goods-receipts/{id}`
- `POST /api/v1/goods-receipts/{id}/complete`

Only `DRAFT` goods receipts can be updated, cancelled, or completed.

### Inventory

- `GET /api/v1/inventory/stock-movements`
- `POST /api/v1/inventory/stock-adjustments`
- `GET /api/v1/inventory/stock-balances`
- `GET /api/v1/inventory/stores/{storeId}/ingredients/{ingredientId}/stock`

Manual adjustment creates a `stock_movements` row with:

- `movement_type = ADJUSTMENT`
- `reference_type = MANUAL_ADJUSTMENT`

---

## 4. Inventory Flow

### Supplier -> Goods Receipt -> Stock Movement IN

When `POST /api/v1/goods-receipts/{id}/complete` is called:

1. The service verifies the receipt is `DRAFT`.
2. The receipt status becomes `COMPLETED`.
3. Each `goods_receipt_items` row creates one `stock_movements` row:
   - `movement_type = IN`
   - `reference_type = GOODS_RECEIPT`
   - `reference_id = goods_receipts.id`

### Recipe -> Recipe Ingredient

`recipes` define formula metadata for product variants. `recipe_ingredients` stores ingredient quantities required for one product variant. This flow does not change stock.

### Order Completed -> Stock Movement OUT

Not implemented in Sprint 3. The database and `stock_movements.reference_type = ORDER` are ready for a future sprint, but no Order or Payment backend changes were added.

---

## 5. Stock Calculation

Current stock is calculated from `stock_movements`:

```text
current_stock =
  SUM(IN quantity)
  - SUM(OUT quantity)
  + SUM(ADJUSTMENT quantity)
```

Scope:

```text
store_id + ingredient_id
```

No inventory cache table was added.

---

## 6. Verification

Commands run:

```text
mvn test
```

Result:

```text
BUILD SUCCESS
Tests run: 1, Failures: 0, Errors: 0
```

Backend run check:

```text
http://localhost:18080/api-docs
```

Result:

```text
Backend run check passed
```

The run check used H2 in PostgreSQL compatibility mode with the test classpath so the backend could be started without requiring a local PostgreSQL service.
