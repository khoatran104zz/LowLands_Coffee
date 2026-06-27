# Database Design Notes

## 1. Tổng quan

Database được thiết kế cho hệ thống Coffee Shop Management System tương tự Highlands Coffee.

### Mục tiêu

- Quản lý người dùng và phân quyền.
- Quản lý nhiều chi nhánh.
- Quản lý sản phẩm và menu.
- Quản lý giỏ hàng.
- Quản lý đơn hàng.
- Quản lý thanh toán.
- Quản lý khuyến mãi.
- Quản lý nguyên liệu.
- Quản lý tồn kho.
- Quản lý công thức pha chế.

Database được thiết kế theo hướng:

- Chuẩn hóa dữ liệu (3NF).
- Tách biệt theo module nghiệp vụ.
- Dễ mở rộng thành Multi-Store.
- Dễ chuyển sang Microservice trong tương lai.

---

# 2. Module Authentication & Authorization

## roles

Lưu danh sách vai trò trong hệ thống.

### Ví dụ

- ADMIN
- MANAGER
- STAFF
- CUSTOMER

---

## permissions

Lưu các quyền nghiệp vụ.

### Ví dụ

- PRODUCT_CREATE
- PRODUCT_UPDATE
- ORDER_VIEW
- INVENTORY_UPDATE
- REPORT_VIEW

---

## role_permissions

Liên kết giữa Role và Permission.

### Quan hệ

```text
Role N-N Permission
```

Ví dụ:

```text
ADMIN
├── PRODUCT_CREATE
├── PRODUCT_UPDATE
├── USER_CREATE
├── REPORT_VIEW

MANAGER
├── ORDER_VIEW
├── INVENTORY_VIEW
├── REPORT_VIEW
```

---

## users

Lưu thông tin tài khoản hệ thống.

### Thông tin

- Họ tên
- Email
- Số điện thoại
- Mật khẩu
- Trạng thái

### Quan hệ

```text
User N-1 Role
```

---

# 3. Module Store Management

## stores

Lưu danh sách cửa hàng.

### Ví dụ

- Highlands Cầu Giấy
- Highlands Times City
- Highlands Hồ Gươm

---

## store_users

Liên kết nhân viên với cửa hàng.

Canonical table name after Sprint 2 Phase 2: `store_users`.

### Ví dụ

```text
User A → MANAGER → Store 1

User B → CASHIER → Store 1

User C → BARISTA → Store 2
```

### Quan hệ

```text
Store 1-N StoreUser

User 1-N StoreUser
```

### Vai trò

- MANAGER
- CASHIER
- BARISTA

---

# 4. Module Customer

## customer_addresses

Lưu địa chỉ giao hàng của khách.

Một khách hàng có thể có nhiều địa chỉ.

### Ví dụ

```text
Nhà riêng

Công ty

Ký túc xá
```

### Quan hệ

```text
User 1-N CustomerAddress
```

---

# 5. Module Product

## categories

Danh mục sản phẩm.

### Ví dụ

```text
Coffee

Tea

Freeze

Bakery
```

---

## products

Thông tin sản phẩm.

### Ví dụ

```text
Trà Sen Vàng

Phin Sữa Đá

Freeze Trà Xanh
```

### Quan hệ

```text
Category 1-N Product
```

---

## product_variants

Biến thể sản phẩm.

### Ví dụ

```text
Trà Sen Vàng
├── Size S
├── Size M
└── Size L
```

Mỗi size có giá riêng.

### Quan hệ

```text
Product 1-N ProductVariant
```

---

## toppings

Danh sách topping.

### Ví dụ

```text
Trân Châu Trắng

Thạch Cà Phê

Kem Cheese
```

---

## product_toppings

Quy định sản phẩm được chọn topping nào.

### Quan hệ

```text
Product N-N Topping
```

Ví dụ:

```text
Trà Sen Vàng
├── Trân Châu Trắng
├── Thạch Cà Phê

Phin Sữa Đá
└── Không có topping
```

---

# 6. Module Cart

## carts

Giỏ hàng của khách.

### Quan hệ

```text
User 1-1 Cart
```

---

## cart_items

Danh sách sản phẩm trong giỏ.

### Ví dụ

```text
Trà Sen Vàng L x2
```

---

## cart_item_toppings

Danh sách topping của từng sản phẩm trong giỏ.

### Ví dụ

```text
Trà Sen Vàng L

+ Trân Châu Trắng

+ Kem Cheese
```

---

# 7. Module Order

## orders

Thông tin đơn hàng.

### Thông tin

- Mã đơn
- Người nhận
- Địa chỉ giao
- Cửa hàng xử lý
- Tổng tiền
- Trạng thái

### Trạng thái

```text
PENDING

CONFIRMED

PREPARING

READY

COMPLETED

CANCELLED
```

---

## order_items

