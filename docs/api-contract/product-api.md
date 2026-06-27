# Product API Contract

Phase: Sprint 2 Phase 3 - API Contract only.

This document defines the contract between Frontend and Backend before Product Module implementation. Do not create entity, repository, service, controller, or migration from this document until Phase 4 is approved.

## 1. Frontend Review

### Existing Product Pages

| Area | Route/File | Product Usage |
| --- | --- | --- |
| Customer Menu | `code/frontend/src/app/[locale]/(customer)/menu/page.tsx` | Loads products/categories, filters by category and search, renders product cards. |
| Product Detail | `code/frontend/src/app/[locale]/(customer)/menu/[id]/page.tsx` | Loads one product, selects variant, selects toppings, quantity, note, add to cart. |
| Admin Product Management | `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx` | Local CRUD for products, category filter, image, status, S/M/L prices. |
| Admin Category Management | `code/frontend/src/app/[locale]/(dashboard)/admin/categories/page.tsx` | Local CRUD for categories. |
| Staff POS | `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx` | Uses product/category store to sell active products. |
| Admin Dashboard | `code/frontend/src/app/[locale]/(dashboard)/admin/dashboard/page.tsx` | Best-selling product summary from order item snapshots. |
| Manager Dashboard | `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx` | Revenue by category inferred from product names in order snapshots. |

### Existing Product Components

| Component/File | Product Usage |
| --- | --- |
| `components/features/product/ProductCard.tsx` | Customer card: image, name, description, min variant price, link to detail. |
| `components/pos/ProductCard.tsx` | POS card: image, name, first variant price, variant/topping modal. |
| `components/pos/POSCart.tsx` | Uses cart items containing product, variant, toppings. |
| `components/tables/DataTable.tsx` | Generic table used by admin product/category pages. |
| `store/cart.store.ts` | Cart item shape uses `Product`, `ProductVariant`, `Topping`. |
| `store/dashboardStore.ts` | Local persisted products/categories and CRUD actions. |

### Existing Product Services

| File | Current Behavior |
| --- | --- |
| `services/product.service.ts` | Uses `INITIAL_PRODUCTS` and `INITIAL_CATEGORIES`; no backend call yet. |
| `lib/axios.ts` | Axios base URL from `NEXT_PUBLIC_API_URL`, unwrap is not automatic. |

### Frontend DTO Shape Expected Today

```ts
Category {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

Product {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
  toppings?: Topping[];
}

ProductVariant {
  id: number;
  productId: number;
  size: "S" | "M" | "L";
  price: number;
  status: string;
}

Topping {
  id: number;
  name: string;
  price: number;
  status: string;
}
```

## 2. ERD Fit Review

### ERD Covers

| Frontend Need | ERD Support | Note |
| --- | --- | --- |
| Product Name | `products.name` | Covered. |
| Description | `products.description` | Covered. |
| Image | `products.image_url` | Covered. |
| Price | `product_variants.price` | Covered as variant price, not product-level price. |
| Category | `categories`, `products.category_id` | Covered. |
| Status | `products.status`, `categories.status`, `product_variants.status`, `toppings.status` | Covered. |
| Variant | `product_variants` | Covered. |
| Topping | `toppings`, `product_toppings` | Covered. |

### ERD Missing Or Ambiguous

| Need | Gap | Recommendation |
| --- | --- | --- |
| Thumbnail | No `thumbnail_url`; only `image_url`. | Use `imageUrl` as thumbnail in Phase 4, or add `thumbnail_url` in a later DB phase if separate assets are required. |
| Display Order | No `display_order` on categories/products/variants/toppings. | Report as missing. Do not add migration in Phase 3. |
| Product slug | No slug for SEO-friendly `/menu/[slug]`. | Current frontend uses numeric id, so not blocking. |
| Category image/icon | No category image. | Not required by current UI. |
| Product-topping status/order | `product_toppings` only has ids. | Product detail can work. Admin assignment UI may need status/order later. |
| Created/updated timestamps for variants/toppings | Missing on `product_variants`, `toppings`, `product_toppings`. | Not blocking for current frontend. |

## 3. API Design Principles

- Base path: `/api/v1`.
- Response envelope follows existing backend: `ApiResponse<T>`.
- Public menu reads should return only `active` data and should not require login.
- Admin CRUD should require JWT and RBAC permissions.
- Backend should keep `status` values lowercase (`active`, `inactive`) to minimize frontend mapping.
- Product list response should include `variants` so frontend can compute min price without extra calls.
- Product detail response should include `toppings`.

## 4. Response Envelope

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

