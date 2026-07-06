# MinIO Integration Gap Report

## Scope

Report này audit hiện trạng backend/frontend để chuẩn bị tích hợp MinIO. Chưa implement code trong bước này.

Các khu vực đã kiểm tra:

- Backend Java modules: `product`, `ingredient`, `store`.
- Backend DTO/entity/mapper/controller/service liên quan ảnh.
- Flyway migrations và API contract hiện có.
- Frontend service/type đang gửi hoặc nhận `imageUrl`.

## Current Findings

### Storage module

Chưa có module Storage.

Không tìm thấy package/controller/service/config nào cho:

- `storage`
- `MinIO` / `Minio`
- `S3`
- `MultipartFile`
- upload/media endpoint

`code/backend/pom.xml` cũng chưa có dependency MinIO hoặc AWS S3 SDK.

### Product image storage

Product hiện chỉ lưu URL dạng text trong database:

- Entity: `ProductEntity.imageUrl`
- DB column: `products.image_url VARCHAR(255)`
- Request DTO: `ProductCreateRequest.imageUrl`, `ProductUpdateRequest.imageUrl`
- Response DTO: `ProductResponse.imageUrl`
- Service: `ProductServiceImpl` trim `request.getImageUrl()` rồi lưu trực tiếp vào entity.

Nguồn ảnh hiện tại có thể là external URL. Seed data đang insert URL vào `products.image_url`.

### Ingredient image storage

Ingredient hiện chưa lưu image.

Không có:

- `IngredientEntity.imageUrl`
- `ingredients.image_url`
- `IngredientCreateRequest.imageUrl`
- `IngredientUpdateRequest.imageUrl`
- `IngredientResponse.imageUrl`

Frontend `Ingredient` và `IngredientRequest` trong `ingredient.service.ts` cũng chưa có field ảnh.

### Store logo storage

Store hiện chưa lưu logo.

Không có:

- `StoreEntity.logoUrl`
- `stores.logo_url`
- `StoreCreateRequest.logoUrl`
- `StoreUpdateRequest.logoUrl`
- `StoreResponse.logoUrl`

Frontend `Store` type và `StoreRequest` cũng chưa có `logoUrl`.

Hiện logo brand trong UI là static asset dưới `public/logo/*.svg`, không phải logo per-store từ backend.

### Upload API

Chưa có API upload hiện hữu.

Các controller hiện chỉ nhận JSON:

- `AdminProductController#create/update`: `@RequestBody ProductCreateRequest/ProductUpdateRequest`
- `IngredientController#create/update`: `@RequestBody IngredientCreateRequest/IngredientUpdateRequest`
- `StoreController#create/update`: `@RequestBody StoreCreateRequest/StoreUpdateRequest`

Không có endpoint nhận `multipart/form-data`, `MultipartFile`, hoặc trả metadata/object key.

## 1. Các entity cần dùng MinIO

### Bắt buộc nếu mục tiêu là quản lý ảnh media qua backend

| Entity | Hiện trạng | Nhu cầu MinIO | Ghi chú |
|---|---|---|---|
| `ProductEntity` | Có `imageUrl` | Cần lưu URL public hoặc object key từ MinIO | Đang là entity duy nhất đã có cột ảnh. |
| `IngredientEntity` | Chưa có ảnh | Cần thêm `imageUrl` hoặc `imageObjectKey` nếu UI cần ảnh nguyên liệu | Cần migration và DTO update. |
| `StoreEntity` | Chưa có logo | Cần thêm `logoUrl` hoặc `logoObjectKey` nếu mỗi chi nhánh có logo riêng | Khác với brand logo static hiện tại. |

### Có thể cần sau này

| Entity | Nhu cầu tiềm năng | Ghi chú |
|---|---|---|
| `UserEntity` / employee profile | Avatar | Không nằm trong request hiện tại, chỉ ghi nhận rủi ro mở rộng. |
| `CategoryEntity` | Category thumbnail/banner | Hiện chưa có field ảnh. |
| Promotion/campaign entity | Banner image | Promotion backend chưa hoàn chỉnh theo tài liệu hiện có. |

## 2. Những cột imageUrl hiện có

### Backend DB

| Table | Column | Migration | Status |
|---|---|---|---|
| `products` | `image_url VARCHAR(255)` | `V9__create_product_menu_tables.sql` | Đang dùng. |

### Backend entity/DTO

| File | Field |
|---|---|
| `ProductEntity.java` | `private String imageUrl;` mapped to `image_url` |
| `ProductCreateRequest.java` | `private String imageUrl;` |
| `ProductUpdateRequest.java` | `private String imageUrl;` |
| `ProductResponse.java` | `private String imageUrl;` |

### Không có cột/field ảnh

