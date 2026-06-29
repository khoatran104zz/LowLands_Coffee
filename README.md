# Lowlands Coffee - Hệ thống Thương mại Điện tử Bán Cà phê

Chào mừng đến với dự án **Lowlands Coffee** - một nền tảng website thương mại điện tử chuyên nghiệp bán cà phê trực tuyến. Dự án được lấy cảm hứng từ các chuỗi cà phê hàng đầu, kết hợp giữa nét truyền thống pha phin Việt Nam và phong cách phục vụ hiện đại, tối giản.

Dự án được thiết kế theo kiến trúc tách biệt hoàn chỉnh giữa **Frontend (Next.js)** và **Backend (Spring Boot)**.

---

## 1. Cấu trúc Thư mục Tổng quan (Workspace Structure)

Dự án được tổ chức theo cấu trúc chuẩn:

```text
root/
├── docs/                      # Tài liệu nghiệp vụ & Thiết kế
│   ├── srs.md                 # Đặc tả yêu cầu phần mềm (Software Requirements Specification)
│   ├── convention.md          # Quy chuẩn viết mã nguồn (Coding Conventions)
│   ├── UI-UX style guideline/ # Hướng dẫn thiết kế giao diện & màu sắc chủ đạo
│   └── DB-erd/                # Sơ đồ quan hệ thực thể & script khởi tạo database
├── code/                      # Mã nguồn hệ thống
│   ├── frontend/              # Frontend Next.js App Router (TypeScript)
│   └── backend/               # Backend Spring Boot (Java, Maven)
├── test/                      # Thư mục kiểm thử (Mô phỏng Jest)
└── README.md                  # Hướng dẫn khởi chạy tổng quan (File này)
```

---

## 2. Công nghệ Sử dụng (Technology Stack)

### Frontend (`code/frontend/`)
- **Framework**: Next.js 15+ (App Router) & TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **State Management**: Zustand
- **Form & Validation**: React Hook Form & Zod Resolver
- **HTTP Client**: Axios
- **Đa ngôn ngữ (i18n)**: next-intl (Tiếng Việt làm mặc định & Tiếng Anh)
- **Kiểm thử**: Jest & React Testing Library (RTL)

### Backend (`code/backend/`)
- **Framework**: Spring Boot (Java 17+, Maven)
- **Database**: SQL Schema chuẩn (bao gồm quản lý Users, Cửa hàng, Sản phẩm, Giỏ hàng, Đơn hàng, Khuyến mãi, và Kho nguyên liệu).

---

## 3. Hướng dẫn Khởi chạy Nhanh (Getting Started)

### Backend Neon PostgreSQL Environment

Backend runtime reads database and JWT settings from environment variables. Do not hardcode Neon credentials in source code.

Create a local `.env` file from the sample:

```powershell
Copy-Item .env.example .env
```

Fill these values:

```env
DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require
DB_USERNAME=<username>
DB_PASSWORD=<password>
JWT_SECRET=<your-jwt-secret>
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Notes:

- Use the Neon PostgreSQL host/database from your Neon connection string.
- Keep `sslmode=require` in `DB_URL`.
- Never commit `.env`; only `.env.example` is tracked.
- Spring Boot does not load `.env` automatically, so use the helper script below.

Run backend with Neon:

```powershell
.\scripts\run-backend-neon.ps1
```

The script loads `.env` into the current backend process, moves into `code/backend`, and runs:

```powershell
mvn spring-boot:run
```

Frontend environment must point to the Spring Boot API, not to Neon directly:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

This value is currently stored in `code/frontend/.env.local`.

## Development Commands

Run these commands from the repository root.

```powershell
npm run backend
```

Starts only the Spring Boot backend. This command loads `.env`, validates the Neon PostgreSQL environment variables, moves into `code/backend`, and runs `mvn spring-boot:run`.

```powershell
npm run frontend
```

Starts only the Next.js frontend in `code/frontend`.

```powershell
npm run dev
```

Starts backend and frontend together. The backend uses Neon PostgreSQL through environment variables. Local PostgreSQL is not required for the normal development workflow.

Compatibility aliases:

- `npm run dev:backend` calls `npm run backend`.
- `npm run dev:frontend` calls `npm run frontend`.
- `npm run start` calls `npm run dev`.

### Khởi tạo database local

Legacy local database helper. Do not use this for the Neon-backed development workflow.


```powershell
.\scripts\setup-local-db.ps1
npm install
npm run dev
```

### Bước 1: Khởi động API Backend
Để ứng dụng frontend có thể tải dữ liệu thực tế (thực đơn, toppings, đơn hàng), bạn cần khởi động Backend Server trước:
1. Di chuyển vào thư mục backend:
   ```bash
   npm run backend
   ```
2. Khởi chạy dự án Spring Boot:
   ```bash
   npm run backend
   ```
   *Mặc định API Server sẽ lắng nghe tại cổng: `http://localhost:8080/api/v1`*

For Neon-backed development, prefer:

```powershell
.\scripts\run-backend-neon.ps1
```

### Bước 2: Khởi động Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd code/frontend
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy server phát triển (Development):
   ```bash
   npm run frontend
   ```
   *Mở trình duyệt truy cập: `http://localhost:3000`*

### Chạy full project với Neon

Terminal 1:

```powershell
.\scripts\run-backend-neon.ps1
```

Terminal 2:

```powershell
cd code/frontend
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Public menu API: `http://localhost:8080/api/v1/menu`

---

## 4. Kiểm tra Chất lượng & Đóng gói (Code Quality & Build)

Các lệnh sau được thực thi trong thư mục `code/frontend/`:

### Lỗi cú pháp & Linter
Đảm bảo mã nguồn sạch lỗi, không sử dụng kiểu `any`, không hardcode text/màu sắc:
```bash
npm run lint
```

### Kiểm tra Kiểu dữ liệu
Kiểm tra biên dịch tĩnh TypeScript:
```bash
npm run type-check
```

### Chạy Unit Test
Chạy bộ Jest test kiểm thử các base components, card hiển thị và logic Zustand Cart Store:
```bash
npm run test
```

### Đóng gói Docker
Hệ thống hỗ trợ chạy bằng Docker để dễ dàng deploy lên Staging/Production:
1. Khởi động dịch vụ qua Docker Compose:
   ```bash
   docker-compose up --build
   ```
   *Frontend sẽ chạy trên cổng `3000` sử dụng Next.js Standalone Build siêu nhẹ.*

---

## 5. Các Tài liệu Quan trọng (Must-read Documents)

Trước khi thực hiện chỉnh sửa hoặc tích hợp API, vui lòng đọc kỹ các tài liệu trong thư mục `docs/`:
1. [docs/srs.md](file:///c:/Users/rosek/OneDrive/Documents/Lowlands_G10/LowLands_Coffee/docs/srs.md) để nắm rõ luồng thanh toán và chọn size/topping.
2. [docs/convention.md](file:///c:/Users/rosek/OneDrive/Documents/Lowlands_G10/LowLands_Coffee/docs/convention.md) để tuân thủ quy tắc viết code (kebab-case, PascalCase, quy tắc đa ngôn ngữ i18n).
3. [docs/UI-UX style guideline/style-guide.md](file:///c:/Users/rosek/OneDrive/Documents/Lowlands_G10/LowLands_Coffee/docs/UI-UX%20style%20guideline/style-guide.md) để xem thông tin bảng màu đất bazan và các tokens.
