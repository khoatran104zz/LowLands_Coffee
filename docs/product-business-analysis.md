# Product Business Analysis

## 1. Business Overview

Product Module la trung tam cua menu ban hang Lowlands Coffee. Product duoc dung boi:

- Customer Menu va Product Detail de hien thi mon ban online.
- POS de nhan order tai quay.
- Admin Product de quan tri danh muc, san pham, size, gia va topping duoc phep chon.
- Recipe/Inventory de dinh nghia dinh muc nguyen lieu va sau nay kiem tra/tru kho khi ban.
- Order de snapshot ten mon, size, gia va topping tai thoi diem dat hang.

Nguon da doi chieu:

- Tai lieu: `docs/srs.md`, `docs/convention.md`, `docs/DB-erd/database-note.md`, `docs/DB-erd/coffee-shop-management.dbml`, `docs/api-contract/product-api.md`, `docs/api-contract/recipe-api.md`, `docs/api-contract/inventory-api.md`, `docs/sprint-2-product-module-report.md`.
- Backend: `product`, `recipe`, `inventory`, `auth`, `permission`, `store`, `common`, `security`.
- Frontend: Admin Products/Categories, Customer Menu, Product Detail, POS, `dashboardStore`, `product.service`, product types.

Ghi chu: yeu cau nhac `docs/sprint-2-product-report.md` nhung repo hien co file `docs/sprint-2-product-module-report.md`.

## 2. Product Relationships

### Product - Category

- Quan he DB: `categories 1-N products`.
- Backend entity: `ProductEntity.category` la bat buoc.
- Public API chi hien thi product khi `product.status = active` va `category.status = active`.
- Admin API co the list ca active/inactive.
- Hien tai cho phep tao/cap nhat Product gan vao Category inactive vi service chi check category ton tai, chua check status.

Business ket luan:

- Category la nhom bat buoc cua product.
- Product khong duoc public/sell neu category inactive.
- Nen chan tao/cap nhat product active vao category inactive.
- Khi category inactive, product khong can bi doi status, nhung khong duoc hien thi/ban.

### Product - Variant

- Quan he DB: `products 1-N product_variants`.
- Moi variant dai dien size `S`, `M`, `L` va price rieng.
- DB migration co unique `(product_id, size)`.
- Backend create/update yeu cau `variants` non-empty va validate duplicate size.
- Public product chi hop le khi co it nhat 1 active variant.
- Update product phai preserve `product_variants.id`: request co `id` thi update variant cu, request khong co `id` thi tao moi, variant cu bi omit thi set `inactive`.

Business ket luan:

- Mot Product co 1 den 3 variants theo size S/M/L.
- Product co the co variant inactive; public response chi tra active variants.
- Product khong duoc ban neu khong co active variant.
- Gia nen lon hon 0 voi variant ban duoc. Hien contract/code/DB dang cho phep `price >= 0`.

### Product - Topping

- Quan he DB: `products N-N toppings` qua `product_toppings`.
- Topping optional theo product.
- Public response chi tra active toppings.
- Backend chi check topping id ton tai, chua check topping active khi gan vao product.
- Admin create product tu frontend hien gui `toppingIds: []` do `dashboardStore.addProduct` goi `toProductRequest(product, false)`, du UI hardcode toppings trong object local.

Business ket luan:

- Mot Product co 0-N topping duoc phep chon.
- Topping khong bat buoc.
- Chi active topping moi duoc public/sell.
- Nen chan gan inactive topping cho product active hoac it nhat khong cho hien thi/ban.

### Product - Recipe

- Quan he DB Sprint 3: `product_variants 1-1 recipes`.
- Recipe gan theo variant, khong gan truc tiep product.
- Mot Product co toi da so recipe bang so variants.
- Recipe co 1-N recipe ingredients.
- Hien frontend chua co recipe UI/service.
- Product service chua kiem tra recipe khi public/sell.

Business ket luan:

- Recipe la dieu kien can de tinh availability theo ton kho.
- Neu product variant can tru kho thi variant do phai co active recipe va recipe co ingredient hop le.
- Sprint hien tai chua enforce rule nay.

### Product - Inventory

