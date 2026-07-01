# System Business Flow

## 1. Authentication Flow

```text
User
  |
  v
Login / Register
  |
  v
Backend Auth validates credentials
  |
  v
JWT access token + refresh token
  |
  v
Frontend attaches Bearer token
  |
  v
Protected API checks role + permission
```

Ket qua:

- Public API chi dung cho menu/product/category va auth.
- Admin/Manager/Staff API can JWT.
- Permission chi co y nghia khi duong dan security cho phep role truy cap truoc.

## 2. Store Setup Flow

```text
Admin
  |
  v
Create / update Store
  |
  v
Assign users to Store
  |
  v
Store User position: MANAGER / CASHIER / STAFF
  |
  v
Manager and Staff operate inside assigned Store
```

Y nghia:

- Store la chi nhanh kinh doanh.
- Store cung la diem ton kho hien tai vi chua co Warehouse.
- Store scope can duoc ap dung cho inventory, goods receipt, POS, order.

## 3. Product Setup Flow

```text
Admin
  |
  v
Category active
  |
  v
Product active
  |
  v
Variant active with price > 0
  |
  v
Optional Product Topping mapping
  |
  v
Recipe for Product Variant
  |
  v
Recipe Ingredient lines
  |
  v
Product is ready to sell
```

Business rules:

- Product phai thuoc category active de hien tren public menu.
- Product phai co active variant de customer/staff chon size.
- Variant price phai lon hon 0.
- Neu bat inventory-aware selling, variant can recipe va nguyen lieu du tai store.
- Topping chi hien khi active va duoc gan hop le voi product.

## 4. Ingredient and Recipe Flow

```text
Admin / Manager
  |
  v
Ingredient Category
  |
  v
Ingredient
  |
  v
Recipe
  |
  v
Recipe Ingredient
  |
  v
Product Variant production formula
```

Y nghia:

- Ingredient la doi tuong ton kho.
- Recipe khong lam thay doi ton kho.
- Recipe chi dinh nghia mot product variant can bao nhieu ingredient.
- Khi order hoan tat, recipe moi duoc dung de tinh stock movement OUT.

## 5. Goods Receipt Flow

```text
Supplier
  |
  v
Goods Receipt draft for Store
  |
  v
Goods Receipt Item
  |
  v
Complete Goods Receipt
  |
  v
Stock Movement IN
  |
  v
Inventory increases for Store + Ingredient
```

Business rules:

- Goods Receipt nhap vao Store, khong nhap vao Warehouse vi he thong chua co Warehouse.
- Goods Receipt chi nen anh huong ton kho khi complete.
- Complete nen idempotent: khong tao trung stock movement IN neu complete lai.
- Goods Receipt da complete nen han che update/delete; neu sai nen tao adjustment.

## 6. Inventory Adjustment Flow

```text
Authorized Staff / Manager / Admin
  |
  v
Stock Adjustment request
  |
  v
Stock Movement ADJUSTMENT
  |
  v
Inventory recalculated from ledger
```

Y nghia:

- Adjustment dung cho kiem kho, hao hut, sai lech.
- Khong nen sua truc tiep so ton neu source of truth la stock movement.
- Moi adjustment can reason/reference de audit.

## 7. POS Sale Flow

```text
Staff
  |
  v
POS loads Product / Category from backend
  |
  v
Select Product
  |
  v
Select Variant
  |
  v
Select active Toppings
  |
  v
Cart
  |
  v
Create Order for Store
  |
  v
Payment
  |
  v
Complete Order
  |
  v
Recipe -> Recipe Ingredient
  |
  v
Stock Movement OUT
  |
  v
Inventory decreases
```

Hien trang:

- Frontend POS da co UI va product catalog.
- Order/POS checkout backend chua hoan tat; order dang thien ve local/mock flow.
- Chua can goi Order API neu order module chua tich hop, nhung target flow nen theo so do tren.

## 8. Customer Online Order Flow

```text
Customer
  |
  v
Public Menu
  |
  v
Product Detail
  |
  v
Select Variant and Toppings
  |
  v
Cart
  |
  v
Checkout
  |
  v
Order: DELIVERY / PICKUP
  |
  v
Payment: CASH / MOMO / BANKING / CARD
  |
  v
Store fulfillment
  |
  v
Order completed or cancelled
```

Order status target:

```text
PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED
                     \-> CANCELLED
```

Payment status target:

```text
UNPAID -> PAID
UNPAID -> FAILED
PAID   -> REFUNDED
```

## 9. Order Fulfillment and Inventory Flow

```text
Order completed
  |
  v
For each Order Item
  |
  v
Find Product Variant Recipe
  |
  v
For each Recipe Ingredient
  |
  v
quantity_to_deduct = order_item.quantity * recipe_ingredient.quantity
  |
  v
Create Stock Movement OUT
  |
  v
Inventory decreases
```

Important:

- Product/topping price in order item should be snapshot tai thoi diem ban.
- Stock OUT nen tao khi order chuyen sang trang thai hoan tat nghiep vu, khong tao khi customer chi them vao cart.
- Neu cho tru kho o `CONFIRMED`/`PREPARING`, can co reverse movement khi cancel.

## 10. Promotion Flow

```text
Admin / Manager
  |
  v
Create Promotion
  |
  v
Customer / Staff applies Promotion
  |
  v
Order Promotion snapshot
  |
  v
Discount affects Order total
  |
  v
Payment amount uses discounted total
```

Hien trang:

- Promotion co trong DBML/frontend local.
- Backend promotion API/rules chua hoan tat.
- Chua nen dua promotion vao report doanh thu neu source van la mock/local.

## 11. Reporting Flow

```text
Operational data
  |
  +-- User / Store
  +-- Product / Category
  +-- Inventory / Stock Movement
  +-- Goods Receipt
  +-- Order / Payment
  |
  v
Dashboard / Report
```

Hien trang:

- Dashboard backend co summary co ban.
- Revenue/order report can Order + Payment module that.
- Frontend con mot so report/order data tu mock nen chua phai source of truth.

## 12. End-to-End Target Flow

```text
Supplier
  |
  v
Goods Receipt
  |
  v
Stock Movement IN
  |
  v
Inventory at Store
  |
  v
Recipe
  |
  v
Product Variant
  |
  v
Menu / POS
  |
  v
Order
  |
  v
Payment
  |
  v
Stock Movement OUT
  |
  v
Report
```
