# System Module Relationship

## 1. High-Level Architecture

```text
Identity & Access
  |
  v
Organization / Store
  |
  +------------------+
  |                  |
  v                  v
Catalog         Supply & Inventory
  |                  |
  v                  v
Recipe --------> Inventory Availability
  |                  |
  +--------+---------+
           |
           v
Sales / Order / Payment
           |
           v
Dashboard / Report
```

Lowlands Coffee nen duoc hieu nhu mot he thong ban hang theo store:

- Store la diem van hanh va diem ton kho.
- Catalog quyet dinh ban gi.
- Recipe quyet dinh ban mot variant can ton nguyen lieu nao.
- Inventory cho biet store co du nguyen lieu khong.
- Order/Payment tao doanh thu va tieu hao nguyen lieu.
- Report lay du lieu tu cac giao dich that, khong lay mock.

## 2. Identity and Access Relationships

```text
User
  |
  v
Role
  |
  v
Role Permission
  |
  v
Permission
```

Quan he:

- User co mot role chinh trong entity hien tai.
- Role co nhieu permission qua role_permissions.
- API security kiem tra ca role route gate va permission method.
- Store User bo sung viec user thuoc store nao.

## 3. Store Relationships

```text
Store
  |
  +-- Store User -- User
  |
  +-- Goods Receipt
  |
  +-- Stock Movement
  |
  +-- Order
```

Y nghia:

- Store la chi nhanh.
- Store User gan nhan su vao chi nhanh.
- Goods Receipt nhap hang vao store.
- Stock Movement ghi bien dong inventory tai store.
- Order nen gan store de biet ban o dau va tru kho o dau.

Hien tai khong co Warehouse:

```text
No Warehouse
  |
  v
Inventory location = Store
```

Neu sau nay can kho tong:

```text
Warehouse / Store
  |
  v
Inventory Location
  |
  v
Stock Movement / Transfer
```

Day la kien truc tuong lai, khong phai hien trang.

## 4. Catalog Relationships

```text
Category
  |
  v
Product
  |
  +-- Product Variant
  |
  +-- Product Topping -- Topping
```

Y nghia:

- Category gom nhieu product.
- Product la mat hang tong quat.
- Product Variant la don vi ban co gia rieng, vi du size M/L.
- Topping la tuy chon them, chi hop le neu duoc mapping voi product.

Public menu chi nen hien:

```text
Category active
  +
Product active
  +
Variant active
  +
Business availability satisfied
```

## 5. Recipe Relationships

```text
Product Variant
  |
  v
Recipe
  |
  v
Recipe Ingredient
  |
  v
Ingredient
```

Y nghia:

- Recipe nen gan voi product variant, khong chi product tong quat, vi size khac nhau co dinh muc khac nhau.
- Recipe Ingredient cho biet so luong nguyen lieu can cho mot don vi variant.
- Recipe khong phai ton kho; no la cong thuc.
- Ingredient moi la doi tuong ton kho.

## 6. Ingredient and Supply Relationships

```text
Ingredient Category
  |
  v
Ingredient
  ^
  |
Goods Receipt Item
  ^
  |
Goods Receipt
  ^
  |
Supplier
```

Y nghia:

- Supplier cung cap nguyen lieu.
- Goods Receipt la chung tu nhap.
- Goods Receipt Item la nguyen lieu va so luong nhap.
- Ingredient Category chi phan loai nguyen lieu.

## 7. Inventory Relationships

```text
Store
  |
  v
Stock Movement
  |
  v
Ingredient
```

Current stock:

```text
current_quantity(store, ingredient)
  =
SUM(stock_movements.quantity_change)
```

Nguon tao stock movement:

```text
Goods Receipt complete -> IN
Manual adjustment       -> ADJUSTMENT
Order complete          -> OUT
```

Luu y:

- DBML khong the hien bang `inventory_balances`.
- Neu can toi uu truy van, co the them cache/balance sau nay, nhung source of truth van nen la ledger.
- Stock Movement nen la du lieu audit, khong nen hard delete.

## 8. Sales Relationships

```text
Customer / Staff
  |
  v
Cart
  |
  v
Order
  |
  +-- Order Item -- Product Variant -- Product
  |
  +-- Order Item Topping -- Topping
  |
  +-- Payment
  |
  +-- Order Promotion -- Promotion
  |
  +-- Customer Address
```

Y nghia:

- Cart la trang thai truoc order.
- Order la giao dich chinh.
- Order Item nen luu snapshot ten/gia product/variant tai thoi diem ban.
- Payment khong nen thay the order; payment la trang thai thu tien cua order.
- Promotion ap dung vao order va can snapshot discount.
- Customer Address chi can khi delivery.

Hien trang:

- DBML/SRS/design da co sales domain.
- Backend order/payment/cart/promotion chua hoan tat.
- Frontend con order mock/local.

## 9. Order to Inventory Relationship

```text
Order completed
  |
  v
Order Item
  |
  v
Product Variant
  |
  v
Recipe
  |
  v
Recipe Ingredient
  |
  v
Stock Movement OUT
  |
  v
Inventory decreases
```

Cong thuc:

```text
deduct_quantity = order_item.quantity * recipe_ingredient.quantity
```

Business decision can chot:

- Tru kho khi order chuyen sang `COMPLETED`, hay khi `CONFIRMED`/`PREPARING`.
- Neu tru som, can reverse stock movement khi cancel.
- Topping co tru kho khong. Hien tai chua co topping recipe.

## 10. Payment Relationship

```text
Order
  |
  v
Payment
```

Payment can luu:

- Method: CASH, MOMO, BANKING, CARD.
- Status: UNPAID, PAID, FAILED, REFUNDED.
- Amount va transaction reference.

Business:

- Order co the tao truoc khi payment paid.
- Payment failed khong nen lam mat order neu customer co the thanh toan lai.
- Refund nen la action rieng co audit.

## 11. Promotion Relationship

```text
Promotion
  |
  v
Order Promotion
  |
  v
Order total discount
```

Business:

- Promotion nen co dieu kien ap dung ro: thoi gian, min order, store, product/category, usage limit.
- Order Promotion nen luu snapshot de report khong bi thay doi khi promotion sau nay update.

Hien trang:

- Co DBML/frontend local.
- Backend rules/API chua hoan tat.

## 12. Dashboard Relationship

```text
User / Store
Product / Category
Ingredient / Inventory
Goods Receipt
Order / Payment
  |
  v
Dashboard / Report
```

Dashboard dung duoc den muc source that co san:

- User/store/product/inventory co backend source.
- Revenue/order can order/payment backend that.
- Khong nen hop thuc hoa so lieu tu mock frontend.

## 13. Suggested Final Dependency Direction

Module phu thuoc nen di mot chieu:

```text
User / Role / Permission
  -> Store
  -> Catalog
  -> Ingredient
  -> Recipe
  -> Goods Receipt
  -> Inventory
  -> Order
  -> Payment
  -> Report
```

Khong nen de:

- Product phu thuoc order.
- Recipe tu dong sua inventory.
- Frontend mock tro thanh source of truth.
- Payment cap nhat ton kho truc tiep.
- Report tinh doanh thu tu du lieu khong phai order/payment that.