| Domain | Missing DB column | Missing DTO field |
|---|---|---|
| Ingredient | `ingredients.image_url` | `IngredientCreateRequest`, `IngredientUpdateRequest`, `IngredientResponse` |
| Store | `stores.logo_url` | `StoreCreateRequest`, `StoreUpdateRequest`, `StoreResponse` |

## 3. Những API cần sửa

### Product APIs

Hiện có:

- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/menu`
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`

Cần sửa/thiết kế:

- `POST /api/v1/admin/products`: quyết định vẫn nhận `imageUrl` sau upload riêng, hoặc nhận multipart chung với product payload.
- `PUT /api/v1/admin/products/{id}`: tương tự create.
- Public product/menu response: cần trả URL dùng được bởi browser. Nếu DB lưu object key, mapper/service phải convert sang public/presigned URL.
- Frontend admin products: hiện nhập URL thủ công và fallback Unsplash; cần chuyển sang upload file rồi gán URL/key trả về.

Khuyến nghị: không biến create/update product thành multipart ngay. Nên thêm upload API riêng, sau đó product create/update tiếp tục nhận `imageUrl` hoặc `imageObjectKey`. Cách này ít phá contract hiện tại.

### Ingredient APIs

Hiện có:

- `GET /api/v1/ingredients`
- `GET /api/v1/ingredients/{id}`
- `POST /api/v1/ingredients`
- `PUT /api/v1/ingredients/{id}`
- `DELETE /api/v1/ingredients/{id}`

Cần sửa nếu ingredient có ảnh:

- Thêm DB column `ingredients.image_url`.
- Thêm field vào `IngredientCreateRequest`, `IngredientUpdateRequest`, `IngredientResponse`.
- Update `IngredientServiceImpl` và `IngredientMapper`.
- Update frontend `Ingredient`, `IngredientRequest`, admin ingredient form/table nếu cần hiển thị ảnh.

### Store APIs

Hiện có:

- `GET /api/v1/stores`
- `GET /api/v1/stores/{id}`
- `POST /api/v1/stores`
- `PUT /api/v1/stores/{id}`
- `DELETE /api/v1/stores/{id}`

Cần sửa nếu store có logo:

- Thêm DB column `stores.logo_url`.
- Thêm field vào `StoreCreateRequest`, `StoreUpdateRequest`, `StoreResponse`.
- Update `StoreMapper` MapStruct mapping.
- Update frontend `Store`, `StoreRequest`, admin branch/store form/table nếu cần hiển thị logo.

### New upload APIs

Nên thêm endpoint upload riêng, ví dụ:

- `POST /api/v1/storage/uploads`
- `POST /api/v1/storage/products/images`
- `POST /api/v1/storage/ingredients/images`
- `POST /api/v1/storage/stores/logos`

Request:

- `multipart/form-data`
- field file: `file`
- optional domain metadata: `module`, `entityId`, `purpose`

Response gợi ý:

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "bucket": "lowlands",
    "objectKey": "products/2026/07/uuid.jpg",
    "url": "https://...",
    "contentType": "image/jpeg",
    "size": 123456
  }
}
```

## 4. Những module cần tích hợp

### Backend modules

| Module | Việc cần làm |
|---|---|
| `storage` mới | MinIO client config, upload service, object key generation, validation, delete/replace policy. |
| `product` | Dùng upload result cho `imageUrl`; convert object key sang URL nếu chọn lưu key. |
| `ingredient` | Thêm image support nếu business cần ảnh nguyên liệu. |
| `store` | Thêm logo support nếu business cần logo theo chi nhánh. |
| `security` | Phân quyền upload/delete file; chỉ admin/manager phù hợp được upload. |
| `common.exception` | Chuẩn hóa lỗi file invalid, file too large, storage unavailable. |
| `config` | MinIO properties: endpoint, access key, secret key, bucket, public base URL, max file size. |

### Frontend modules

| Module | Việc cần làm |
|---|---|
| `product.service.ts` | Thêm upload service hoặc gọi `storage.service.ts`; giữ `imageUrl` trong product payload. |
| Admin products page | Thay nhập URL thủ công bằng file picker/upload; vẫn cho paste URL nếu muốn backward-compatible. |
| `ingredient.service.ts` | Thêm `imageUrl` vào types/request nếu backend thêm cột. |
| Admin ingredients page | Thêm upload/preview nếu bật ảnh nguyên liệu. |
| `store.service.ts` | Thêm `logoUrl` vào request/response nếu backend thêm cột. |
| Admin branches/stores page | Thêm upload/preview logo nếu bật logo store. |

## 5. Thiết kế Storage module

### Package đề xuất

```text
com.lowlands.coffee.modules.storage
  config
    StorageProperties
    MinioConfig
  controller
    StorageController
  dto
    StorageUploadResponse
  service
    StorageService
  service.impl
    MinioStorageService
