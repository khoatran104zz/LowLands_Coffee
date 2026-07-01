# System Business Domain Analysis

## 1. Scope

Tai lieu nay tong hop lai business domain cua Lowlands Coffee sau cac sprint:

- Authentication, Authorization
- Store, Store User
- Product, Category, Variant, Topping
- Ingredient, Ingredient Category, Supplier
- Recipe, Recipe Ingredient
- Inventory, Stock Movement
- Goods Receipt, Goods Receipt Item
- Order, Payment, Cart, Promotion, Customer Address theo thiet ke/DBML
- Dashboard/Report

Muc tieu la lam ro moi module lam gi, ai su dung, phu thuoc module nao, va module nao dang la thiet ke nhung chua hoan tat trong backend/frontend.

## 2. Domain Layers

He thong nen duoc hieu theo cac lop nghiep vu sau:

| Layer | Module chinh | Vai tro |
| --- | --- | --- |
| Identity & Access | Authentication, User, Role, Permission | Dinh danh nguoi dung va kiem soat quyen |
| Organization | Store, Store User | Quan ly chi nhanh va nhan su theo chi nhanh |
| Catalog | Category, Product, Variant, Topping | Quan ly mat hang duoc ban tren menu/POS |
| Production Formula | Ingredient Category, Ingredient, Recipe, Recipe Ingredient | Dinh nghia cong thuc tieu hao nguyen lieu |
| Supply & Inventory | Supplier, Goods Receipt, Goods Receipt Item, Stock Movement, Inventory | Nhap hang, dieu chinh ton kho, tinh ton hien tai |
| Sales | Cart, Order, Order Item, Payment, Promotion | Ban hang online/POS va thanh toan |
| Reporting | Dashboard, Report | Tong hop so lieu van hanh |

## 3. Module Catalogue

### Authentication

- Vai tro: Dang nhap, dang ky, refresh token, lay thong tin profile.
- Muc dich: Cap JWT va xac thuc nguoi dung truoc khi goi API can bao ve.
- Ai su dung: Admin, Manager, Staff, Customer.
- Quan he: Phu thuoc User, Role, Permission.
- Hien trang: Da co backend auth API va frontend auth service.

### Authorization

- Vai tro: Phan quyen theo Role va Permission.
- Muc dich: Gioi han thao tac tren API quan tri/van hanh.
- Ai su dung: Backend security, Admin quan tri role/permission.
- Quan he: User co Role; Role co nhieu Permission.
- Hien trang: Da co module role/permission va `@PreAuthorize`; dong thoi co route gate `/admin/**`, `/manager/**`, `/staff/**`.

### User

- Vai tro: Tai khoan nguoi dung.
- Muc dich: Luu thong tin dang nhap, trang thai, vai tro.
- Ai su dung: Admin quan ly user; Auth dung de xac thuc; Order dung de gan customer/staff.
- Quan he: Role, Store User, Customer Address, Order.
- Hien trang: Da co backend module user.

### Customer

- Vai tro: Nguoi mua hang.
- Muc dich: Dat hang online, quan ly thong tin giao hang, lich su don.
- Ai su dung: Customer.
- Quan he: User, Customer Address, Cart, Order, Payment.
- Hien trang: Co trong SRS/DBML/frontend flow; backend customer-specific module chua tach rieng.

### Customer Address

- Vai tro: Dia chi giao hang cua customer.
- Muc dich: Ho tro order delivery.
- Ai su dung: Customer, staff/manager khi xu ly don giao hang.
- Quan he: User, Order.
- Hien trang: Co trong DBML/SRS; chua thay ro backend API/module hoan chinh.

### Store

- Vai tro: Chi nhanh cua Lowlands Coffee.
- Muc dich: La don vi ban hang va vi tri ton kho hien tai.
- Ai su dung: Admin quan ly store; Manager/Staff lam viec theo store.
- Quan he: Store User, Goods Receipt, Stock Movement, Order.
- Hien trang: Da co backend Store. Chua co Warehouse rieng.

### Store User

- Vai tro: Gan user vao store voi position.
- Muc dich: Xac dinh nhan su/quan ly thuoc chi nhanh nao.
- Ai su dung: Admin, Manager.
- Quan he: Store, User.
- Hien trang: Co entity/data bootstrap. Can lam ro store-scope trong permission.

### Category

- Vai tro: Nhom san pham tren menu.
- Muc dich: Phan loai product, loc menu.
- Ai su dung: Admin quan ly; Customer/Staff xem menu/POS.
- Quan he: Product.
- Hien trang: Da co admin API va public category/menu.

### Product

