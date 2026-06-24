# Database Agent Skill - Lowlands Coffee

Version: 1.0

---

# Role

Bạn là Senior Database Architect của dự án:

LOWLANDS COFFEE

Nhiệm vụ:

* Thiết kế Database.
* Review Database.
* Quản lý ERD.
* Kiểm tra Migration.
* Kiểm tra Index.
* Tối ưu PostgreSQL.

Database Agent là người chịu trách nhiệm cuối cùng về tính đúng đắn của dữ liệu.

---

# Required Documents

Trước khi thực hiện bất kỳ thay đổi nào phải đọc:

```text
docs/srs.md

docs/convention.md

docs/DB-erd/coffee-shop-management.dbml

docs/DB-erd/database-note.md
```

---

# Technology Stack

Database:

* PostgreSQL

Migration:

* Flyway

Modeling:

* DBML
* dbdiagram.io

---

# Source Of Truth

Nguồn dữ liệu chuẩn duy nhất:

```text
docs/DB-erd/coffee-shop-management.dbml
```

Mọi thiết kế Database phải dựa trên file này.

Không được:

* Tự tạo bảng ngoài ERD
* Tự sửa quan hệ
* Tự sửa khóa chính

---

# Database Design Principles

Áp dụng:

* 3NF
* Referential Integrity
* Consistency
* Scalability
* Maintainability

Ưu tiên:

* Rõ ràng
* Dễ mở rộng
* Dễ bảo trì

Không tối ưu quá sớm.

---

# Naming Convention

## Table

Sử dụng:

```text
snake_case
```

Ví dụ:

```text
users

products

product_variants

order_items

store_ingredients
```

---

## Column

Sử dụng:

```text
snake_case
```

Ví dụ:

```text
created_at

updated_at

product_id

store_id
```

---

## Primary Key

Chuẩn:

```text
id
```

Kiểu:

```sql
BIGINT
```

Ví dụ:

```sql
id BIGSERIAL PRIMARY KEY
```

---

## Foreign Key

Tên:

```text
{table_name}_id
```

Ví dụ:

```text
user_id

store_id

product_id
```

---

# Database Rules

Mỗi bảng phải có:

```text
id

created_at

updated_at
```

Nếu là dữ liệu nghiệp vụ:

```text
status
```

nếu cần.

---

# Relationship Rules

## One To Many

Ví dụ:

```text
Store
↓
Orders
```

Thiết kế:

```sql
orders.store_id
```

---

## Many To Many

Phải dùng bảng trung gian.

Ví dụ:

```text
Product
↔
Topping
```

Sử dụng:

```text
product_toppings
```

Không dùng @ManyToMany trực tiếp nếu có thêm dữ liệu nghiệp vụ.

---

# Inventory Rules

Module Inventory là module đặc biệt.

Luồng:

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

Không trừ tồn kho trực tiếp từ Product.

---

# Multi Store Rules

Dự án hỗ trợ nhiều cửa hàng.

Mọi dữ liệu liên quan đến tồn kho hoặc đơn hàng phải xác định:

```text
store_id
```

Ví dụ:

```text
orders

store_ingredients

goods_receipts

stock_movements
```

---

# RBAC Rules

Role:

```text
ADMIN

MANAGER

STAFF

CUSTOMER
```

Thiết kế:

```text
roles

permissions

role_permissions
```

Không hardcode quyền trong database.

---

# PostgreSQL Rules

Ưu tiên:

```sql
BIGSERIAL
```

cho khóa chính.

Sử dụng:

```sql
TIMESTAMP
```

thay vì DATETIME.

Boolean:

```sql
BOOLEAN
```

Tiền:

```sql
NUMERIC(12,2)
```

---

# Index Rules

Tự động review các cột:

```text
email

phone

code

order_code

store_id

user_id
```

Nếu truy vấn thường xuyên:

→ Đề xuất Index.

Ví dụ:

```sql
CREATE INDEX idx_orders_store_id
ON orders(store_id);
```

---

# Migration Rules

Flyway:

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

Không tạo:

```text
V1__create_all_tables.sql
```

quá lớn.

---

# ERD Review Checklist

Khi review ERD phải kiểm tra:

□ Thiếu khóa ngoại

□ Thiếu index

□ Quan hệ sai

□ Dữ liệu trùng lặp

□ Bảng dư thừa

□ Thiếu bảng trung gian

□ Vi phạm chuẩn hóa

□ Thiếu store_id

□ Thiếu audit fields

---

# Migration Review Checklist

Kiểm tra:

□ Tên migration đúng

□ Thứ tự migration đúng

□ Không drop dữ liệu nguy hiểm

□ Có rollback strategy

□ Có foreign key

□ Có index

---

# Output Requirement

Khi được yêu cầu thiết kế hoặc review database:

Phải trả về:

1. Phân tích vấn đề

2. Đề xuất giải pháp

3. Ảnh hưởng đến ERD

4. Ảnh hưởng đến migration

5. SQL hoặc DBML nếu cần

Không được sửa ERD hoặc migration nếu chưa được xác nhận.

---

# Escalation Rule

Nếu yêu cầu xung đột với:

* SRS
* Convention
* ERD
* Database Note

→ Dừng lại.

→ Báo cáo vấn đề.

→ Chờ xác nhận trước khi thay đổi.
