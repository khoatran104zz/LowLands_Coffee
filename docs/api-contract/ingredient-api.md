# Ingredient API Contract

## 1. Purpose

Manages ingredient categories and ingredients used by recipes, goods receipts, and stock movement calculations.

## 2. Current Frontend Usage

- `src/services/inventory.service.ts` consumes stock balance DTOs containing ingredient fields.
- `src/services/ingredient.service.ts` calls `/ingredients` and `/ingredient-categories`.
- Admin ingredient UI manages ingredient master data, including category, unit, minimum stock, description, and status.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/ingredient-categories` | `INGREDIENT_VIEW` | List ingredient categories. |
| GET | `/api/v1/ingredient-categories/{id}` | `INGREDIENT_VIEW` | Get category by id. |
| POST | `/api/v1/ingredient-categories` | `INGREDIENT_CREATE` | Create ingredient category. |
| PUT | `/api/v1/ingredient-categories/{id}` | `INGREDIENT_UPDATE` | Update ingredient category. |
| DELETE | `/api/v1/ingredient-categories/{id}` | `INGREDIENT_DELETE` | Soft-delete ingredient category. |
| GET | `/api/v1/ingredients` | `INGREDIENT_VIEW` | List ingredients. |
| GET | `/api/v1/ingredients/{id}` | `INGREDIENT_VIEW` | Get ingredient by id. |
| POST | `/api/v1/ingredients` | `INGREDIENT_CREATE` | Create ingredient. |
| PUT | `/api/v1/ingredients/{id}` | `INGREDIENT_UPDATE` | Update ingredient. |
| DELETE | `/api/v1/ingredients/{id}` | `INGREDIENT_DELETE` | Soft-delete ingredient. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `IngredientCategoryCreateRequest` | `code` | required, max 50 |
|  | `name` | required, max 100 |
|  | `description` | max 1000 |
|  | `status` | `active` or `inactive`, optional |
| `IngredientCategoryUpdateRequest` | same fields | `status` required |
| `IngredientCreateRequest` | `categoryId` | required |
|  | `code` | required, max 50 |
|  | `name` | required, max 100 |
|  | `unit` | required, max 20 |
|  | `minStock` | decimal >= 0, optional; defaults to 0 |
|  | `description` | max 1000 |
|  | `status` | `active` or `inactive`, optional |
| `IngredientUpdateRequest` | same fields | `status` required |

Example:

```json
{
  "categoryId": 1,
  "code": "ING000004",
  "name": "Robusta Beans",
  "unit": "g",
  "minStock": 5000,
  "description": "Vietnamese robusta beans for phin coffee",
  "status": "active"
}
```

## 5. Response DTO

`IngredientCategoryResponse`: `id`, `code`, `name`, `description`, `status`, `createdAt`, `updatedAt`.

`IngredientResponse`: `id`, `categoryId`, `categoryName`, `code`, `name`, `unit`, `minStock`, `description`, `status`, `createdAt`, `updatedAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "categoryId": 1,
    "categoryName": "Coffee",
    "code": "ING000004",
    "name": "Robusta Beans",
    "unit": "g",
    "minStock": 5000,
    "description": "Vietnamese robusta beans for phin coffee",
    "status": "active"
  }
}
```

## 6. Business Validation

- Category code must be unique.
- Ingredient code must be unique.
- Ingredient category must exist before creating/updating an ingredient.
- `minStock` is non-negative and is used by stock-balance UIs for low-stock warning.
- Deletes are soft deletes using `status = inactive`.
- Ingredient does not store current stock; stock comes from inventory ledger.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET categories/ingredients | Y | Y | Y | N | N |
| POST/PUT/DELETE categories/ingredients | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/update/delete.
- 201: category or ingredient created.
- 400: request validation error.
- 401: missing/invalid token.
- 403: missing authority.
- 404: category or ingredient not found.
- 409: duplicate code.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- Ingredient master data includes packaging and other consumables because recipes can deduct cups, lids, straws, bags, napkins, and ingredients from the same stock ledger.
- Inventory pages map low-stock warnings from `minStock` instead of using a fixed threshold.

## 10. Future Extension

Future Sprint:

- Ingredient search/filter by category and status.
- Unit conversion rules if purchase unit differs from recipe unit.
