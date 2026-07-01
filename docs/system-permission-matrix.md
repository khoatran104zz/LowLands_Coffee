# System Permission Matrix

## 1. Permission Notation

| Ky hieu | Nghia |
| --- | --- |
| V | View |
| C | Create |
| U | Update |
| D | Delete |
| A | Approve / Adjust |
| Com | Complete |
| Can | Cancel |
| Own | Chi du lieu cua chinh user |
| Store | Chi store duoc gan |
| Public | Khong can dang nhap |

## 2. Current Backend Permission Catalogue

Backend dang dung cac permission sau qua `@PreAuthorize`:

| Domain | Permissions |
| --- | --- |
| Role | ROLE_VIEW, ROLE_CREATE, ROLE_UPDATE, ROLE_DELETE |
| Permission | PERMISSION_VIEW, PERMISSION_CREATE, PERMISSION_UPDATE, PERMISSION_DELETE |
| User | USER_VIEW, USER_CREATE, USER_UPDATE, USER_DELETE |
| Employee | Managed through USER_VIEW, USER_CREATE, USER_UPDATE, USER_DELETE in current Admin user flow |
| Store | STORE_VIEW, STORE_CREATE, STORE_UPDATE, STORE_DELETE |
| Product | PRODUCT_VIEW, PRODUCT_CREATE, PRODUCT_UPDATE, PRODUCT_DELETE |
| Category | CATEGORY_VIEW, CATEGORY_CREATE, CATEGORY_UPDATE, CATEGORY_DELETE |
| Topping | TOPPING_VIEW, TOPPING_CREATE, TOPPING_UPDATE, TOPPING_DELETE |
| Supplier | SUPPLIER_VIEW, SUPPLIER_CREATE, SUPPLIER_UPDATE, SUPPLIER_DELETE |
| Ingredient / Ingredient Category | INGREDIENT_VIEW, INGREDIENT_CREATE, INGREDIENT_UPDATE, INGREDIENT_DELETE |
| Recipe | RECIPE_VIEW, RECIPE_CREATE, RECIPE_UPDATE, RECIPE_DELETE |
| Inventory | INVENTORY_VIEW, INVENTORY_ADJUST |
| Goods Receipt | GOODS_RECEIPT_VIEW, GOODS_RECEIPT_CREATE, GOODS_RECEIPT_UPDATE, GOODS_RECEIPT_DELETE, GOODS_RECEIPT_COMPLETE |

Documented/planned but chua thanh module day du:

| Domain | Planned permissions |
| --- | --- |
| Order | ORDER_VIEW, ORDER_CREATE, ORDER_UPDATE, ORDER_CANCEL, ORDER_COMPLETE |
| Payment | Chua thay permission ro rang |
| Promotion | Chua thay permission ro rang |
| Cart | Chua thay permission ro rang |
| Customer Address | Chua thay permission ro rang |

## 3. Current Route Gate

Security route gate hien tai:

| Route pattern | Requirement |
| --- | --- |
| `/api/v1/auth/login` | Public |
| `/api/v1/auth/register` | Public |
| `/api/v1/auth/refresh-token` | Public |
| `/api/v1/menu` | Public |
| `/api/v1/categories` | Public |
| `/api/v1/products` | Public |
| `/api/v1/products/**` | Public |
| `/api/v1/admin/**` | Role ADMIN |
| `/api/v1/manager/**` | Role MANAGER |
| `/api/v1/staff/**` | Role STAFF |
| Other APIs | Authenticated |

He qua quan trong:

- Permission khong du neu role khong qua duoc route gate.
- Product/category/topping admin APIs nam duoi `/admin/**`, nen effective access la ADMIN-only truoc khi xet permission.
- Manager co permission business nao do nhung van khong vao duoc `/admin/products` neu route gate khong cho.

## 4. Recommended Business Permission Matrix

Bang nay la kien truc quyen nghiep vu nen thong nhat. Cot "Current note" ghi nhan diem lech neu co.