- Inventory hien tinh tu `stock_movements` theo `store_id + ingredient_id`.
- Chua co bang stock cache.
- Chua co logic Product Availability theo store.
- Chua co luong Order Completed -> Stock Movement OUT.

Business ket luan:

- Availability phai theo store, khong phai global.
- Mot variant ban duoc tai store khi tat ca ingredient trong active recipe co current stock du cho quantity can ban.
- Neu thieu recipe hoac thieu nguyen lieu, variant/product can bi xem la unavailable tai store do.
- Hien backend public menu/POS khong co store context nen chua the tra availability dung nghiep vu.

### Product - Order

- ERD co `order_items.product_id`, `product_variant_id`, snapshot `product_name`, `size`, `unit_price`.
- `order_item_toppings` snapshot `topping_name`, `unit_price`.
- Backend order module chua ton tai trong code hien tai.
- POS hien tao order local trong `dashboardStore`, khong goi backend Order API.

Business ket luan:

- Order phai snapshot du lieu product de hoa don cu khong bi thay doi khi product/topping doi gia hoac inactive.
- Khi dat hang can validate lai product, variant, topping status va allowed topping.
- Khi order completed can tru kho theo recipe, nhung Sprint hien tai chua implement.

## 3. Sellability Rules

Product co the ban khi:

- Product active.
- Category active.
- Co it nhat mot active variant.
- Variant duoc chon active.
- Topping duoc chon active va nam trong product_toppings cua product.
- Neu ap dung inventory: variant co active recipe va tung ingredient du ton tai tai store.
- Neu order/POS theo store: store active va co availability cho product variant tai store.

Product khong duoc ban khi:

- Product inactive.
- Category inactive.
- Variant inactive hoac product khong co active variant.
- Topping inactive hoac khong duoc gan cho product.
- Recipe thieu/inactive voi mon yeu cau quan ly kho.
- Nguyen lieu khong du ton trong store.
- Store inactive hoac nhan vien POS khong thuoc store hop le.

Delete policy:

- Product, Category, Topping, Recipe dang soft delete bang `status = inactive`.
- Khong hard delete product data vi order history can snapshot/reference.
- Category inactive khong nen cascade inactive product, nhung public/sell phai tu dong an product cua category do.

## 4. Business Rules

### Critical

| Rule | Trang thai hien tai |
|---|---|
| Product phai co category ton tai | Co |
| Product active khong duoc gan vao category inactive | Implemented |
| Product phai co it nhat 1 variant | Co |
| Variant size chi duoc la S/M/L | Co |
| Variant size unique trong mot product | Co o service va DB migration |
| Variant price phai > 0 | Implemented bang DTO/service validation va migration V19 |
| Product public/sell phai active | Co cho public API |
| Category inactive thi product khong public/sell | Co cho public API, chua chan admin gan category inactive |
| Product khong co active variant thi khong public detail/list | Co |
| Delete product/category/topping la soft delete | Co |
| Order phai snapshot product/variant/topping | Co trong ERD, chua co backend order |
| Topping duoc chon phai thuoc product_toppings | Chua co backend order/cart enforcement |
| Product active khong duoc gan inactive topping | Implemented cho create/update product |
| Inventory availability theo recipe va store | Chua co |
| Khong ban khi thieu nguyen lieu | Chua co |

### Medium

| Rule | Trang thai hien tai |
|---|---|
| Category name unique case-insensitive | Co o service, DB unique case-sensitive |
| Topping name unique case-insensitive | Co o service, DB unique case-sensitive |
| Product name co duoc trung khong | Chot: khong unique global; neu can thi chi check trong cung category |
| Gia topping co the >= 0 | Chot: topping price >= 0 |
| MinPrice/MaxPrice filter phai hop le | Chua validate |
| Public list can pagination/lazy loading | Chua co |
| Search/filter nen xu ly o backend | Backend co query params nhung filter in-memory; frontend customer van filter client-side |
| Admin update variant nen ton trong id cu | Chua, dang clear/recreate |
| Product create/update active nen khong cho category inactive | Chua |
| Gan inactive topping vao product active nen bi chan | Implemented |
| Recipe create nen check product/variant/product status | Chua |
| Inventory service nen check store/ingredient/user active | Chua |

