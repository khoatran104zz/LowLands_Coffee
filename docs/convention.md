# Coding Convention - Lowlands Coffee

Tài liệu hướng dẫn và quy định viết mã nguồn cho dự án Frontend Lowlands Coffee.

## 1. Quy tắc Đặt tên (Naming Conventions)

### 1.1 Thư mục (Folders)
- Sử dụng **kebab-case** cho toàn bộ thư mục trong dự án.
- Ví dụ:
  - `product-card`
  - `order-history`
  - `coffee-menu`

### 1.2 Thành phần React (Components)
- Sử dụng **PascalCase** cho tên file và tên component.
- Mỗi component tương ứng với một file riêng biệt.
- Ví dụ:
  - `ProductCard.tsx`
  - `Navbar.tsx`
  - `CartItem.tsx`

### 1.3 Hàm & Biến (Functions & Variables)
- Sử dụng **camelCase** cho tên hàm và tên biến.
- Các hằng số (constants) phải được viết hoa toàn bộ và phân cách bằng dấu gạch dưới (**UPPER_SNAKE_CASE**).
- Ví dụ:
  - `getProducts()`
  - `handleSubmit()`
  - `const DEFAULT_PAGE_SIZE = 10;`

---

## 2. Quy tắc Đa ngôn ngữ (i18n Rules)

- **CẤM** viết cứng (hardcode) bất kỳ chuỗi UI text nào trực tiếp trong component hoặc file constants.
- Tất cả text hiển thị cho người dùng, nhãn nút (button labels), placeholders, thông báo lỗi (error messages), và SEO metadata phải được định nghĩa trong file dịch:
  - `src/messages/vi.json` (Tiếng Việt - Mặc định)
  - `src/messages/en.json` (Tiếng Anh)
- **Cách sử dụng trong Component**:
  ```tsx
  import { useTranslations } from "next-intl";

  export function AddCartButton() {
    const t = useTranslations("common");
    return <button>{t("addToCart")}</button>;
  }
  ```
- **Hằng số hệ thống**: Khi định nghĩa các hằng số chứa thông tin hiển thị (ví dụ: Items của Navbar), sử dụng các mã định danh dịch (`labelKey`) thay vì text cứng.
  ```typescript
  export const MENU_ITEMS = [
    {
      labelKey: "menu.home",
      href: "/"
    }
  ];
  ```

---

## 3. Quy tắc ESLint & Kiểm tra Mã nguồn (ESLint Rules)

Dự án áp dụng cấu hình ESLint nghiêm ngặt nhằm tránh các lỗi bảo trì sau này:
- **Unused Imports**: Tự động cảnh báo/lỗi khi có import không được sử dụng.
- **No any**: Cấm sử dụng kiểu `any` trong TypeScript. Mọi biến phải có kiểu dữ liệu rõ ràng (`interface` hoặc `type`).
- **No magic numbers**: Không được viết các số trực tiếp không rõ nghĩa trong mã nguồn. Hãy khai báo hằng số.
- **No hardcoded color**: Không được viết cứng mã màu Hex/RGB trong style. Phải sử dụng Tailwind tokens hoặc CSS variables.
  - Sai: `const color = "#123456";`
  - Đúng: Sử dụng Tailwind class như `text-primary` hoặc `bg-secondary`.

---

## 4. Kiến trúc Thư mục và Trách nhiệm (Folder Responsibility)
- `components/base`: Các component nguyên tử độc lập (Button, Input, Modal, Table, Toast). Không chứa business logic.
- `components/features`: Các component chứa nghiệp vụ cụ thể của sản phẩm (ví dụ: `ProductCard`, `CartList`).
- `services`: Nơi định nghĩa các hàm gọi API bằng Axios. Không mock data.
- `store`: Chứa logic quản lý state của Zustand. Không chứa mock data.


---

# 5. Backend Architecture Convention

## 5.1 Architecture Style

Backend sử dụng:

- Modular Layered Architecture
- Spring Boot
- PostgreSQL
- JWT Authentication
- RBAC Authorization

Cấu trúc package chuẩn:

src/main/java/com/lowlands/coffee/

├── common/
├── config/
├── security/
└── modules/

## 5.2 Business Modules

- auth
- user
- store
- product
- cart
- order
- payment
- promotion
- inventory

## 5.2.1 Permission Naming Standard

Backend RBAC permission codes must use action-level names:

- `MODULE_VIEW`
- `MODULE_CREATE`
- `MODULE_UPDATE`
- `MODULE_DELETE`

Examples:

- `USER_VIEW`
- `STORE_CREATE`
- `PRODUCT_UPDATE`
- `GOODS_RECEIPT_DELETE`

Do not introduce new `READ` or `MANAGE` permission codes. When a module needs a special workflow action that is not basic CRUD, use an explicit action name, for example `INVENTORY_ADJUST` or `GOODS_RECEIPT_COMPLETE`.

## 5.3 Module Structure

modules/{module}/

├── controller/
├── dto/request/
├── dto/response/
├── entity/
├── repository/
├── service/
│   └── impl/
└── mapper/

## 5.4 Controller Rules

Controller chỉ được:

- Nhận request
- Validate request
- Gọi service
- Trả response

Không được:

- Chứa business logic
- Gọi repository trực tiếp

## 5.5 Service Rules

Service là nơi xử lý nghiệp vụ.

## 5.6 Repository Rules

Repository chỉ dùng để truy cập dữ liệu PostgreSQL.

---

# 6. Database Convention

Database:

- PostgreSQL

Nguồn dữ liệu chuẩn:

- docs/DB-erd/coffee-shop-management.dbml
- docs/DB-erd/database-note.md

Migration:

src/main/resources/db/migration

Ví dụ:

- V1__create_roles.sql
- V2__create_users.sql
- V3__create_store_module.sql

---

# 7. Git Convention

Branch:

- main
- develop
- feature/*
- fix/*
- docs/*

Commit:

- feat: add product module
- fix: fix login bug
- docs: update database note
- refactor: optimize order service

---

# 8. AI Agent Convention

AI Agent phải đọc:

- docs/srs.md
- docs/convention.md
- docs/DB-erd/database-note.md

AI Agent không được:

- Tự ý thay đổi kiến trúc
- Chuyển sang Clean Architecture
- Tự ý sửa database
- Viết business logic trong controller

---

# 9. Development Workflow

1. Đọc SRS
2. Đọc Convention
3. Đọc ERD và Database Note
4. Thiết kế API
5. Code theo module
6. Review code
7. Viết test
8. Commit

---

# 10. Testing Convention

Unit Test phải đặt tại:

src/test/java

Không đặt test trong:

src/main/java

# Mock Data Policy

-  Mock Data chỉ dùng trong quá trình phát triển giao diện.
- Sau khi Backend API hoàn thành, Mock Data không được sử dụng làm nguồn dữ liệu chính.
- Mock Data có thể giữ lại trong thư mục `/mocks` để phục vụ Storybook, Unit Test hoặc khi Backend tạm thời không khả dụng.
- Mọi Service của Frontend phải ưu tiên gọi Backend API.
- Không được tự động fallback sang Mock Data nếu API lỗi, để tránh che giấu lỗi tích hợp.