| Module | ADMIN | MANAGER | STAFF | CUSTOMER | Current note |
| --- | --- | --- | --- | --- | --- |
| Authentication | V/C Own | V Own | V Own | Register/Login/Own | Co auth API |
| Role | V/C/U/D | - | - | - | Admin only hop ly |
| Permission | V/C/U/D | - | - | - | Admin only hop ly |
| User | V/C/U/D | V Store | V Own/Store basic | Own | Manager/staff scope can ro hon |
| Employee | V/C/U/D via User flow | V Store | V Own/Store basic | - | Employee profile/code duoc tao tu UserService cho MANAGER/STAFF |
| Store | V/C/U/D | V/U Store | V Store | Public store info | Store scope chua chat |
| Store User | V/C/U/D | V Store | - | - | Can API/scope ro |
| Category | V/C/U/D | V | V | Public active V | Admin route dang khoa create/update/delete |
| Product | V/C/U/D | V | V | Public active V | Admin route dang khoa write cho non-admin |
| Variant | V/C/U/D | V | V | Public active V | Theo product API |
| Topping | V/C/U/D | V | V | Public active V | Admin route dang khoa write cho non-admin |
| Product Topping | V/C/U/D | V | V | Public active V | Theo product/topping domain |
| Ingredient Category | V/C/U/D | V/C/U Store? | V | - | Dang dung chung INGREDIENT_* |
| Ingredient | V/C/U/D | V/C/U Store? | V | - | Staff create/update can xem lai |
| Supplier | V/C/U/D | V/C/U | V | - | Staff create supplier co the qua rong neu co |
| Recipe | V/C/U/D | V/C/U | V | - | Staff update recipe nen han che |
| Recipe Ingredient | V/C/U/D | V/C/U | V | - | Theo Recipe |
| Goods Receipt | V/C/U/D/Com | V/C/U/Com Store | V/C Store | - | Staff complete/delete nen can xem lai |
| Inventory | V/A | V/A Store | V Store | - | Adjust nen Manager/Admin chinh |
| Stock Movement | V | V Store | V Store | - | Tao qua workflow, khong tao tu do |
| Cart | - | - | - | Own C/U/D | Backend cart chua ro |
| Order | V/U/Can/Com | V/U/Can/Com Store | V/C/U/Com Store | Own V/C/Can limited | Order backend chua co |
| Order Item | V | V Store | V/C/U before submit | Own V/C/U before submit | Theo Order |
| Payment | V/Refund | V Store | C/V Store | Own C/V | Payment backend chua co |
| Promotion | V/C/U/D | V/C/U? | V/apply | Public/apply | Backend promotion chua co |
| Customer Address | - | V with order | V with order | Own V/C/U/D | Backend chua ro |
| Dashboard/Report | V all | V Store | V limited own shift | - | Backend route role-only |

## 5. Role Interpretation

### ADMIN

- Quan tri toan he thong.
- Quan ly user, role, permission, store.
- Quan ly master data: category, product, topping, ingredient, supplier, recipe.
- Xem va dieu chinh inventory toan bo store.
- Xem dashboard/report toan he thong.
- Nen co quyen xu ly override/cancel/refund khi order/payment module hoan tat.

### MANAGER

- Quan ly van hanh store duoc gan.
- Co employee profile va employee code de phan biet voi customer account.
- Xem/tao/cap nhat goods receipt cua store.
- Xem va dieu chinh ton kho store.
- Xem recipe/product/category de van hanh.
- Nen co quyen xu ly order cua store.
- Khong nen quan ly role/permission toan he thong.

### STAFF

- Lam viec tai POS va van hanh ca.
- Co employee profile va employee code.
- Xem menu/product/category/topping.
- Tao order/POS.
- Xem inventory can thiet.
- Co the tao goods receipt draft neu business cho phep, nhung complete/adjust nen can Manager/Admin.
- Khong nen update recipe/product master data.

### CUSTOMER

- Xem public menu.
- Dang ky/dang nhap.
- Quan ly profile/dia chi cua minh.
- Tao cart/order cua minh.
- Xem lich su don cua minh.
- Thanh toan va huy don trong gioi han trang thai cho phep.

## 6. Permission Gaps

| Gap | Mo ta | Anh huong |
| --- | --- | --- |
| Route gate vs permission | `/admin/**` yeu cau ADMIN truoc khi xet permission | Manager khong the dung product/category/topping admin API du co permission |
| Store scope | Permission hien chu yeu theo role/action, chua dam bao du lieu thuoc store duoc gan | Manager/staff co nguy co xem/sua cross-store |
| Employee permissions | Employee profile dang di theo User permissions thay vi permission rieng | Don gian cho phase hien tai, nhung neu Employee API rieng mo rong thi can EMPLOYEE_* |
| Order permissions | Co trong thiet ke nhung chua co module/order enforcement day du | Khong the test RBAC order that |
| Payment permissions | Chua thay permission rieng | Refund/payment update chua duoc bao ve ro |
| Promotion permissions | Chua thay permission rieng | Promotion dang de lai frontend/local |
| Cart/customer address permissions | Chua thay permission rieng | Customer ownership can duoc enforce |
| Dashboard authorization | Dashboard route gate theo role, khong thay permission chi tiet | Kho phan cap report granular |
| Ingredient category permission | Dung chung `INGREDIENT_*` | Don gian nhung coarse-grained |
| Goods receipt delete | Permission `GOODS_RECEIPT_DELETE` co the khong phu hop nghiep vu | Nen phan biet cancel/void thay vi delete vat ly |

## 7. Recommended Permission Direction

Khong can sua code trong tai lieu nay, nhung nen thong nhat huong sau truoc sprint tiep:

1. Tach role gate va permission sao cho permission co y nghia that, dac biet voi Manager.
2. Them store-scope enforcement cho Manager/Staff.
3. Dinh nghia order/payment/promotion/cart/customer-address permissions truoc khi build order module.
4. Uu tien semantic actions: COMPLETE, CANCEL, REFUND, ADJUST thay vi chi CRUD.
5. Tranh hard delete voi du lieu audit nhu order, payment, goods receipt, stock movement.