### Optional

| Rule | Trang thai hien tai |
|---|---|
| SKU cho product/variant | Chua co cot/API/UI |
| Sort order trong category/menu | Chua co |
| Featured product | Chua co |
| Product image upload/media service | Chua co, chi image URL |
| Product availability endpoint theo store | Chua co |
| Bulk import product | Chua co |
| Audit field cho variant/topping/product_toppings | Chua co theo ERD product hien tai |
| Low stock threshold anh huong menu | Chua co |

## 5. Database Review

### ERD/DBML

Bang lien quan: `categories`, `products`, `product_variants`, `toppings`, `product_toppings`, `recipes`, `recipe_ingredients`, `stock_movements`, `order_items`, `order_item_toppings`.

Danh gia quan he:

- Category 1-N Product dung.
- Product 1-N Variant dung.
- Product N-N Topping dung.
- ProductVariant 1-1 Recipe dung.
- Recipe N-N Ingredient qua recipe_ingredients dung.
- OrderItem reference Product/ProductVariant va snapshot dung huong.

Thieu/Can xem xet trong DBML:

- `categories.name` DBML chua danh dau unique, migration V12 da them.
- `toppings.name` DBML chua danh dau unique, migration V11 da them.
- `product_variants(product_id, size)` DBML chua danh dau unique, migration V9 da them.
- `product_toppings(product_id, topping_id)` DBML chua danh dau unique, migration V9 da them.
- DBML chua the hien check constraint cho status, size, price.
- `product_variants`, `toppings`, `product_toppings` thieu `created_at/updated_at`.
- Chua co soft delete field rieng; status dang dong vai tro soft delete.
- Chua co SKU/code cho product/variant.
- Chua co index search product name/category/status trong DBML; migration co index category/status nhung chua co index name.
- Chua co availability/cache table theo store-product-variant.

Danh gia migration:

- V9 tao product tables, FK, unique variant size, unique product_toppings, status/size/price check, index status/FK.
- V11 them unique topping name va bo unique product name.
- V12 them unique category name.
- V13 them recipe/inventory tables, unique recipe per variant, unique recipe ingredient.
- Constraint product variant price duoc cap nhat bang migration V19 thanh `> 0`.

## 6. Backend Review

### Entity

- Product/Category co audit timestamps.
- Variant/Topping/ProductTopping khong co audit timestamps.
- Product cascade + orphanRemoval cho variants/toppings giup replace nhanh nhung lam mat id variant khi update.
- Recipe gan `ProductVariantEntity` 1-1 va co audit.

### DTO Validation

- ProductCreate/Update validate categoryId, name, variants non-empty, status pattern.
- Variant validate S/M/L va price >= 0.
- Topping validate price >= 0.
- Chua validate duplicate `toppingIds` o request, service dedupe im lang.
- Chua validate `minPrice <= maxPrice`.
- Da validate active product khong duoc dung category/topping inactive.

### Repository

- ProductRepository load all product details roi service filter in-memory.
- Chua co database pagination/search/filter.
- Category/Topping repository co existsByNameIgnoreCase.
- ProductVariantRepository co find by id cho recipe.

### Service

- ProductService co transaction.
- Public filter active product/category/variant dung.
- Create/update product da chan category inactive, topping inactive va variant price <= 0.
- Update product preserve variant id, tao variant moi khi request khong co id va set inactive variant cu bi omit.
- Delete soft delete product.
- Category/Topping soft delete.
- Recipe service check duplicate code, duplicate variant recipe, duplicate ingredient, soft delete.
- Inventory service tinh stock ledger nhung chua noi voi product sellability.

### Controller/Permission

- Admin product/category/topping co `@PreAuthorize` theo permission.
- SecurityConfig con chan `/api/v1/admin/**` bang role ADMIN truoc khi method permission, nen Manager co permission cung khong vao duoc admin product.
- Public menu/categories/products permitAll.
- Recipe/Inventory endpoint yeu cau authenticated va permission method-level.

### Exception/Logging

- GlobalExceptionHandler tra ApiResponse cho 400/401/403/404/409/500.
- Chua co logging loi unexpected.
- Chua co exception rieng cho unavailable/out-of-stock.

