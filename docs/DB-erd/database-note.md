# Database Design Note

## 1. Tong quan

Tai lieu nay mo ta thiet ke database cho Lowlands Coffee. Nguon ERD chinh la:

```text
docs/DB-erd/coffee-shop-management.dbml
```

Sprint 3 chi cap nhat thiet ke database cho cac phan:

- Ingredient
- Recipe
- Inventory
- Supplier
- Goods Receipt

Sprint 3 khong tao migration va khong code backend. Sprint 3 cung khong them moi Order/Payment; cac bang Order/Payment hien co duoc giu nguyen nhu phan thiet ke truoc do.

---

## 2. Nguyen tac thiet ke

- PostgreSQL la database muc tieu.
- ERD viet bang DBML.
- Ten bang va cot dung `snake_case`.
- Khoa chinh chuan la `id` kieu `bigint`.
- Cac quan he phai co foreign key trong ERD.
- Du lieu ton kho theo cua hang phai co `store_id`.
- Ton kho hien tai duoc tinh tu ledger `stock_movements`, khong luu truc tiep vao bang `ingredients`.
- Neu can toi uu doc ton kho bang cache/snapshot, can duoc duyet rieng truoc khi them bang.

---

## 3. Module Authentication & Authorization

### roles

Luu danh sach vai tro trong he thong.

Vi du:

- ADMIN
- MANAGER
- STAFF
- CUSTOMER

### permissions

Luu danh sach quyen nghiep vu.

Vi du:

- PRODUCT_CREATE
- PRODUCT_UPDATE
- ORDER_VIEW
- INVENTORY_UPDATE
- REPORT_VIEW

### role_permissions

Bang trung gian lien ket `roles` va `permissions`.

Quan he:

```text
Role N-N Permission
```

### users

Luu thong tin tai khoan nguoi dung.

Quan he:

```text
User N-1 Role
```

---

## 4. Module Store Management

### stores

Luu danh sach cua hang/chi nhanh.

### store_users

Lien ket nhan vien voi cua hang.

Quan he:

```text
Store 1-N StoreUser
User 1-N StoreUser
```

Vai tro trong cua hang:

- MANAGER
- CASHIER
- BARISTA

---

## 5. Module Customer

### customer_addresses

Luu dia chi giao hang cua khach hang.

Quan he:

```text
User 1-N CustomerAddress
```

---

## 6. Module Product

### categories

Danh muc san pham.

### products

Thong tin san pham.

Quan he:

```text
Category 1-N Product
```

### product_variants

Bien the san pham theo size/gia.

Quan he:

```text
Product 1-N ProductVariant
```

### toppings

Danh sach topping co the ban kem san pham.

### product_toppings

Bang trung gian quy dinh san pham duoc chon topping nao.

Quan he:

```text
Product N-N Topping
```

---

## 7. Module Cart

### carts

Gio hang cua khach hang.

### cart_items

Danh sach san pham trong gio hang.

### cart_item_toppings

Danh sach topping cua tung san pham trong gio hang.

---

## 8. Module Order

### orders

Thong tin don hang.

Trang thai hien co:

```text
PENDING
CONFIRMED
PREPARING
COMPLETED
CANCELLED
```

### order_items

Chi tiet mon trong don hang. Bang nay luu snapshot `product_name`, `size`, `unit_price` de hoa don cu khong bi anh huong khi san pham thay doi gia.

### order_item_toppings

Chi tiet topping trong tung dong san pham cua don hang.

Ghi chu Sprint 3: khong them moi bang Order. Viec tru ton kho khi Order Completed se duoc xu ly o Sprint sau.

---

## 9. Module Payment

### payments

Thong tin thanh toan cua don hang.

Phuong thuc hien co:

```text
CASH
MOMO
BANKING
CARD
```

Trang thai hien co:

```text
UNPAID
PAID
FAILED
REFUNDED
```

Ghi chu Sprint 3: khong them moi bang Payment.

---

## 10. Module Promotion

### promotions

