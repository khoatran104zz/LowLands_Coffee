# Ingredient API Contract

## 1. Purpose

Manages ingredient categories and ingredients used by recipes, goods receipts, and stock movement calculations.

## 2. Current Frontend Usage

- `src/services/inventory.service.ts` consumes stock balance DTOs containing ingredient fields.
- No current frontend service calls `/ingredients` or `/ingredient-categories` directly.
- Mock gap: `dashboardStore.ts` defines local ingredient inventory objects not matching backend `IngredientResponse`.

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
|  | `status` | `active` or `inactive`, optional |
| `IngredientUpdateRequest` | same fields | `status` required |

Example:

```json
{
  "categoryId": 1,
  "code": "ROBUSTA_BEAN",
  "name": "Robusta Coffee Bean",
  "unit": "gram",
  "status": "active"
}
```

## 5. Response DTO

`IngredientCategoryResponse`: `id`, `code`, `name`, `description`, `status`, `createdAt`, `updatedAt`.

`IngredientResponse`: `id`, `categoryId`, `categoryName`, `code`, `name`, `unit`, `status`, `createdAt`, `updatedAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "categoryId": 1,
    "categoryName": "Coffee",
    "code": "ROBUSTA_BEAN",
    "name": "Robusta Coffee Bean",
    "unit": "gram",
    "status": "active"
  }
}
```

## 6. Business Validation

- Category code must be unique.
- Ingredient code must be unique.
- Ingredient category must exist before creating/updating an ingredient.
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

- Add `ingredient.service.ts` when ingredient CRUD UI is implemented.
- Inventory page should map backend stock balance fields instead of local `Ingredient` mock fields.

## 10. Future Extension

Future Sprint:

- Ingredient search/filter by category and status.
- Unit conversion rules if purchase unit differs from recipe unit.
