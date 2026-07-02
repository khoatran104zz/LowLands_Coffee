# Lowlands Coffee ☕

Hệ thống quản lý chuỗi cà phê — tích hợp đặt hàng trực tuyến, quản lý kho, ca làm việc và báo cáo doanh thu theo chi nhánh.

Kiến trúc tách biệt hoàn toàn giữa **Frontend (Next.js)** và **Backend (Spring Boot)**, kết nối database **Neon PostgreSQL** trên cloud.

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cấu trúc dự án](#2-cấu-trúc-dự-án)
3. [Công nghệ sử dụng](#3-công-nghệ-sử-dụng)
4. [Cấu hình môi trường](#4-cấu-hình-môi-trường)
5. [Hướng dẫn chạy dự án](#5-hướng-dẫn-chạy-dự-án)
6. [Các lệnh hữu ích](#6-các-lệnh-hữu-ích)
7. [Địa chỉ truy cập](#7-địa-chỉ-truy-cập)
8. [Tài liệu tham khảo](#8-tài-liệu-tham-khảo)

---

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| **Node.js** | 18+ |
| **Java JDK** | 21+ |
| **Maven** | 3.9+ (hoặc dùng `mvnw` đi kèm) |
| **Git** | bất kỳ |

> **Lưu ý:** Dự án dùng **Neon PostgreSQL** trên cloud — không cần cài PostgreSQL local.

---

## 2. Cấu trúc dự án

```
LowLands_Coffee/
├── code/
│   ├── frontend/          # Next.js 16 + TypeScript (App Router)
│   └── backend/           # Spring Boot 4 + Java 21 (Maven)
├── docs/                  # Tài liệu nghiệp vụ & thiết kế
│   ├── srs.md             # Đặc tả yêu cầu phần mềm
│   ├── convention.md      # Quy chuẩn viết code
│   ├── api-contract/      # Hợp đồng API giữa FE và BE
│   ├── DB-erd/            # Sơ đồ ERD & script database
│   └── UI-UX style guideline/
├── scripts/               # Script tiện ích
│   ├── run-backend-neon.js   # Chạy backend (load .env)
│   ├── run-dev.js            # Chạy cả frontend + backend
│   └── run-backend-neon.ps1  # Phiên bản PowerShell
├── .env.example           # Mẫu biến môi trường
├── package.json           # Root scripts (npm run dev/backend/frontend)
└── README.md
```

---

## 3. Công nghệ sử dụng

### Frontend (`code/frontend/`)

| Thư viện | Mục đích |
|---|---|
| Next.js 16 (App Router) | Framework chính |
| React 19 + TypeScript | UI & type safety |
| Tailwind CSS v4 + shadcn/ui | Styling & component |
| Zustand | State management |
| React Hook Form + Zod | Form & validation |
| Axios | HTTP client |
| next-intl | Đa ngôn ngữ (VI / EN) |
| Framer Motion | Animation |
| Jest + React Testing Library | Unit test |

### Backend (`code/backend/`)

| Thư viện | Mục đích |
|---|---|
| Spring Boot 4 (Java 21) | Framework chính |
| Spring Security + JWT (JJWT) | Xác thực & phân quyền |
| Spring Data JPA + Flyway | ORM & migration DB |
| Neon PostgreSQL | Database cloud |
| MapStruct + Lombok | Code generation |
| SpringDoc OpenAPI | Swagger UI |

---

## 4. Cấu hình môi trường

### Bước 1 — Tạo file `.env` từ mẫu

```powershell
# Chạy từ thư mục gốc (LowLands_Coffee/)
Copy-Item .env.example .env
```

### Bước 2 — Điền thông tin vào `.env`

```env
# Neon PostgreSQL (lấy từ Neon dashboard > Connection string)
DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require
DB_USERNAME=<username>
DB_PASSWORD=<password>

# JWT Secret (chuỗi bất kỳ, đủ dài)
JWT_SECRET=<your-jwt-secret-key>

# URL API backend (không thay đổi nếu chạy local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

> ⚠️ **Không commit file `.env`** — chỉ `.env.example` được track bởi Git.

### Frontend environment

File `code/frontend/.env.local` cũng cần có:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

*(File này thường đã có sẵn, không cần tạo lại.)*

---

## 5. Hướng dẫn chạy dự án

### Cách 1 — Chạy cả hai cùng lúc (khuyến nghị)

```powershell
# Từ thư mục gốc
npm install
npm run dev
```

Lệnh này khởi động backend và frontend song song.

---

### Cách 2 — Chạy riêng từng phần

**Terminal 1 — Backend:**

```powershell
npm run backend
```

Script tự động load `.env`, di chuyển vào `code/backend/` và chạy:
```
mvn spring-boot:run
```
Backend lắng nghe tại: `http://localhost:8080`

---

**Terminal 2 — Frontend:**

```powershell
npm run frontend
```

Script chạy `next dev` trong `code/frontend/`.  
Frontend lắng nghe tại: `http://localhost:3000`

---

### Cách 3 — Chạy script PowerShell trực tiếp

```powershell
# Backend
.\scripts\run-backend-neon.ps1

# Frontend (terminal mới)
cd code/frontend
npm run dev
```

---

## 6. Các lệnh hữu ích

Tất cả lệnh dưới đây chạy từ **thư mục gốc** trừ khi có ghi chú khác.

### Root scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy cả backend + frontend |
| `npm run backend` | Chỉ chạy backend |
| `npm run frontend` | Chỉ chạy frontend |
| `npm run start` | Alias của `npm run dev` |
| `npm run dev:backend` | Alias của `npm run backend` |
| `npm run dev:frontend` | Alias của `npm run frontend` |

### Frontend scripts (chạy trong `code/frontend/`)

| Lệnh | Mô tả |
|---|---|
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run type-check` | Kiểm tra kiểu TypeScript |
| `npm run test` | Chạy unit test với Jest |
| `npm run build` | Build production |

---

## 7. Địa chỉ truy cập

| Địa chỉ | Mô tả |
|---|---|
| `http://localhost:3000` | Giao diện web (Frontend) |
| `http://localhost:3000/vi` | Trang chủ tiếng Việt |
| `http://localhost:3000/vi/admin/dashboard` | Dashboard Admin |
| `http://localhost:3000/vi/manager/dashboard` | Dashboard Manager |
| `http://localhost:8080/api/v1` | REST API Backend |
| `http://localhost:8080/swagger-ui/index.html` | Swagger API Docs |

---

## 8. Tài liệu tham khảo

| Tài liệu | Mô tả |
|---|---|
| [docs/srs.md](docs/srs.md) | Đặc tả yêu cầu phần mềm |
| [docs/convention.md](docs/convention.md) | Quy chuẩn viết code (naming, i18n, ...) |
| [docs/api-contract/](docs/api-contract/) | Hợp đồng API FE ↔ BE |
| [docs/DB-erd/](docs/DB-erd/) | Sơ đồ ERD & migration scripts |
| [docs/UI-UX style guideline/](docs/UI-UX%20style%20guideline/) | Design tokens & bảng màu |
| [docs/system-permission-matrix.md](docs/system-permission-matrix.md) | Ma trận phân quyền theo vai trò |