Chuong trinh khuyen mai.

### order_promotions

Bang trung gian lien ket don hang va ma khuyen mai.

Quan he:

```text
Order N-N Promotion
```

---

## 11. Sprint 3 - Supplier

### suppliers

Luu thong tin nha cung cap nguyen lieu.

Cot chinh:

- `code`: ma nha cung cap, unique.
- `name`: ten nha cung cap.
- `contact_name`: nguoi lien he.
- `phone`, `email`, `address`: thong tin lien he.
- `tax_code`: ma so thue neu co.
- `status`: trang thai hoat dong.

Quan he:

```text
Supplier 1-N GoodsReceipt
```

---

## 12. Sprint 3 - Ingredient

### ingredient_categories

Danh muc nguyen lieu.

Vi du:

- Coffee
- Tea
- Milk
- Syrup
- Packaging

### ingredients

Danh sach nguyen lieu co the nhap kho va su dung trong cong thuc.

Cot chinh:

- `category_id`: lien ket danh muc nguyen lieu.
- `code`: ma nguyen lieu, unique.
- `name`: ten nguyen lieu.
- `unit`: don vi chuan de tinh kho, vi du `gram`, `ml`, `piece`.
- `status`: trang thai su dung.

Quan he:

```text
IngredientCategory 1-N Ingredient
```

Ghi chu: `ingredients` khong luu so luong ton kho hien tai. Ton kho hien tai duoc tinh bang tong phat sinh tu `stock_movements` theo `store_id` va `ingredient_id`.

---

## 13. Sprint 3 - Recipe

### recipes

Cong thuc pha che gan voi mot `product_variant`.

Quan he:

```text
ProductVariant 1-1 Recipe
```

Tai DBML hien tai, quan he duoc bieu dien bang:

```text
recipes.product_variant_id > product_variants.id
```

### recipe_ingredients

Danh sach nguyen lieu can dung trong mot cong thuc.

Cot chinh:

- `recipe_id`: cong thuc.
- `ingredient_id`: nguyen lieu.
- `quantity`: so luong can dung cho 1 don vi san pham.
- `unit`: don vi cua dinh muc.

Quan he:

```text
Recipe N-N Ingredient
```

Luong cong thuc:

```text
Recipe
-> Recipe Ingredient
-> Ingredient
```

Cong thuc chi mo ta dinh muc, khong truc tiep lam thay doi ton kho.

---

## 14. Sprint 3 - Goods Receipt

### goods_receipts

Phieu nhap kho theo nha cung cap va cua hang.

Cot chinh:

- `supplier_id`: nha cung cap.
- `store_id`: cua hang nhap kho.
- `created_by`: nguoi tao phieu.
- `receipt_code`: ma phieu nhap, unique.
- `total_amount`: tong tien phieu.
- `status`: `DRAFT`, `COMPLETED`, `CANCELLED`.
- `note`: ghi chu.

Quan he:

```text
Supplier 1-N GoodsReceipt
Store 1-N GoodsReceipt
User 1-N GoodsReceipt
```

### goods_receipt_items

Chi tiet nguyen lieu trong phieu nhap.

Cot chinh:

- `receipt_id`: phieu nhap.
- `ingredient_id`: nguyen lieu.
- `quantity`: so luong nhap.
- `unit`: don vi nhap.
- `unit_price`: don gia.
- `total_price`: thanh tien.

Quan he:

```text
GoodsReceipt 1-N GoodsReceiptItem
Ingredient 1-N GoodsReceiptItem
```

Khi phieu nhap chuyen sang `COMPLETED`, he thong se ghi nhan cac dong `stock_movements` loai `IN`.

---

## 15. Sprint 3 - Stock Movement

### stock_movements

Ledger ghi lai moi bien dong kho theo cua hang va nguyen lieu.

Cot chinh:

- `store_id`: cua hang phat sinh bien dong.
- `ingredient_id`: nguyen lieu.
- `movement_type`: `IN`, `OUT`, `ADJUSTMENT`.
- `quantity`: so luong bien dong.
- `unit`: don vi.
- `reference_type`: nguon phat sinh, vi du `GOODS_RECEIPT`, `ORDER`, `MANUAL_ADJUSTMENT`.
- `reference_id`: id cua chung tu nguon.
- `created_by`: nguoi tao bien dong.

Ton kho hien tai duoc tinh nhu sau:

```text
current_stock =
  SUM(quantity where movement_type = IN)
  - SUM(quantity where movement_type = OUT)
  +/- SUM(quantity where movement_type = ADJUSTMENT)
```

Pham vi tinh ton kho:

```text
store_id + ingredient_id
```

Sprint 3 chua them bang cache ton kho. Neu sau nay can toi uu truy van, co the de xuat bang cache nhu `inventory_balances` hoac `store_ingredient_balances`, nhung chua them vao ERD khi chua duoc duyet.

---

## 16. Luong nghiep vu Sprint 3

### Supplier -> Goods Receipt -> Stock Movement IN

```text
Supplier
-> Goods Receipt
-> Goods Receipt Item
-> Stock Movement IN
```

Mo ta:

1. Nhan vien chon nha cung cap va cua hang nhap kho.
2. Tao `goods_receipts` voi trang thai `DRAFT`.
3. Them danh sach nguyen lieu vao `goods_receipt_items`.
4. Khi phieu nhap duoc xac nhan `COMPLETED`, moi dong item tao mot dong `stock_movements` voi:
   - `movement_type = IN`
   - `reference_type = GOODS_RECEIPT`
   - `reference_id = goods_receipts.id`
5. Ton kho hien tai tang thong qua truy van tong hop tu `stock_movements`.

### Recipe -> Recipe Ingredient

```text
Product Variant
-> Recipe
-> Recipe Ingredient
-> Ingredient
```

Mo ta:

1. Moi bien the san pham co the gan mot cong thuc.
2. Cong thuc dinh nghia danh sach nguyen lieu va so luong can dung cho 1 san pham.
3. `recipe_ingredients` la bang trung gian giua `recipes` va `ingredients`.
4. Cong thuc chi mo ta dinh muc, khong truc tiep lam thay doi ton kho.

### Order Completed -> Stock Movement OUT

```text
Order Completed
-> Order Item
-> Product Variant
-> Recipe
-> Recipe Ingredient
-> Stock Movement OUT
```

Mo ta:

1. Luong nay chua trien khai trong Sprint 3.
2. O Sprint sau, khi don hang sang `COMPLETED`, he thong se doc cong thuc cua tung `product_variant`.
3. Tong so luong nguyen lieu can tru se duoc tinh theo `order_items.quantity`.
4. He thong ghi `stock_movements` voi:
   - `movement_type = OUT`
   - `reference_type = ORDER`
   - `reference_id = orders.id`
5. Ton kho hien tai giam thong qua truy van tong hop tu `stock_movements`.

---

## 17. Cac bang Sprint 3 da bo sung vao ERD

- `suppliers`
- `ingredient_categories`
- `ingredients`
- `recipes`
- `recipe_ingredients`
- `goods_receipts`
- `goods_receipt_items`
- `stock_movements`

---

## 18. Cac bang khong them trong Sprint 3

Khong them moi:

- Bang Order moi.
- Bang Payment moi.
- Bang cache ton kho.
- `store_ingredients`.
- `topping_ingredients`.

Ly do:

- Sprint 3 tap trung vao nen tang nguyen lieu, cong thuc, nha cung cap, nhap kho va ledger bien dong kho.
- Ton kho hien tai duoc tinh tu `stock_movements`.
- Tru kho khi don hang hoan tat se duoc xu ly o Sprint sau.

---

## 19. Ghi chu ve migration

Sprint 3 chi cap nhat tai lieu thiet ke:

- Cap nhat DBML.
- Cap nhat Database Note.
- Tao report thiet ke.

Khong tao file Flyway migration trong Sprint 3 theo yeu cau.
