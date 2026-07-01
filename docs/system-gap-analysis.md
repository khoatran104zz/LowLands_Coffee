# System Gap Analysis

## 1. Scope

Tai lieu nay chi bao cao gap. Khong sua code, khong doi API, khong them bang, khong tao migration.

Doi chieu cac lop:

- Business
- Database / DBML / migration intent
- API Contract
- Backend
- Frontend
- Permission

## 2. Executive Summary

He thong da co nen tang tot cho identity, store, product catalog, recipe, ingredient, inventory va goods receipt. Tuy nhien business end-to-end tu nhap hang den ban hang chua dong bo hoan toan vi sales domain con dang o muc thiet ke/local frontend.

Gap lon nhat:

1. Order/Payment/Cart/Promotion/Customer Address co trong business/DBML/SRS nhung chua thanh backend module day du.
2. Inventory da co inbound/adjustment, nhung outbound tu order chua hoan tat.
3. Product menu chua gan chat voi availability theo store va recipe inventory.
4. Permission da co RBAC, nhung route gate va store scope chua thong nhat.
5. Frontend con nhieu du lieu mock/local o order, promotion, dashboard, store locator.

## 3. Business Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| End-to-end order chua hoan tat | POS/customer order con thien ve design/local frontend | Chua co doanh thu/stock OUT that |
| Payment lifecycle chua hoan tat | Payment co trong DBML/SRS nhung backend module chua ro | Khong the doi soat paid/refund |
| Promotion engine chua hoan tat | Promotion local/frontend, chua co rule engine backend | Discount/report khong dang tin |
| Product availability chua day du | Menu active product chua chac da tinh du ingredient theo store | Co the ban mon het nguyen lieu |
| Store scope chua ro | Manager/staff gan store nhung enforcement chua dong bo | Nguy co thao tac cross-store |
| Warehouse chua co | Business co the can kho tong, nhung he thong chi co Store | Khong co transfer/central purchasing |
| Topping inventory chua ro | Topping chua co recipe ingredient | Topping khong tru kho |
| DINE_IN support chua du | Order type co DINE_IN nhung thieu table/session flow | Kho van hanh tai quan |
| Cancellation/refund rules chua ro | Chua chot trang thai nao duoc cancel/refund va co reverse stock khong | De sai ton kho/doanh thu |
| Reporting source chua that | Revenue/order report can Order/Payment that | Dashboard co nguy co hien so lieu mock |

## 4. Database Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| DBML lon hon backend hien tai | DBML co carts/orders/payments/promotions/customer_addresses, nhung backend module chua day du | Database contract va runtime co the lech |
| Khong co Warehouse | Chi co Store gan stock movement | Khong ho tro kho tong/transfer |
| Khong co inventory balance table | Ton kho tinh tu stock movements | Tot cho audit, nhung can query strategy/cache neu data lon |
| Khong co topping recipe | Khong co `topping_ingredients` | Topping khong tru ingredient |
| Order thieu mot so field van hanh | table_number, tax_amount, service_fee, cash_received, change_returned, cancel_reason chua thay ro | POS/DINE_IN/cash accounting gioi han |
| Promotion rules chua day du | DBML can chi tiet dieu kien neu muon rule engine that | Khuyen mai phuc tap kho mo rong |
| Store-user scope can constraint ro | Can dam bao mot user/position/store khong trung sai | Anh huong phan quyen van hanh |
| Hard delete risk | Role/user/master data/goods receipt delete can gay mat audit | Anh huong truy vet lich su |

## 5. API Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| Store API contract thieu/khong noi bat | Backend co Store nhung docs API contract chua dong bo nhu product/inventory | Frontend/developer kho follow |
| Order API chua implemented theo design | Contract/design co nhung backend module chua co | Frontend order/POS phai mock/local |
| Payment API chua ro | Chua co contract/runtime day du | Khong test thanh toan that |
| Cart API chua ro | Customer cart local | Multi-device cart khong ho tro |
| Promotion API chua ro | Promotions frontend local | Discount khong source of truth |
| Customer Address API chua ro | Delivery address co trong DBML/SRS | Checkout delivery chua day du |
| Availability API thieu | Chua co endpoint ro de tinh product available theo store inventory | Menu/POS khong biet het hang that |
| Role-permission assignment API can xac nhan | Co role/permission module nhung can contract day du | Admin RBAC UI kho dong bo |

## 6. Backend Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| Order module absent/incomplete | Khong thay module order trong backend module list | Khong tao/quan ly order that |
| Payment module absent/incomplete | Khong thay module payment day du | Khong co paid/refund source |
| Cart module absent/incomplete | Customer cart khong co backend source | Cart chi local |
| Promotion module absent/incomplete | Promotion khong co backend source | Discount/report khong that |
| Customer Address module absent/incomplete | Dia chi giao hang chua co API ro | Delivery order chua hoan tat |
| Inventory OUT tu Order chua co | Goods receipt IN co, order OUT chua | Ton kho khong giam khi ban |
| Product availability not inventory-aware | Product active co the hien du chua du ingredient | Over-selling |
| Store scoping not consistently enforced | Role/permission co, store assignment co, nhung service query/scope can ro | Manager/staff cross-store risk |
| Dashboard revenue/order placeholder | Dashboard khong co order/payment source that | Bao cao doanh thu chua dung |
| Delete semantics | CRUD delete voi audit domain can xem lai | Mat lich su/chung tu |
| Coarse ingredient permission | Ingredient category va ingredient dung chung `INGREDIENT_*` | Khong phan cap chi tiet |

