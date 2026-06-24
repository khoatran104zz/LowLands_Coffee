# Backlog Sprint 2 - Lowlands Coffee

## Mục tiêu Sprint 2
Xây dựng đầy đủ các trang nghiệp vụ phía người dùng (Home, Menu, Detail, Cart, Checkout, Auth, Profile), thiết lập các chốt chặn chất lượng (Husky pre-commit hook, Jest & RTL testing) và đóng gói ứng dụng (Docker).

## Danh sách công việc (Tasks List)

### 1. App Pages & Business Logic
- [ ] Xây dựng trang chủ `/`: Banner, Featured Products, Store Locator (UI tìm kiếm cửa hàng), About Brand.
- [ ] Xây dựng trang danh mục thực đơn `/menu`: Bộ lọc danh mục, Tìm kiếm, lưới sản phẩm, Loading Skeleton.
- [ ] Xây dựng trang chi tiết `/menu/[id]`: Tải động chi tiết sản phẩm, chọn size, thêm topping tăng giá sản phẩm, nút Thêm vào giỏ.
- [ ] Xây dựng trang giỏ hàng `/cart`: Xem danh sách, đổi số lượng, xóa sản phẩm, nhập mã giảm giá.
- [ ] Xây dựng trang thanh toán `/checkout`: Form điền địa chỉ giao hàng và phương thức thanh toán có Zod validation.
- [ ] Xây dựng trang Auth: Login UI (`/login`), Register UI (`/register`), Profile UI (`/profile`).
- [ ] Tạo cấu trúc thư mục Admin Placeholder (`/components/features/admin`).

### 2. Quality Assurance & Tests
- [ ] Thiết lập Husky hook `pre-commit` chạy linting và typecheck.
- [ ] Viết bộ Unit Test cho component Button và ProductCard.
- [ ] Viết bộ Unit Test kiểm tra logic tính toán của Zustand Cart Store (cộng trừ số lượng, tính tổng tiền, topping).

### 3. Docker & Deployment
- [ ] Viết `Dockerfile` tối ưu hóa kích thước ảnh thông qua multi-stage build.
- [ ] Viết `docker-compose.yml` để dễ dàng khởi động môi trường local.
- [ ] Viết `.dockerignore` để tránh sao chép các file thừa.
- [ ] Kiểm thử build môi trường Production Next.js không có lỗi TypeScript/ESLint.
