# MinIO Storage Implementation Report

## Backend files added/changed

- `code/backend/pom.xml`
  - Added MinIO Java SDK dependency.
- `code/backend/src/main/resources/application.properties`
  - Added `storage.*` configuration for MinIO provider, endpoint, credentials, bucket, public base URL, max file size, and allowed image content types.
- `code/backend/src/test/resources/application.properties`
  - Added dummy MinIO test properties so Spring context tests can start without real secrets.
- `code/backend/src/main/java/com/lowlands/coffee/common/exception/GlobalExceptionHandler.java`
  - Added `StorageException` handling.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/config/StorageProperties.java`
  - Added storage configuration binding.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/config/MinioConfig.java`
  - Added MinIO client bean and required configuration validation.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/controller/StorageController.java`
  - Added product image upload endpoint.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/dto/StorageUploadResponse.java`
  - Added upload response DTO.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/exception/StorageException.java`
  - Added storage-specific runtime exception.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/service/StorageService.java`
  - Added storage service contract.
- `code/backend/src/main/java/com/lowlands/coffee/modules/storage/service/impl/MinioStorageService.java`
  - Added MinIO upload implementation, file validation, bucket existence check/create, UUID object key generation, and public URL generation.

## Frontend files added/changed

- `code/frontend/src/services/storage.service.ts`
  - Added `uploadProductImage(file: File)` using `axiosInstance` and multipart form data.
- `code/frontend/src/app/[locale]/(dashboard)/admin/products/page.tsx`
  - Added product image file input.
  - Added local preview before upload.
  - Uploads image first, then stores returned URL in `imageUrl`.
  - Keeps manual URL input for backward compatibility.
  - Blocks submit while upload is running.
  - Blocks submit when image URL is empty.
  - Removed Unsplash fallback as submitted product image source.
- `code/frontend/src/locales/en/admin.json`
  - Added product image upload messages.
- `code/frontend/src/locales/vi/admin.json`
  - Added product image upload messages.

## Env variables

Expected variables:

```properties
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=lowlands
MINIO_PUBLIC_BASE_URL=http://localhost:9000/lowlands
```

Notes:

- `.env.example` contains the MinIO variables.
- `.env` was not committed or copied into docs.
- MinIO secrets are consumed only by backend configuration and are not exposed to frontend.

## Upload API

Endpoint:

```http
POST /api/v1/storage/products/images
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Request field:

```text
file
```

Response:

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "objectKey": "products/2026/07/fc7c150c-3f0b-467b-b4a8-fcc80e03ccca.png",
    "url": "http://localhost:9000/lowlands/products/2026/07/fc7c150c-3f0b-467b-b4a8-fcc80e03ccca.png",
    "contentType": "image/png",
    "size": 68
  }
}
```

Authorization rule:

- `ADMIN`, or
- `PRODUCT_CREATE`, or
- `PRODUCT_UPDATE`.

Validation:

- Rejects empty file.
- Rejects files larger than `storage.max-file-size`.
- Allows only `image/jpeg`, `image/png`, `image/webp`.
- Does not trust the original filename.
- Uses UUID object keys under `products/yyyy/MM/`.
- Checks bucket existence and creates the bucket if missing.

## Product integration flow

Current product create/update APIs remain JSON-based:

- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`

Flow:

1. Admin selects product image in the product form.
2. Frontend shows local preview.
3. Frontend uploads the file to `POST /api/v1/storage/products/images`.
4. Backend uploads the object to MinIO and returns `url`.
5. Frontend sets `imageUrl` in the product form.
6. Product create/update sends JSON with `imageUrl`.
7. Backend stores the URL in `products.image_url`.

No migration was added for old product images.

## Test result

Backend:

- `mvn -q -DskipTests compile`: passed.
- `mvn -q clean install`: passed after adding dummy storage properties for test context.
- `GET http://127.0.0.1:8080/api-docs`: returned `200`.
- `POST /api/v1/storage/products/images` without token: returned `401`.
- Admin authenticated upload to `POST /api/v1/storage/products/images`: passed.
- Product create with returned MinIO URL: passed.
- Product delete after manual test: passed. The created product row was soft-deleted by existing product behavior.

Frontend:

- `npm.cmd run type-check`: passed.
- `npm.cmd run dev`: an existing Next dev server was already running on port `3000`, so a second dev command exited with "another next dev server is already running".
- `GET http://127.0.0.1:3000/vi/admin/products`: returned `200` from the existing dev server.

Manual MinIO result:

- MinIO port `9000` was reachable.
- Upload returned object key:
  - `products/2026/07/fc7c150c-3f0b-467b-b4a8-fcc80e03ccca.png`
- Product create used the returned URL:
  - `http://localhost:9000/lowlands/products/2026/07/fc7c150c-3f0b-467b-b4a8-fcc80e03ccca.png`

## Remaining issues

- Direct browser image rendering depends on MinIO bucket/public policy matching `MINIO_PUBLIC_BASE_URL`. Upload works, but public read access must be configured outside the app if MinIO is private.
- A test object remains in the MinIO `lowlands` bucket from the manual upload test.
- The manual product row created during verification was deleted through the existing API, which appears to be soft-delete behavior.
- Ingredient image, Store logo, Avatar, CDN, presigned direct upload, and old image migration were intentionally not implemented in this phase.

## Next step

- Extend the same Storage module to Ingredient image or Store logo when those domains add explicit image/logo fields and API contracts.
