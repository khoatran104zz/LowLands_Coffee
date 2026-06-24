# Backlog Sprint 1 - Lowlands Coffee

## Mục tiêu Sprint 1
Thiết lập toàn bộ khung dự án (Next.js, Tailwind, shadcn/ui), cấu hình i18n, các store Zustand quản lý trạng thái, service layer Axios, thiết kế hệ thống Logo thương hiệu và xây dựng các Component dùng chung (Base Components).

## Danh sách công việc (Tasks List)

### 1. Project Initialization & Tooling Setup
- [ ] Khởi tạo dự án Next.js (App Router, TS, ESLint, Prettier, Tailwind).
- [ ] Cài đặt các thư viện lõi: Zustand, next-intl, axios, framer-motion, react-hook-form, zod, lucide-react.
- [ ] Cấu hình ESLint nghiêm ngặt (cấm hardcode text, unused imports, any).
- [ ] Thiết lập Tailwind config và CSS variables theo tài liệu `style-guide.md`.

### 2. Branding Assets (Logo & Favicon)
- [ ] Thiết kế Logo chính `logo.svg` của Lowlands Coffee.
- [ ] Thiết kế Logo rút gọn `logo-icon.svg`.
- [ ] Thiết kế Favicon `favicon.svg`.

### 3. Core Architecture
- [ ] Cấu hình đa ngôn ngữ `next-intl` (Middlewares, i18n config, dynamic navigation, các file `vi.json` và `en.json`).
- [ ] Khởi tạo Zustand Store cho Giỏ hàng (`cart.store.ts`) và Đăng nhập (`auth.store.ts`).
- [ ] Khởi tạo Axios Instance và các Service layer (`product.service.ts`, `order.service.ts`, `auth.service.ts`).

### 4. Base Components
- [ ] Tạo Base Button (chức năng tải, kích thước, biến thể màu sắc).
- [ ] Tạo Base Input, Checkbox, Select, Dialog/Modal.
- [ ] Xây dựng khung Layout chính (Header, Footer, Navbar hỗ trợ đổi ngôn ngữ).