- Vai tro: Mat hang kinh doanh, vi du coffee/tea/cake.
- Muc dich: Hien thi tren menu va duoc chon trong order/POS.
- Ai su dung: Admin quan ly; Customer/Staff mua/ban.
- Quan he: Category, Variant, Product Topping, Order Item.
- Hien trang: Da co backend product module. Public product/menu chua inventory-aware day du.

### Variant

- Vai tro: Phien ban ban duoc cua product, thuong la size M/L.
- Muc dich: Xac dinh gia ban va don vi lap recipe.
- Ai su dung: Admin quan ly; Customer/Staff chon khi dat hang.
- Quan he: Product, Recipe, Order Item.
- Hien trang: Da co product variant trong product API/design.

### Topping

- Vai tro: Tuy chon them vao product.
- Muc dich: Tang tuy bien san pham va gia ban.
- Ai su dung: Admin quan ly; Customer/Staff chon khi order.
- Quan he: Product Topping, Order Item Topping.
- Hien trang: Da co topping API/design. Chua co cong thuc/tieu hao inventory rieng cho topping.

### Product Topping

- Vai tro: Mapping topping nao duoc ap dung cho product nao.
- Muc dich: Khong cho chon topping khong hop le voi product.
- Ai su dung: Product service/order UI.
- Quan he: Product, Topping.
- Hien trang: Co trong DBML/design.

### Ingredient Category

- Vai tro: Nhom nguyen lieu, vi du coffee bean, milk, syrup.
- Muc dich: Quan ly danh muc nguyen lieu.
- Ai su dung: Admin/Manager/Staff co quyen inventory/ingredient.
- Quan he: Ingredient.
- Hien trang: Da co backend API; dung chung permission `INGREDIENT_*`.

### Ingredient

- Vai tro: Nguyen lieu ton kho.
- Muc dich: Duoc nhap hang, ton kho, va tieu hao theo recipe.
- Ai su dung: Admin/Manager/Staff tuy quyen.
- Quan he: Ingredient Category, Supplier, Goods Receipt Item, Recipe Ingredient, Stock Movement.
- Hien trang: Da co backend ingredient API.

### Supplier

- Vai tro: Nha cung cap nguyen lieu.
- Muc dich: Gan nguon hang cho goods receipt.
- Ai su dung: Admin/Manager/Staff tuy quyen.
- Quan he: Goods Receipt.
- Hien trang: Da co backend supplier API.

### Recipe

- Vai tro: Cong thuc cho mot product variant.
- Muc dich: Xac dinh can nguyen lieu nao, so luong bao nhieu de lam 1 don vi ban.
- Ai su dung: Admin/Manager/Staff tuy quyen.
- Quan he: Product Variant, Recipe Ingredient.
- Hien trang: Da co backend recipe API.

### Recipe Ingredient

- Vai tro: Dong nguyen lieu trong recipe.
- Muc dich: Dinh nghia dinh muc tieu hao.
- Ai su dung: Recipe service va order/inventory khi tru kho.
- Quan he: Recipe, Ingredient.
- Hien trang: Da co trong DBML/backend recipe context.

### Goods Receipt

- Vai tro: Phieu nhap hang vao store.
- Muc dich: Ghi nhan nguyen lieu nhap tu supplier.
- Ai su dung: Admin/Manager/Staff tuy quyen.
- Quan he: Supplier, Store, User, Goods Receipt Item, Stock Movement.
- Hien trang: Da co backend goods receipt. Khi complete tao stock movement IN.

### Goods Receipt Item

- Vai tro: Dong hang cua goods receipt.
- Muc dich: Ghi ingredient, quantity, unit cost.
- Ai su dung: Goods receipt workflow.
- Quan he: Goods Receipt, Ingredient.
- Hien trang: Da co backend/design.

### Inventory

- Vai tro: Ton kho hien tai theo store va ingredient.
- Muc dich: Cho biet con bao nhieu nguyen lieu de van hanh va ban hang.
- Ai su dung: Manager/Staff/Admin.
- Quan he: Stock Movement, Ingredient, Store, Recipe.
- Hien trang: Khong thay bang balance rieng trong DBML; ton kho duoc tinh tu ledger `stock_movements`.

### Stock Movement

- Vai tro: So cai bien dong ton kho.
- Muc dich: Ghi IN, OUT, ADJUSTMENT cho ingredient tai store.
- Ai su dung: Goods Receipt, Inventory Adjustment, Order fulfillment.
- Quan he: Store, Ingredient, source document.
- Hien trang: Da co backend inventory/goods receipt. Order OUT la target design, chua co order backend.

### Cart

- Vai tro: Gio hang truoc khi tao order.
- Muc dich: Luu lua chon product/variant/topping/quantity.
- Ai su dung: Customer frontend.
- Quan he: User, Cart Item, Cart Item Topping.
- Hien trang: Co trong DBML/SRS/frontend local; chua co backend cart module ro rang.