Chi tiết món trong đơn.

### Lưu Snapshot

- product_name
- size
- unit_price

Giúp hóa đơn cũ không bị ảnh hưởng khi sản phẩm đổi giá.

---

## order_item_toppings

Chi tiết topping trong đơn.

Ví dụ:

```text
Trà Sen Vàng L

+ Trân Châu Trắng

+ Kem Cheese
```

---

# 8. Module Payment

## payments

Thông tin thanh toán.

### Phương thức

```text
CASH

MOMO

BANKING

CARD
```

### Trạng thái

```text
UNPAID

PAID

FAILED

REFUNDED
```

### Quan hệ

```text
Order 1-1 Payment
```

---

# 9. Module Promotion

## promotions

Chương trình khuyến mãi.

### Ví dụ

```text
SUMMER2026

BUY1GET1

WELCOME50K
```

---

## order_promotions

Liên kết đơn hàng và mã giảm giá.

### Quan hệ

```text
Order N-N Promotion
```

---

# 10. Module Ingredient

## ingredients

Danh sách nguyên liệu.

### Ví dụ

```text
Cà Phê

Trà

Sữa

Syrup

Ly Nhựa

Nắp Ly

Ống Hút
```

### Đơn vị

```text
gram

ml

piece
```

---

# 11. Module Recipe

## recipes

Công thức của từng Product Variant.

Ví dụ:

```text
Trà Sen Vàng Size L
```

---

## recipe_ingredients

Danh sách nguyên liệu của công thức.

### Ví dụ

```text
Trà Sen Vàng L

30g trà

20ml syrup

200ml nước

1 ly nhựa

1 nắp ly

1 ống hút
```

### Quan hệ

```text
Recipe N-N Ingredient
```

---

## topping_ingredients

Nguyên liệu sử dụng cho topping.

### Ví dụ

```text
Trân Châu Trắng

30g trân châu
```

---

# 12. Module Inventory

## store_ingredients

Tồn kho nguyên liệu theo từng cửa hàng.

### Ví dụ

```text
Store Cầu Giấy

5000ml sữa

2000g trà

300 ly nhựa
```

---

## goods_receipts

Phiếu nhập kho.

### Ví dụ

```text
PN001

PN002

PN003
```

---

## goods_receipt_details

Chi tiết phiếu nhập.

### Ví dụ

```text
1000g trà

5000ml sữa

200 ly nhựa
```

---

## stock_movements

Lịch sử biến động kho.

### Loại biến động

```text
IMPORT

EXPORT

ADJUST
```

### Ví dụ

```text
Nhập kho

Xuất kho bán hàng

Điều chỉnh tồn kho
```

---

# 13. Luồng nghiệp vụ chính

## Luồng đặt hàng

```text
Khách hàng
↓
Chọn sản phẩm
↓
Chọn size
↓
Chọn topping
↓
Thêm vào giỏ hàng
↓
Tạo đơn hàng
↓
Thanh toán
```

---

## Luồng xử lý đơn

```text
Nhân viên xác nhận đơn
↓
Pha chế
↓
Hoàn thành đơn
↓
Giao khách
```

---

## Luồng trừ kho

```text
Order Completed
↓
Đọc Recipe
↓
Lấy danh sách Ingredient
↓
Trừ Store Ingredient
↓
Ghi Stock Movement
```

---

# 14. Phân quyền hệ thống

## ADMIN

Quản lý toàn hệ thống.

### Quyền

- Quản lý cửa hàng
- Quản lý người dùng
- Quản lý sản phẩm
- Quản lý phân quyền
- Quản lý khuyến mãi
- Xem báo cáo toàn hệ thống

---

## MANAGER

Quản lý cửa hàng được gán.

### Quyền

- Quản lý nhân viên cửa hàng
- Quản lý tồn kho
- Quản lý đơn hàng
- Xem doanh thu cửa hàng

---

## STAFF

Nhân viên vận hành.

### Quyền

- Xem đơn hàng
- Xác nhận đơn
- Cập nhật trạng thái đơn
- Nhập kho

---

## CUSTOMER

Khách hàng.

### Quyền

- Đăng ký
- Đăng nhập
- Đặt hàng
- Thanh toán
- Xem lịch sử mua hàng

---

# 15. Kiến trúc Module Backend

```text
auth
├── users
├── roles
├── permissions

store
├── stores
├── store_users

customer
├── customer_addresses

product
├── categories
├── products
├── product_variants
├── toppings

cart
├── carts
├── cart_items

order
├── orders
├── order_items

payment
├── payments

promotion
├── promotions

inventory
├── ingredients
├── recipes
├── store_ingredients
├── stock_movements
```

Tài liệu này là nguồn tham chiếu chính cho Backend Developer, Frontend Developer, BA, Tester và AI Agent khi triển khai hệ thống.
