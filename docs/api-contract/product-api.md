# Product API Contract

## 1. Purpose

Provides customer-facing menu/catalog APIs and admin product catalog management for categories, products, variants, toppings, and allowed product toppings.

## 2. Current Frontend Usage

- Pages: customer menu `src/app/[locale]/(customer)/menu/page.tsx`, product detail `menu/[id]/page.tsx`, POS `staff/pos/page.tsx`, admin products and categories pages.
- Store/service: `src/services/product.service.ts`, `src/store/dashboardStore.ts`, `src/store/cart.store.ts`.
- Flow: public menu pages call `/products`, `/products/{id}`, `/categories`; admin dashboard store calls `/admin/products`, `/admin/categories`, `/admin/toppings` for CRUD.

## 3. Existing Backend APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/menu` | PUBLIC | Return active categories and active products. |
| GET | `/api/v1/products?categoryId=&search=&minPrice=&maxPrice=` | PUBLIC | List active products with optional filters. |
| GET | `/api/v1/products/{id}` | PUBLIC | Get active product by id. |
| GET | `/api/v1/categories` | PUBLIC | List active categories. |
| GET | `/api/v1/admin/products` | ADMIN + `PRODUCT_VIEW` | List all products. |
| POST | `/api/v1/admin/products` | ADMIN + `PRODUCT_CREATE` | Create product with variants and optional toppings. |
| PUT | `/api/v1/admin/products/{id}` | ADMIN + `PRODUCT_UPDATE` | Update product, variants, and toppings. |
| DELETE | `/api/v1/admin/products/{id}` | ADMIN + `PRODUCT_DELETE` | Soft-delete product by setting `inactive`. |
| GET | `/api/v1/admin/categories` | ADMIN + `CATEGORY_VIEW` | List all categories. |
| POST | `/api/v1/admin/categories` | ADMIN + `CATEGORY_CREATE` | Create category. |
| PUT | `/api/v1/admin/categories/{id}` | ADMIN + `CATEGORY_UPDATE` | Update category. |
| DELETE | `/api/v1/admin/categories/{id}` | ADMIN + `CATEGORY_DELETE` | Soft-delete category. |
| GET | `/api/v1/admin/toppings` | ADMIN + `TOPPING_VIEW` | List all toppings. |
| POST | `/api/v1/admin/toppings` | ADMIN + `TOPPING_CREATE` | Create topping. |
| PUT | `/api/v1/admin/toppings/{id}` | ADMIN + `TOPPING_UPDATE` | Update topping. |
| DELETE | `/api/v1/admin/toppings/{id}` | ADMIN + `TOPPING_DELETE` | Soft-delete topping. |

## 4. Request DTO

| DTO | Field | Validation |
|---|---|---|
| `CategoryCreateRequest` | `name` | required, max 100 |
|  | `description` | max 1000 |
|  | `status` | `active` or `inactive`, optional; defaults to `active` |
| `CategoryUpdateRequest` | `name`, `status` | required; status `active` or `inactive` |
| `ToppingCreateRequest` | `name` | required, max 100 |
|  | `price` | required, decimal > 0 |
|  | `status` | `active` or `inactive`, optional |
| `ProductCreateRequest` | `categoryId` | required |
|  | `name` | required, max 100 |
|  | `description` | max 5000 |
|  | `imageUrl` | max 255 |
|  | `status` | `active` or `inactive`, optional |
|  | `variants` | required non-empty list |
|  | `toppingIds` | optional list of topping ids |
| `ProductVariantCreateRequest` | `size` | required, `S`, `M`, or `L` |
|  | `price` | required, decimal >= 0 |
|  | `status` | `active` or `inactive`, optional |
| `ProductUpdateRequest` | same as create | `status` required; variants use `ProductVariantUpdateRequest` with optional `id` |

Example product create:

```json
{
  "categoryId": 1,
  "name": "Phin Sua Da",
  "description": "Vietnamese coffee",
  "imageUrl": "https://example.com/phin.jpg",
  "status": "active",
  "variants": [
    { "size": "M", "price": 35000, "status": "active" }
  ],
  "toppingIds": [1, 2]
}
```

## 5. Response DTO

`ProductResponse` fields: `id`, `categoryId`, `name`, `description`, `imageUrl`, `status`, `createdAt`, `updatedAt`, `category`, `variants`, `toppings`.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "categoryId": 1,
    "name": "Phin Sua Da",
    "status": "active",
    "category": { "id": 1, "name": "Coffee", "status": "active" },
    "variants": [{ "id": 1, "productId": 1, "size": "M", "price": 35000, "status": "active" }],
    "toppings": [{ "id": 1, "name": "Coffee Jelly", "price": 6000, "status": "active" }]
  }
}
```

`MenuResponse` is `{ "categories": CategoryResponse[], "products": ProductResponse[] }`.

## 6. Business Validation

- Public APIs only return active categories/products and active product detail.
- Category name is unique case-insensitively.
- Topping name is unique case-insensitively.
- Product category must exist.
- Active product cannot be assigned to inactive category.
- Product must contain at least one variant.
- Variant size must be unique per product.
- Product update preserves existing variant ids when request variants include `id`; omitted existing variants are set `inactive`.
- Topping ids must all exist.
- Active product cannot be assigned inactive toppings.
- Delete operations are soft deletes by setting `status = inactive`.
- Product names are not globally unique. Duplicate-name prevention, if needed later, should only be scoped within a category.

## 7. Permission Matrix

| Endpoint Group | ADMIN | MANAGER | STAFF | CUSTOMER | PUBLIC |
|---|---:|---:|---:|---:|---:|
| Public `/menu`, `/products`, `/categories` | Y | Y | Y | Y | Y |
| `/admin/products/**` | Y | N | N | N | N |
| `/admin/categories/**` | Y | N | N | N | N |
| `/admin/toppings/**` | Y | N | N | N | N |

## 8. HTTP Status

- 200: successful reads, updates, deletes.
- 201: admin create product/category/topping.
- 400: validation error, duplicate variant size.
- 401: missing/invalid token on admin APIs.
- 403: non-admin or missing authority on admin APIs.
- 404: product/category/topping not found.
- 409: duplicate category or topping name.
- 500: unexpected exception.

## 9. Frontend Integration Notes

- `product.service.ts` matches implemented public/admin product APIs.
- `dashboardStore.ts` still has merge-conflict markers and should be resolved.
- Admin products currently pass `includeToppings=false` on create, so selected toppings may not be sent unless that UI path is updated.
- Customer menu explicitly does not fallback to mock products, which matches the mock policy.

## 10. Future Extension

Future Sprint:

- Product image upload/media API.
- Product availability by store.
- Bulk category/product import.