## 7. API Review

API Product hien co dap ung CRUD co ban:

- Public: `/menu`, `/categories`, `/products`, `/products/{id}`.
- Admin: `/admin/products`, `/admin/categories`, `/admin/toppings`.

Khoang trong:

- Chua co pagination response cho public/admin product list.
- Chua co endpoint product availability theo store.
- Chua co endpoint lay product theo store/POS voi stock status.
- Chua co product/topping admin detail endpoint rieng.
- Chua co image upload/media API.
- Chua co recipe data trong ProductResponse.
- Chua co API validate order item product/topping/variant.
- HTTP status contract on create dung 201, delete 200.
- ApiResponse dung chuan `{success,message,data}`.

Can can nhac them API:

- `GET /api/v1/products?categoryId=&search=&minPrice=&maxPrice=&page=&size=`
- `GET /api/v1/stores/{storeId}/menu`
- `GET /api/v1/stores/{storeId}/products/{id}/availability`
- `POST /api/v1/admin/products/{id}/activate`
- `POST /api/v1/admin/products/{id}/deactivate`
- `GET /api/v1/admin/products/{id}`

## 8. Frontend Review

### Admin Product

- Dung `dashboardStore.hydrateProductCatalog("admin")`.
- Hien thi product/category/status/variants.
- Form chi ho tro gia S/M/L, chua co UI chon topping thuc tu backend.
- Tao product hardcode toppings local nhung store gui `toppingIds: []`, nen backend khong luu topping luc create.
- Update product gui toppings tu `editingProduct.toppings`, nhung khong co UI thay doi topping.
- Validation UI chi check name/category, price 0 bi bo qua bang cach khong tao variant.
- Neu ca 3 price = 0, backend se reject variants empty; frontend admin da duoc dieu chinh de khong toast success truoc khi API thanh cong.

### Customer Menu

- Goi backend `/products` va `/categories`.
- Khong fallback mock product, dung policy.
- Search/category filter dang xu ly client-side, chua truyen query params backend.
- Chua co pagination/lazy loading.
- Quick add tren product card lay variant dau tien va khong chon topping.

### Product Detail

- Goi `/products/{id}`.
- Chon variant, topping, quantity, note.
- Public response da filter active variants/toppings.
- Chua co store availability/out-of-stock theo ton kho.

### POS

- Goi public catalog qua dashboardStore.
- Loc category/search client-side.
- POS ProductCard xu ly inactive product/no active variant la out-of-stock.
- Checkout tao order local trong Zustand, khong goi backend Order API.
- Promotion, customer, order history con mock/local.
- StoreId dang hardcode `2` trong POSCart.
- Chua validate stock/recipe/store availability.

### Type/Enum Mapping

- Product status backend: `active/inactive`; frontend khop.
- Size: `S/M/L`; frontend khop.
- Payment/order enum frontend dang lower-case/custom; DB note payment/order dung upper-case. Day la rui ro cho sprint order.
- Promotion discount frontend `percentage/fixed_amount`; DB note `PERCENT/FIXED`. Rui ro mapping.

## 9. Issues Can Sua Truoc Khi Coding

Critical:

- Xac nhan Product Availability co phai bat buoc theo recipe/inventory trong sprint coding tiep theo khong.
- Chon scope: availability global public menu hay theo store/POS.
- Quyet dinh rule gia `> 0` hay tiep tuc cho phep `0`.
- Da chan tao/cap nhat product active voi category inactive.
- Da chan gan inactive topping cho product active.
- Bo sung backend order/cart validation truoc khi tru kho.

Medium:

- Them pagination/filter DB-level cho product list.
- Giai quyet admin create product khong gui toppingIds.
- Product name khong unique global; neu can tranh trung thi chi kiem tra trong cung category o sprint sau.
- Update variant da preserve id de giu recipe reference.
- Them logging cho unexpected exception.
- Dong bo enum payment/promotion/order giua frontend va backend.

Optional:

- SKU/code cho product/variant.
- Audit timestamps cho variants/toppings/product_toppings.
- Sort order/featured flag.
- Product media upload.
- Availability cache neu stock query cham.