```

### Properties đề xuất

```properties
storage.provider=minio
storage.minio.endpoint=http://localhost:9000
storage.minio.access-key=...
storage.minio.secret-key=...
storage.minio.bucket=lowlands-coffee
storage.public-base-url=http://localhost:9000/lowlands-coffee
storage.max-file-size=5242880
storage.allowed-content-types=image/jpeg,image/png,image/webp,image/svg+xml
```

### Service contract đề xuất

```text
StorageUploadResponse upload(MultipartFile file, String folder)
void delete(String objectKey)
String resolveUrl(String objectKey)
```

### Object key policy

Nên dùng object key ổn định theo domain:

```text
products/{yyyy}/{MM}/{uuid}.{ext}
ingredients/{yyyy}/{MM}/{uuid}.{ext}
stores/{yyyy}/{MM}/{uuid}.{ext}
```

Không nên dùng tên file gốc làm object key chính vì rủi ro trùng tên, ký tự lạ, và lộ thông tin người upload.

### DB storage strategy

Có 2 hướng:

1. Lưu public URL vào `image_url` / `logo_url`.
   - Ít thay đổi code nhất.
   - Rủi ro nếu đổi CDN/domain/bucket, phải migrate dữ liệu URL.

2. Lưu object key vào DB, response mapper resolve thành URL.
   - Bền hơn khi đổi endpoint/CDN.
   - Cần đổi naming hoặc thêm field rõ nghĩa như `image_object_key`.

Khuyến nghị: nếu muốn ít phá vỡ frontend hiện tại, giai đoạn đầu có thể tiếp tục trả `imageUrl`, nhưng backend nên cân nhắc lưu object key nội bộ và map ra URL ở response.

### Permission policy

Gợi ý:

| Endpoint | Permission |
|---|---|
| Upload product image | `PRODUCT_UPDATE` hoặc `PRODUCT_CREATE` |
| Upload ingredient image | `INGREDIENT_UPDATE` hoặc `INGREDIENT_CREATE` |
| Upload store logo | `STORE_UPDATE` hoặc `STORE_CREATE` |
| Delete object | quyền update/delete tương ứng hoặc admin-only |

### Validation policy

Storage service nên validate:

- Content type allowlist.
- File extension phù hợp content type.
- Max size.
- Empty file.
- Optional image dimension nếu cần.
- Không tin client-provided filename.

## 6. Rủi ro khi migrate

### Data migration

- `products.image_url` đang có external URLs từ seed/demo. Nếu chuyển sang MinIO-only, cần quyết định có migrate/download các ảnh cũ vào MinIO hay vẫn chấp nhận external URLs.
- `VARCHAR(255)` có thể không đủ nếu lưu presigned URL dài. Nếu lưu URL đầy đủ, nên cân nhắc tăng column length hoặc dùng `TEXT`.
- Nếu lưu object key, `VARCHAR(255)` thường đủ nhưng cần thống nhất mapper trả URL cho client.

### Backward compatibility

- Frontend đang kỳ vọng `imageUrl` là URL browser render trực tiếp.
- Admin product form hiện cho nhập URL và tự fallback Unsplash. Khi thêm upload, cần tránh phá luồng create/update hiện tại.
- Public menu/POS/cart đang render `product.imageUrl`; URL private hoặc hết hạn presigned sẽ làm ảnh biến mất.

### Security

- Upload file có thể bị abuse nếu không giới hạn size/type.
- Nếu bucket public, cần tránh upload file nguy hiểm hoặc object key đoán được.
- Nếu dùng presigned URL, cần xử lý cache/expiry trên frontend.
- Không nên expose MinIO secret/access key ra frontend.

### Consistency

- Nếu upload file thành công nhưng create/update entity fail, sẽ có orphan object trong MinIO.
- Nếu update ảnh mới mà không xóa ảnh cũ, storage sẽ phình.
- Nếu xóa object ngay khi update nhưng DB transaction fail, entity có thể trỏ tới ảnh đã mất.

Gợi ý giảm rủi ro:

- Upload trước, entity update sau; có job cleanup orphan theo prefix/date.
- Khi replace image, lưu ảnh mới trước, commit DB, rồi async delete ảnh cũ.
- Không hard-delete object ngay trong cùng transaction DB nếu storage không transactional.

### Environment/deployment

- Cần cấu hình MinIO local/dev/prod khác nhau.
- Cần bucket bootstrap hoặc startup check.
- Cần CORS nếu frontend upload trực tiếp lên MinIO bằng presigned URL.
- Cần backup/lifecycle policy cho bucket media.

## Implementation Order Recommendation

1. Thêm Storage module backend với MinIO client, properties, upload endpoint, validation.
2. Tích hợp Product trước vì đã có `image_url` và frontend đã dùng `imageUrl`.
3. Sau khi Product ổn, thêm migration cho Ingredient `image_url` nếu business cần.
4. Thêm migration cho Store `logo_url` nếu thật sự cần logo theo chi nhánh.
5. Chỉ sau khi API upload ổn mới update frontend forms để upload file thay vì paste URL.