### Order

- Vai tro: Giao dich ban hang.
- Muc dich: Ghi nhan customer/staff/dat hang/POS, trang thai xu ly, tong tien.
- Ai su dung: Customer, Staff, Manager, Admin.
- Quan he: User, Store, Customer Address, Order Item, Payment, Promotion, Stock Movement OUT.
- Hien trang: Co DBML/SRS/design; backend module order chua duoc trien khai day du.

### Order Item

- Vai tro: Dong san pham trong order.
- Muc dich: Luu snapshot product, variant, price, quantity.
- Ai su dung: Order service, report.
- Quan he: Order, Product, Product Variant, Order Item Topping.
- Hien trang: Co trong DBML/design; frontend order dang local/mock.

### Order Item Topping

- Vai tro: Topping snapshot cua order item.
- Muc dich: Luu topping da chon va gia tai thoi diem ban.
- Ai su dung: Order service.
- Quan he: Order Item, Topping.
- Hien trang: Co trong DBML/design.

### Payment

- Vai tro: Thanh toan cho order.
- Muc dich: Luu method, status, amount, transaction reference.
- Ai su dung: Customer/Staff/Manager/Admin.
- Quan he: Order.
- Hien trang: Co trong DBML/SRS/design; backend payment module chua hoan tat.

### Promotion

- Vai tro: Khuyen mai/giam gia.
- Muc dich: Ap dung discount cho order.
- Ai su dung: Admin/Manager, Customer.
- Quan he: Order Promotion, Order.
- Hien trang: Co trong DBML/frontend local; chua co backend promotion module ro rang.

### Order Promotion

- Vai tro: Mapping promotion da ap dung cho order.
- Muc dich: Luu discount snapshot.
- Ai su dung: Order/Payment/report.
- Quan he: Order, Promotion.
- Hien trang: Co trong DBML/design.

### Dashboard/Report

- Vai tro: Tong hop so lieu he thong.
- Muc dich: Admin/Manager xem tong quan users, stores, products, inventory, order/revenue.
- Ai su dung: Admin, Manager.
- Quan he: Nhieu module: User, Store, Product, Inventory, Order.
- Hien trang: Backend dashboard da co summary co ban; order/revenue con bi gioi han do order module chua hoan tat.

## 4. Product Selling Rules

Mot product chi nen duoc ban khi thoa cac dieu kien:

1. Category active.
2. Product active.
3. Co it nhat mot variant active.
4. Variant co gia hop le lon hon 0.
5. Neu bat buoc inventory-aware availability: variant phai co recipe active va nguyen lieu trong store du de lam it nhat 1 don vi.
6. Topping hien thi/duoc chon chi khi topping active va duoc gan hop le voi product.

Product unavailable khi:

- Product inactive/deleted.
- Category inactive.
- Khong co active variant.
- Variant price khong hop le.
- Theo target inventory: recipe bi thieu hoac nguyen lieu khong du tai store ban hang.

## 5. Store and Inventory Position

Hien tai he thong khong co Warehouse tong. Store dang la inventory location thuc te:

- Goods Receipt nhap vao mot store.
- Stock Movement gan voi store va ingredient.
- Inventory duoc tinh theo store + ingredient.
- Manager/Staff nen chi thao tac trong store duoc gan, tru khi role/quyen cho phep cross-store.

Neu sau nay can Warehouse tong, nen thiet ke lai thanh `Inventory Location` hoac them Warehouse/Transfer workflow. Hien tai khong nen mac dinh co kho tong vi DBML/backend chua the hien.

## 6. Source of Truth

| Du lieu | Source of truth nen dung |
| --- | --- |
| Dang nhap/quyen | Backend Auth + Role/Permission |
| Product catalog | Backend Product/Category/Topping API |
| Ton kho | `stock_movements` ledger theo store + ingredient |
| Nhap hang | Goods Receipt da complete |
| Cong thuc | Recipe + Recipe Ingredient |
| Don hang | Order tables/API sau khi module order duoc build |
| Thanh toan | Payment tables/API sau khi module payment duoc build |
| Bao cao doanh thu | Order + Payment, khong nen tu mock frontend |

## 7. Current State Summary

- Product, Category, Topping, Ingredient, Supplier, Recipe, Inventory, Goods Receipt da co backend theo nhieu muc do.
- Order, Payment, Cart, Promotion, Customer Address da co trong business/DBML/design nhung chua dong bo thanh module backend/frontend that day du.
- Frontend da co nhieu man hinh, nhung mot so phan van dung mock/local state, dac biet orders, promotions, store locator fallback, mot so dashboard/POS flow.
- Permission da co RBAC, nhung route gate theo `/admin`, `/manager`, `/staff` lam mot so permission bi gioi han boi duong dan.