## 7. Frontend Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| Order service local/mock | `order.service.ts` dung INITIAL_ORDERS/local create | Order khong luu database |
| POS checkout local | POS co UI nhung chua goi Order API that | Khong tru kho/khong co order backend |
| Promotions local | Promotion data khong tu backend | Discount khong dang tin |
| Dashboard store con mock/local | Branches, employees, customers, orders, promotions, mot phan ingredient/order state con local | So lieu khong source of truth |
| Featured products/home mock | Mot phan trang home con dung INITIAL_PRODUCTS/INITIAL_CATEGORIES | Public UI co the lech backend |
| Store locator fallback mock | Khi API fail co fallback store mock | Co the che lap loi backend |
| Manager page hardcoded store | Mot so flow frontend co storeId co dinh | Sai khi manager thuoc store khac |
| Auth service chua tach store/promotion service | `getStores` nam trong auth service; `getPromotions` tra `[]` | Service boundary chua sach |
| Customer checkout/cart local | Cart/order khong dong bo backend | Mat du lieu khi doi device/session |

## 8. Permission Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| `/admin/**` ADMIN-only | Product/category/topping admin API bi route gate ADMIN | Permission PRODUCT_* cho non-admin neu co cung khong tac dung |
| Order permissions chua runtime | ORDER_* co trong thiet ke nhung module chua co | Khong enforce order workflow |
| Payment permissions thieu | Khong thay PAYMENT_* | Refund/payment update khong ro ai duoc lam |
| Promotion permissions thieu | Khong thay PROMOTION_* | Admin/manager promotion chua phan quyen |
| Customer ownership thieu | Cart/address/order-own can enforce owner | Customer co nguy co truy cap du lieu nguoi khac neu build sai |
| Store scope thieu | Manager/staff can bi gioi han theo store | Role-only khong du |
| Dashboard role-only | Summary route theo role, khong permission granular | Kho mo rong report permission |
| Delete vs cancel/void | Goods receipt/order/payment can action semantic | CRUD permission khong phu hop audit |

## 9. Cross-Layer Conflicts

| Conflict | Business | Database | Backend | Frontend | Ket luan |
| --- | --- | --- | --- | --- | --- |
| Ban hang phai tru kho | Can Recipe -> Inventory OUT | Co Recipe/StockMovement | Chua co Order OUT | POS/order local | Chua end-to-end |
| Menu chi hien mon ban duoc | Can active + available | Co product/variant/recipe/stock | Public menu active-based | Menu/POS load product | Thieu availability theo store |
| Manager quan ly store | Can store scope | Co StoreUser | Permission/route chua du | Manager UI co hardcode | Scope chua thong nhat |
| Payment la source thu tien | Can payment lifecycle | Co payment table design | Chua module | Checkout local | Revenue chua tin duoc |
| Promotion anh huong total | Can backend rule | Co promotion/order promotion | Chua module | Local/mock | Discount chua source of truth |
| Customer delivery | Can address | Co customer_addresses | Chua module ro | Checkout UI co the co local | Delivery chua hoan tat |

## 10. Recommended Final Architecture

Target domain flow:

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
Public Menu / POS
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

Vai tro module:

- Supplier: nguon cung cap nguyen lieu.
- Goods Receipt: chung tu nhap hang vao store.
- Stock Movement: ledger duy nhat cho bien dong ton.
- Inventory: view/tong hop ton hien tai theo store + ingredient.
- Recipe: cong thuc san xuat cho product variant.
- Product/Variant: mat hang va size/gia duoc ban.
- Order: giao dich ban hang.
- Payment: thu tien/refund.
- Report: doc tu order/payment/inventory that.

## 11. Sprint Readiness Recommendations

Nen chot truoc sprint tiep:

1. Store la inventory location chinh cho den khi co Warehouse.
2. Order module phai la sprint uu tien neu muon dong bo POS/customer/report/inventory OUT.
3. Payment module can di kem Order neu report doanh thu la muc tieu.
4. Product availability can co decision: active-only hay inventory-aware by store.
5. Permission can bo sung store scope va semantic actions.
6. Frontend khong nen tiep tuc mo rong mock data cho domain da co backend.

## 12. Final Conclusion

Lowlands Coffee da co nhieu module nen tang, nhung nghiep vu tong the can thong nhat lai theo chuoi:

```text
Store + Inventory + Recipe + Product + Order + Payment
```

Cho den khi Order/Payment va stock OUT duoc build that, he thong van chua the coi la mot vong van hanh day du tu nhap hang den ban hang va bao cao doanh thu.