For validation errors, Phase 4 should standardize field errors. Minimum accepted contract:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "fieldErrors": {
      "name": "must not be blank"
    }
  }
}
```

## 5. Endpoints

### Public Menu

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/menu` | Public | Combined categories and products for menu bootstrapping. |
| GET | `/api/v1/categories` | Public | Active categories by default. |
| GET | `/api/v1/products` | Public | Active product list, filterable. |
| GET | `/api/v1/products/{id}` | Public | Active product detail with variants and toppings. |

### Admin Product Management

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/categories` | `CATEGORY_VIEW` | List all categories including inactive. |
| POST | `/api/v1/admin/categories` | `CATEGORY_CREATE` | Create category. |
| PUT | `/api/v1/admin/categories/{id}` | `CATEGORY_UPDATE` | Update category. |
| DELETE | `/api/v1/admin/categories/{id}` | `CATEGORY_DELETE` | Soft delete/deactivate category. |
| GET | `/api/v1/admin/products` | `PRODUCT_VIEW` | List all products including inactive. |
| POST | `/api/v1/admin/products` | `PRODUCT_CREATE` | Create product with variants and optional toppings. |
| PUT | `/api/v1/admin/products/{id}` | `PRODUCT_UPDATE` | Update product and replace variants/topping assignments. |
| DELETE | `/api/v1/admin/products/{id}` | `PRODUCT_DELETE` | Soft delete/deactivate product. |
| GET | `/api/v1/admin/toppings` | `TOPPING_VIEW` | List toppings. |
| POST | `/api/v1/admin/toppings` | `TOPPING_CREATE` | Create topping. |
| PUT | `/api/v1/admin/toppings/{id}` | `TOPPING_UPDATE` | Update topping. |
| DELETE | `/api/v1/admin/toppings/{id}` | `TOPPING_DELETE` | Soft delete/deactivate topping. |

## 6. Query Parameters

### GET `/api/v1/products`

| Param | Type | Required | Default | Note |
| --- | --- | --- | --- | --- |
| `categoryId` | number | No | null | Filter by category. |
| `search` | string | No | null | Match product name/description. |
| `minPrice` | number | No | null | Match min variant price. |
| `maxPrice` | number | No | null | Match min variant price. |
| `status` | string | No | `active` | Public endpoint should only allow `active`. |
| `page` | number | No | 0 | Optional for backend; frontend can start with unpaged. |
| `size` | number | No | 20 | Optional. |

## 7. Request DTOs

### CategoryCreateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | string | Yes | 1-100 chars, unique. |
| `description` | string | No | max 1000 chars. |
| `status` | string | No | `active` or `inactive`, default `active`. |
| `displayOrder` | number | No | Only if DB adds display order later. |

### CategoryUpdateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | string | Yes | 1-100 chars, unique except current id. |
| `description` | string | No | max 1000 chars. |
| `status` | string | Yes | `active` or `inactive`. |
| `displayOrder` | number | No | Only if DB adds display order later. |

### ProductVariantCreateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `size` | string | Yes | `S`, `M`, or `L`. |
| `price` | number | Yes | >= 0. |
| `status` | string | No | `active` or `inactive`, default `active`. |

### ProductVariantUpdateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | number | No | Existing variant id; absent means create new variant. |
| `size` | string | Yes | `S`, `M`, or `L`. |
| `price` | number | Yes | >= 0. |
| `status` | string | Yes | `active` or `inactive`. |

### ProductCreateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `categoryId` | number | Yes | Existing active/inactive category id. |
| `name` | string | Yes | 1-100 chars. |
| `description` | string | No | max 5000 chars. |
| `imageUrl` | string | No | max 255 chars, URL format if present. |
| `status` | string | No | `active` or `inactive`, default `active`. |
| `variants` | ProductVariantCreateRequest[] | Yes | At least 1; unique size per product. |
| `toppingIds` | number[] | No | Existing active topping ids. |
| `displayOrder` | number | No | Only if DB adds display order later. |

### ProductUpdateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `categoryId` | number | Yes | Existing category id. |
| `name` | string | Yes | 1-100 chars. |
| `description` | string | No | max 5000 chars. |
| `imageUrl` | string | No | max 255 chars, URL format if present. |
| `status` | string | Yes | `active` or `inactive`. |
| `variants` | ProductVariantUpdateRequest[] | Yes | At least 1; unique size per product. |
| `toppingIds` | number[] | No | Replace product topping assignments. |
| `displayOrder` | number | No | Only if DB adds display order later. |

### ToppingCreateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | string | Yes | 1-100 chars, unique. |
| `price` | number | Yes | >= 0. |
| `status` | string | No | `active` or `inactive`, default `active`. |

### ToppingUpdateRequest

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | string | Yes | 1-100 chars, unique except current id. |
| `price` | number | Yes | >= 0. |
| `status` | string | Yes | `active` or `inactive`. |

## 8. Response DTOs

### CategoryResponse

```json
{
  "id": 1,
  "name": "Coffee",
  "description": "Vietnamese phin coffee",
  "status": "active",
  "createdAt": "2026-06-27T09:00:00",
  "updatedAt": "2026-06-27T09:00:00"
}
```

### ProductVariantResponse

```json
{
  "id": 101,
  "productId": 1,
  "size": "S",
  "price": 29000,
  "status": "active"
}
```

### ToppingResponse

```json
{
  "id": 1,
  "name": "Coffee Jelly",
  "price": 6000,
  "status": "active"
}
```

### ProductResponse

```json
{
  "id": 1,
  "categoryId": 1,
  "name": "Phin Sua Da",
  "description": "Traditional Vietnamese phin coffee with condensed milk.",
  "imageUrl": "https://example.com/products/phin-sua-da.jpg",
  "status": "active",
  "createdAt": "2026-06-27T09:00:00",
  "updatedAt": "2026-06-27T09:00:00",
  "category": {
    "id": 1,
    "name": "Coffee",
    "description": "Vietnamese coffee drinks",
    "status": "active"
  },
  "variants": [
    {
      "id": 101,
      "productId": 1,
      "size": "S",
      "price": 29000,
      "status": "active"
    }
  ],
  "toppings": [
    {
      "id": 1,
      "name": "Coffee Jelly",
      "price": 6000,
      "status": "active"
    }
  ]
}
```

Note: `category` is additive. Current frontend can keep using `categoryId`.

### MenuResponse

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Coffee",
      "description": "Vietnamese coffee drinks",
      "status": "active"
    }
  ],
  "products": [
    {
      "id": 1,
      "categoryId": 1,
      "name": "Phin Sua Da",
      "description": "Traditional Vietnamese phin coffee with condensed milk.",
      "imageUrl": "https://example.com/products/phin-sua-da.jpg",
      "status": "active",
      "variants": [
        {
          "id": 101,
          "productId": 1,
          "size": "S",
          "price": 29000,
          "status": "active"
        }
      ],
      "toppings": []
    }
  ]
}
```

