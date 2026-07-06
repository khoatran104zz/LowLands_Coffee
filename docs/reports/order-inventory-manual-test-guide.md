# Order Inventory Manual Test Guide

## Scope

Guide nay dung de kiem tra thu cong luong Order -> Payment -> Complete -> Inventory cho POS va backend.

Khong bao gom Dashboard, Promotion, Payment Gateway, migration anh cu, hay fake stock.

## Dieu kien truoc khi test

- Backend chay thanh cong.
- Frontend chay thanh cong.
- Database da apply migration moi nhat.
- Co user Admin hoac Staff co quyen tao/cap nhat order, thanh toan order, va complete order.
- Store mac dinh co menu active, recipe active, ingredient active, va stock IN ban dau.

## Test 1 - Tao Don, Thanh Toan, Hoan Tat

1. Dang nhap Admin hoac Staff.
2. Mo POS.
3. Chon mot san pham dang available.
4. Tao order.
5. Thanh toan bang CASH.
6. Chuyen order qua CONFIRMED, PREPARING, READY.
7. Bam Complete.

Ket qua mong doi:

- Order co status `COMPLETED`.
- Payment co status `PAID`.
- Bang `stock_movements` co movement `OUT`.
- `reference_type = ORDER`.
- `reference_id = order.id`.
- Quantity OUT bang `recipe_ingredient.quantity * order_item.quantity`.

## Test 2 - Ton Kho Giam Dung

1. Ghi lai ton kho cua ingredient truoc khi complete.
2. Complete order co recipe tu ingredient do.
3. Ghi lai ton kho sau complete.

Ket qua mong doi:

- Ton kho giam dung theo cong thuc.
- Khong co OUT thua cho ingredient khong nam trong recipe.

## Test 3 - Complete Hai Lan

1. Complete mot order thanh cong.
2. Bam Complete lai order do.

Ket qua mong doi:

- Order van `COMPLETED`.
- Khong tao them `OUT`.
- Ton kho khong bi tru them lan hai.

## Test 4 - Khong Du Ton Kho

1. Chon san pham co recipe can ingredient nhieu hon stock hien co.
2. Tao order va thanh toan.
3. Dua order den READY.
4. Bam Complete.

Ket qua mong doi:

- API tra HTTP 409.
- Message: `Không đủ nguyên liệu để hoàn tất đơn.`
- Data co `reason = INSUFFICIENT_STOCK`.
- Details co `ingredientId`, `ingredientName`, `requiredQuantity`, `availableQuantity`, `unit`.
- Order khong thanh `COMPLETED`.
- Khong co movement `OUT` moi.

## Test 5 - San Pham Chua Co Recipe

1. Chon product variant active nhung khong co active recipe.
2. Tao order, thanh toan, dua den READY.
3. Bam Complete.

Ket qua mong doi:

- API tra HTTP 409.
- Message: `Không thể hoàn tất đơn: sản phẩm {productName} size {size} chưa có công thức.`
- Data co `reason = MISSING_RECIPE`.
- Khong tao `OUT`.

## Test 6 - Recipe Rong

1. Chon product variant co active recipe nhung recipe khong co ingredient.
2. Tao order, thanh toan, dua den READY.
3. Bam Complete.

Ket qua mong doi:

- API tra HTTP 409.
- Message: `Không thể hoàn tất đơn: công thức của {productName} size {size} chưa có nguyên liệu.`
- Data co `reason = EMPTY_RECIPE`.
- Khong tao `OUT`.

## Test 7 - POS Availability Reload

1. Mo POS va xem san pham available.
2. Tao va complete order lam het stock cua mot san pham.
3. Quay lai POS hoac doi POS reload availability.

Ket qua mong doi:

- San pham vua het stock chuyen sang unavailable.
- POS khong cho ban tiep hoac hien canh bao ro.
- Neu van submit do stale UI, backend tra HTTP 409 va frontend hien message backend.

## Cau Lenh Ho Tro Kiem Tra DB

```sql
select *
from stock_movements
where reference_type = 'ORDER'
  and reference_id = :orderId;
```

```sql
select ingredient_id,
       sum(case
           when movement_type = 'IN' then quantity
           when movement_type = 'OUT' then -quantity
           else quantity
       end) as current_stock
from stock_movements
where store_id = :storeId
group by ingredient_id;
```
