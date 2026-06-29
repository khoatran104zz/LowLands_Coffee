# Recipe API Contract

## 1. Purpose

Defines ingredient quantities needed for each product variant. Recipes support future stock deduction when orders are completed.

## 2. Current Frontend Usage

No current frontend page, service, or Zustand store calls recipe APIs.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/recipes` | `RECIPE_VIEW` | List recipes. |
| GET | `/api/v1/recipes/{id}` | `RECIPE_VIEW` | Get recipe by id. |
| POST | `/api/v1/recipes` | `RECIPE_CREATE` | Create recipe with ingredients. |
| PUT | `/api/v1/recipes/{id}` | `RECIPE_UPDATE` | Update recipe and ingredient list. |
| DELETE | `/api/v1/recipes/{id}` | `RECIPE_DELETE` | Soft-delete recipe by setting `inactive`. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `RecipeCreateRequest` | `productVariantId` | required |
|  | `code` | required, max 50 |
|  | `name` | required, max 100 |
|  | `description` | max 1000 |
|  | `status` | `active` or `inactive`, optional |
|  | `ingredients` | required non-empty list |
| `RecipeUpdateRequest` | same fields | `status` required |
| `RecipeIngredientRequest` | `ingredientId` | required |
|  | `quantity` | required, decimal >= 0.01 |
|  | `unit` | required, max 20 |

Example:

```json
{
  "productVariantId": 1,
  "code": "REC-PHIN-M",
  "name": "Phin Sua Da M",
  "description": "Standard recipe",
  "status": "active",
  "ingredients": [
    { "ingredientId": 1, "quantity": 25, "unit": "gram" },
    { "ingredientId": 2, "quantity": 40, "unit": "ml" }
  ]
}
```

## 5. Response DTO

`RecipeResponse`: `id`, `productVariantId`, `productVariantSize`, `code`, `name`, `description`, `status`, `ingredients`, `createdAt`, `updatedAt`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "productVariantId": 1,
    "productVariantSize": "M",
    "code": "REC-PHIN-M",
    "name": "Phin Sua Da M",
    "status": "active",
    "ingredients": [
      {
        "id": 1,
        "ingredientId": 1,
        "ingredientCode": "ROBUSTA_BEAN",
        "ingredientName": "Robusta Coffee Bean",
        "quantity": 25,
        "unit": "gram"
      }
    ]
  }
}
```

## 6. Business Validation

- Recipe code must be unique.
- A product variant can have only one recipe.
- Product variant must exist.
- Every ingredient must exist.
- Ingredient ids must be unique within one recipe.
- Delete is a soft delete using `status = inactive`.

## 7. Permission Matrix

| Endpoint | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| GET recipes | Y | Y | Y | N | N |
| POST/PUT/DELETE recipes | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful read/update/delete.
- 201: recipe created.
- 400: validation error or duplicate ingredient in recipe.
- 401: missing/invalid token.
- 403: missing authority.
- 404: recipe, product variant, or ingredient not found.
- 409: duplicate recipe code or product variant already has recipe.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- Add `recipe.service.ts` and recipe UI before integrating.
- Product variant ids must come from product admin APIs.

## 10. Future Extension

Future Sprint:

- Recipe versioning/audit.
- Order completion stock deduction using recipe ingredients.
