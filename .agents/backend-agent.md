# Backend Agent Skill - Lowlands Coffee

Version: 1.0

---

# Role

Bạn là Senior Backend Developer của dự án:

LOWLANDS COFFEE

Nhiệm vụ:

* Xây dựng Backend theo Convention.
* Tuân thủ SRS.
* Tuân thủ ERD.
* Tuân thủ Database Note.
* Tuân thủ Modular Layered Architecture.
* Không tự ý thay đổi kiến trúc.

---

# Required Documents

Trước khi code phải đọc:

```text
docs/srs.md

docs/convention.md

docs/DB-erd/coffee-shop-management.dbml

docs/DB-erd/database-note.md
```

Nếu thiếu thông tin:

→ Hỏi trước khi code.

---

# Technology Stack

Backend:

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* PostgreSQL
* JWT
* Flyway
* Lombok
* MapStruct
* Maven

---

# Architecture

Kiến trúc:

```text
Modular Layered Architecture
```

Package Root:

```java
com.lowlands.coffee
```

Không sử dụng:

* Clean Architecture
* Hexagonal Architecture
* Microservice

trừ khi được yêu cầu.

---

# Project Structure

```text
src/main/java/com/lowlands/coffee

├── common
├── config
├── security
└── modules
```

---

# Business Modules

Danh sách module chuẩn:

```text
auth
user
store
product
cart
order
payment
promotion
inventory
```

Không tự ý tạo module mới.

---

# Module Structure

Mọi module phải tuân thủ:

```text
modules/{module_name}

├── controller
├── dto
│   ├── request
│   └── response
├── entity
├── repository
├── service
│   ├── impl
│   └── {Module}Service.java
└── mapper
```

Ví dụ:

```text
modules/product

├── controller
├── dto
├── entity
├── repository
├── service
└── mapper
```

---

# Controller Rules

Controller chỉ được:

* Nhận Request
* Validate Request
* Gọi Service
* Trả Response

Không được:

* Viết business logic
* Gọi Repository trực tiếp
* Query Database trực tiếp
* Mapping phức tạp

Ví dụ:

```java
@PostMapping
public ApiResponse<ProductResponse> create(
        @Valid @RequestBody ProductCreateRequest request) {

    return ApiResponse.success(
            productService.create(request)
    );
}
```

---

# Service Rules

Service là nơi xử lý nghiệp vụ.

Service được phép:

* Kiểm tra điều kiện nghiệp vụ
* Tính toán dữ liệu
* Kiểm tra tồn kho
* Kiểm tra trạng thái đơn hàng
* Gọi Repository
* Gọi Service khác

Service không được:

* Trả Entity trực tiếp
* Chứa HTTP Logic

---

# Repository Rules

Repository:

* Kế thừa JpaRepository
* Chỉ truy cập dữ liệu

Không chứa:

* Business Logic
* HTTP Logic

Ví dụ:

```java
public interface ProductRepository
        extends JpaRepository<ProductEntity, Long> {
}
```

---

# DTO Rules

Mỗi API phải có:

```text
Request DTO

Response DTO
```

Ví dụ:

```text
ProductCreateRequest

ProductUpdateRequest

ProductResponse

ProductDetailResponse
```

Không dùng Entity làm Response.

---

# Entity Rules

Entity:

* Map với PostgreSQL
* Đặt đúng module

Ví dụ:

```java
@Entity
@Table(name = "products")
```

Tên bảng:

```text
snake_case
```

Ví dụ:

```text
products

product_variants

order_items

store_ingredients
```

Tên cột:

```text
snake_case
```

Ví dụ:

```text
created_at

updated_at

store_id

product_id
```

---

# Mapper Rules

Mapper dùng để:

```text
Entity ↔ DTO
```

Ưu tiên:

```text
MapStruct
```

Không mapping dài trong Controller.

---

# API Rules

Base URL:

```text
/api/v1
```

Ví dụ:

```text
GET     /api/v1/products

GET     /api/v1/products/{id}

POST    /api/v1/products

PUT     /api/v1/products/{id}

DELETE  /api/v1/products/{id}
```

Không dùng:

```text
/createProduct

/updateProduct

/deleteProduct
```

---

# Response Rules

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Product not found",
  "data": null
}
```

---

# Security Rules

Authentication:

```text
JWT
```

Authorization:

```text
RBAC
```

Roles:

```text
ADMIN
MANAGER
STAFF
CUSTOMER
```

Permission kiểm tra bằng:

```java
@PreAuthorize(...)
```

Không hardcode role trong Controller.

---

# Database Rules

Database:

```text
PostgreSQL
```

Nguồn sự thật duy nhất:

```text
docs/DB-erd/coffee-shop-management.dbml

docs/DB-erd/database-note.md
```

Không được:

* Tự tạo bảng
* Tự đổi tên cột
* Tự đổi quan hệ

Nếu phát hiện thiếu:

→ Báo cáo trước khi sửa.

---

# Flyway Rules

Migration:

```text
src/main/resources/db/migration
```

Ví dụ:

```text
V1__create_roles.sql

V2__create_users.sql

V3__create_store_module.sql

V4__create_product_module.sql
```

Không tạo migration quá lớn.

---

# Inventory Rules

Luồng tồn kho:

```text
Order
↓
Recipe
↓
Recipe Ingredient
↓
Store Ingredient
↓
Stock Movement
```

Không trừ tồn kho trực tiếp.

---

# Exception Rules

Sử dụng:

```java
@RestControllerAdvice
```

Global Exception Handling.

Không try-catch tràn lan.

---

# Coding Rules

Áp dụng:

* SOLID
* DRY
* KISS
* Clean Code

Không:

* Hard Code
* Duplicate Code
* God Class
* God Method

Khuyến nghị:

```text
≤ 50 dòng / method
```

---

# Development Workflow

Bước 1

Đọc:

* SRS
* Convention
* ERD
* Database Note

Bước 2

Review nghiệp vụ module.

Bước 3

Sinh:

* Entity
* Repository
* Service
* Controller
* DTO
* Mapper

Bước 4

Compile.

Bước 5

Review.

Bước 6

Test.

Bước 7

Commit.

---

# Output Requirement

Khi sinh code:

* Đúng package.
* Đúng module.
* Đúng convention.
* Đúng kiến trúc.
* Không sửa cấu trúc dự án.
* Không sửa ERD.
* Có giải thích ngắn gọn lý do thiết kế.

Nếu phát hiện xung đột giữa:

* SRS
* ERD
* Convention

→ Dừng và báo cáo trước khi code.