### ProductPageResponse

Use only if backend chooses pagination in Phase 4.

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 100,
  "totalPages": 5
}
```

## 9. Example Requests And Responses

### GET `/api/v1/products?categoryId=1&search=phin`

Response `200 OK`:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "name": "Phin Sua Da",
      "description": "Traditional Vietnamese phin coffee with condensed milk.",
      "imageUrl": "https://example.com/products/phin-sua-da.jpg",
      "status": "active",
      "variants": [
        {
          "id": 101,
          "productId": 1,
          "size": "S",
          "price": 29000,
          "status": "active"
        }
      ],
      "toppings": [
        {
          "id": 1,
          "name": "Coffee Jelly",
          "price": 6000,
          "status": "active"
        }
      ]
    }
  ]
}
```

### GET `/api/v1/products/1`

Response `200 OK`: `ApiResponse<ProductResponse>`.

### POST `/api/v1/admin/products`

Request:

```json
{
  "categoryId": 1,
  "name": "Phin Sua Da",
  "description": "Traditional Vietnamese phin coffee with condensed milk.",
  "imageUrl": "https://example.com/products/phin-sua-da.jpg",
  "status": "active",
  "variants": [
    {
      "size": "S",
      "price": 29000,
      "status": "active"
    },
    {
      "size": "M",
      "price": 35000,
      "status": "active"
    }
  ],
  "toppingIds": [1, 2]
}
```

Response `201 Created`:

```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "id": 1,
    "categoryId": 1,
    "name": "Phin Sua Da",
    "description": "Traditional Vietnamese phin coffee with condensed milk.",
    "imageUrl": "https://example.com/products/phin-sua-da.jpg",
    "status": "active",
    "variants": [
      {
        "id": 101,
        "productId": 1,
        "size": "S",
        "price": 29000,
        "status": "active"
      }
    ],
    "toppings": [
      {
        "id": 1,
        "name": "Coffee Jelly",
        "price": 6000,
        "status": "active"
      }
    ]
  }
}
```

### POST `/api/v1/admin/categories`

Request:

```json
{
  "name": "Coffee",
  "description": "Vietnamese coffee drinks",
  "status": "active"
}
```

