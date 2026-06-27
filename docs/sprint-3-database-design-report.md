# Sprint 3 Database Design Report

## 1. Pham vi

Sprint 3 cap nhat thiet ke database cho cac module:

- Supplier
- Ingredient
- Recipe
- Inventory
- Goods Receipt

Khong thuc hien:

- Khong tao Flyway migration.
- Khong code backend.
- Khong them moi bang Order/Payment.
- Khong them bang cache ton kho khi chua duoc duyet.

---

## 2. Tai lieu da cap nhat

- `docs/DB-erd/coffee-shop-management.dbml`
- `docs/DB-erd/database-note.md`

---

## 3. Bang Sprint 3

### suppliers

Luu nha cung cap nguyen lieu. Bang nay la dau vao cua phieu nhap kho.

Quan he:

```text
suppliers 1-N goods_receipts
```

### ingredient_categories

Phan loai nguyen lieu, giup quan ly danh muc nhu Coffee, Tea, Milk, Syrup, Packaging.

Quan he:

```text
ingredient_categories 1-N ingredients
```

### ingredients

Luu master data nguyen lieu. Bang nay khong luu ton kho hien tai.

Quan he:

```text
ingredients 1-N recipe_ingredients
ingredients 1-N goods_receipt_items
ingredients 1-N stock_movements
```

### recipes

Luu cong thuc theo `product_variant`.

Quan he:

```text
product_variants 1-1 recipes
```

### recipe_ingredients

Bang trung gian giua cong thuc va nguyen lieu, luu dinh muc nguyen lieu cho 1 san pham.

Quan he:

```text
recipes N-N ingredients
```

### goods_receipts

Luu phieu nhap kho theo supplier, store va nguoi tao.

Quan he:

```text
suppliers 1-N goods_receipts
stores 1-N goods_receipts
users 1-N goods_receipts
```

### goods_receipt_items

Luu chi tiet nguyen lieu trong phieu nhap.

Quan he:

```text
goods_receipts 1-N goods_receipt_items
ingredients 1-N goods_receipt_items
```

### stock_movements

Ledger bien dong kho theo cua hang va nguyen lieu.

Quan he:

```text
stores 1-N stock_movements
ingredients 1-N stock_movements
users 1-N stock_movements
```

---

## 4. Luong nghiep vu

### Supplier -> Goods Receipt -> Stock Movement IN

```text
Supplier
-> Goods Receipt
-> Goods Receipt Item
-> Stock Movement IN
```

Khi phieu nhap `goods_receipts` duoc xac nhan `COMPLETED`, moi dong `goods_receipt_items` se tao mot dong `stock_movements`:

- `movement_type = IN`
- `reference_type = GOODS_RECEIPT`
- `reference_id = goods_receipts.id`

Ton kho tang thong qua viec tong hop ledger `stock_movements`.

### Recipe -> Recipe Ingredient

```text
Product Variant
-> Recipe
-> Recipe Ingredient
-> Ingredient
```

`recipes` gan cong thuc voi bien the san pham. `recipe_ingredients` luu danh sach nguyen lieu va so luong dinh muc cho 1 san pham. Luong nay chi dinh nghia dinh muc, khong lam thay doi ton kho.

### Order Completed -> Stock Movement OUT

```text
Order Completed
-> Recipe
-> Recipe Ingredient
-> Stock Movement OUT
```

Luong nay duoc ghi nhan cho Sprint sau. Khi don hang hoan tat, he thong se doc recipe cua tung order item va tao `stock_movements`:

- `movement_type = OUT`
- `reference_type = ORDER`
- `reference_id = orders.id`

Sprint 3 chi chuan bi ERD de ho tro luong nay, khong them bang Order/Payment va khong code tru kho.

---

## 5. Nguyen tac ton kho

Ton kho hien tai duoc tinh tu `stock_movements` theo cap:

```text
store_id + ingredient_id
```

Cong thuc tong quan:

```text
current_stock =
  SUM(IN)
  - SUM(OUT)
  +/- SUM(ADJUSTMENT)
```

Khong them bang cache ton kho trong Sprint 3. Neu can toi uu hieu nang doc ton kho, co the de xuat bang cache/snapshot nhu `inventory_balances`, nhung can duoc duyet rieng truoc khi them vao ERD.

---

## 6. Anh huong migration

Khong co migration moi trong Sprint 3 theo dung yeu cau.

File `docs/DB-erd/coffee-shop-management.sql` khong duoc cap nhat trong lan nay de tranh tao migration/DDL ngoai pham vi.

---

## 7. Ket luan

Thiet ke Sprint 3 da chuyen mo hinh inventory sang ledger `stock_movements`, bo phu thuoc vao bang ton kho cache truc tiep. ERD hien tai du cac bang nen tang cho supplier, goods receipt, ingredient, recipe va stock movement, dong thoi de ngo luong tru kho tu order cho Sprint sau.
