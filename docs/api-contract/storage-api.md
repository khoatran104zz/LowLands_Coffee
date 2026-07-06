# Storage API Contract

## 1. Purpose

Provides backend-owned media upload endpoints. Storage is implemented as an independent module and must not place upload logic inside business controllers such as ProductController.

Phase 1 supports product images only. Ingredient images, store logos, avatars, CDN, presigned direct upload, and old image migration are out of scope.

## 2. Implemented APIs

| Method | URL | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/storage/products/images` | `ADMIN` role or `PRODUCT_CREATE` or `PRODUCT_UPDATE` | Upload a product image to MinIO and return object metadata. |

## 3. Upload Product Image

Endpoint:

```text
POST /api/v1/storage/products/images
```

Request:

- Content type: `multipart/form-data`
- Field: `file`

Allowed file types:

- `image/jpeg`
- `image/png`
- `image/webp`

Max size defaults to `5242880` bytes unless overridden by `STORAGE_MAX_FILE_SIZE`.

Response:

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "objectKey": "products/2026/07/uuid.webp",
    "url": "http://localhost:9000/lowlands/products/2026/07/uuid.webp",
    "contentType": "image/webp",
    "size": 123456
  }
}
```

## 4. Business Rules

- Storage module owns upload validation and MinIO integration.
- Product create/update APIs remain JSON APIs and continue accepting `imageUrl`.
- Frontend uploads image first, then sends returned `url` as `ProductCreateRequest.imageUrl` or `ProductUpdateRequest.imageUrl`.
- Object key must not use the original filename.
- Object key format is `products/yyyy/MM/uuid.ext`.
- MinIO access key and secret key must only be configured on the backend.

## 5. HTTP Status

- 200: upload successful.
- 400: empty file, file too large, unsupported content type, invalid folder.
- 401: missing/invalid token.
- 403: authenticated user does not have required role/permission.
- 502: MinIO/storage upload failure.
- 500: unexpected server error.

## 6. Future Extension

- Ingredient image upload.
- Store logo upload.
- Employee avatar upload.
- Object deletion/replacement lifecycle.
- Optional CDN or presigned direct upload.