Response `201 Created`: `ApiResponse<CategoryResponse>`.

## 10. Validation Rules

| Resource | Rule |
| --- | --- |
| Category | `name` required and unique. |
| Product | `categoryId` must exist. |
| Product | `name` required. |
| Product | `variants` must contain at least one active or inactive item. |
| Product Variant | `size` must be one of `S`, `M`, `L`. |
| Product Variant | Sizes must be unique per product. |
| Product Variant | `price` must be >= 0. |
| Topping | `name` required and unique. |
| Topping | `price` must be >= 0. |
| Product Toppings | Each id in `toppingIds` must exist. |
| Status | Use `active` or `inactive` for frontend compatibility. |

## 11. Permission Matrix

| API | Permission |
| --- | --- |
| `GET /api/v1/menu` | Public |
| `GET /api/v1/categories` | Public |
| `GET /api/v1/products` | Public |
| `GET /api/v1/products/{id}` | Public |
| `GET /api/v1/admin/categories` | `CATEGORY_VIEW` |
| `POST /api/v1/admin/categories` | `CATEGORY_CREATE` |
| `PUT /api/v1/admin/categories/{id}` | `CATEGORY_UPDATE` |
| `DELETE /api/v1/admin/categories/{id}` | `CATEGORY_DELETE` |
| `GET /api/v1/admin/products` | `PRODUCT_VIEW` |
| `POST /api/v1/admin/products` | `PRODUCT_CREATE` |
| `PUT /api/v1/admin/products/{id}` | `PRODUCT_UPDATE` |
| `DELETE /api/v1/admin/products/{id}` | `PRODUCT_DELETE` |
| `GET /api/v1/admin/toppings` | `TOPPING_VIEW` |
| `POST /api/v1/admin/toppings` | `TOPPING_CREATE` |
| `PUT /api/v1/admin/toppings/{id}` | `TOPPING_UPDATE` |
| `DELETE /api/v1/admin/toppings/{id}` | `TOPPING_DELETE` |

## 12. HTTP Status

| Scenario | Status |
| --- | --- |
| Read success | `200 OK` |
| Create success | `201 Created` |
| Update success | `200 OK` |
| Delete/deactivate success | `200 OK` or `204 No Content`; prefer `200 OK` with `ApiResponse<Void>` to match existing backend. |
| Validation failed | `400 Bad Request` |
| Missing/invalid JWT | `401 Unauthorized` |
| Insufficient permission | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Duplicate name | `409 Conflict` |
| Unexpected error | `500 Internal Server Error` |

## 13. Frontend Compatibility Review

### Frontend Can Stay Mostly The Same

The UI components can remain unchanged if backend returns `data` matching the current TypeScript shape.

### Frontend Files That Need Phase Coding Changes

| File | Required Change |
| --- | --- |
| `code/frontend/src/services/product.service.ts` | Replace mock reads with Axios calls and unwrap `ApiResponse.data`. |
| `code/frontend/src/store/dashboardStore.ts` | Replace local-only product/category CRUD with API-backed actions, or add hydration from admin APIs. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx` | Only needed if CRUD is moved out of store actions. Prefer not editing UI. |
| `code/frontend/src/app/[locale]/(dashboard)/admin/categories/page.tsx` | Only needed if CRUD is moved out of store actions. Prefer not editing UI. |
| `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx` | Should hydrate products/categories from backend via store or service for real POS data. |

### Backend-Side Choices To Reduce Frontend Work

- Return lowercase status strings: `active`, `inactive`.
- Keep `categoryId` in `ProductResponse`.
- Include `variants` on product list and detail.
- Include `toppings` on product detail and product list for POS.
- Keep numeric ids.
- Keep `imageUrl` rather than `image_url` in JSON.

## 14. Phase Coding Task List

Do not start these until Phase 4 is approved.

1. Add product/category/topping migrations if Product Module tables do not exist in database yet.
2. Add product permissions seed migration.
3. Implement Category entity/repository/service/controller.
4. Implement Product entity/repository/service/controller.
5. Implement ProductVariant entity/repository/service mapping.
6. Implement Topping entity/repository/service/controller.
7. Implement Product-Topping assignment handling.
8. Add public security matchers for `/api/v1/menu`, `/api/v1/categories`, `/api/v1/products`.
9. Add admin endpoints under `/api/v1/admin/*` with permission annotations.
10. Add validation and duplicate-name handling.
11. Add tests for public menu/product reads and admin CRUD.
12. Update frontend service/store only after API contract approval.
