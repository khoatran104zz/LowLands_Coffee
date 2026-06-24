# UI/UX Style Guideline - Lowlands Coffee

Tài liệu định hướng thiết kế giao diện, trải nghiệm người dùng và hệ thống Design Tokens cho thương hiệu **Lowlands Coffee**.

## 1. Brand Identity & Feeling
- **Premium**: Giao diện sang trọng, tối giản, khoảng trắng rộng rãi, tinh tế.
- **Modern**: Phong cách thiết kế đương đại, bo góc mềm mại, đổ bóng nhẹ.
- **Vietnamese Coffee Culture**: Gợi nhớ màu sắc đất đỏ Tây Nguyên, hạt cà phê chín, và hạt nắng vàng.
- **Warm & Minimal**: Sử dụng các tông màu ấm cúng, gần gũi thiên nhiên, không rườm rà.

---

## 2. Hệ màu sắc (Color Palette)

Hệ màu sắc được ánh xạ vào Tailwind CSS thông qua biến CSS variables (HSL) để hỗ trợ dark/light mode hoặc tùy chỉnh chủ đề dễ dàng.

| Vai trò | Tên Token | Mã màu HSL (Mẫu) | Mô tả |
| :--- | :--- | :--- | :--- |
| **Primary** | `coffee-brown` | `hsl(19, 47%, 18%)` | Màu nâu cà phê đậm đà làm chủ đạo cho thương hiệu. |
| **Secondary**| `cream` | `hsl(43, 60%, 96%)` | Màu kem ấm áp làm nền hoặc các khối bổ trợ. |
| **Accent** | `gold` | `hsl(38, 55%, 64%)` | Màu vàng kim loại sang trọng cho nút nhấn nổi bật, viền, icon đặc biệt. |
| **Foreground**| `foreground` | `hsl(20, 20%, 12%)` | Màu chữ chính, xám đen ấm để dịu mắt. |
| **Muted** | `muted` | `hsl(20, 10%, 45%)` | Màu chữ phụ, mô tả sản phẩm hoặc trạng thái phụ. |

---

## 3. Typography (Hệ Phông Chữ)
- **Font chính**: `Inter` hoặc `Outfit` (tải từ Google Fonts).
  - `Outfit`: Sử dụng cho các tiêu đề lớn (`h1`, `h2`, `h3`) mang lại cảm giác hiện đại, phóng khoáng nhưng sang trọng.
  - `Inter`: Sử dụng cho phần nội dung hiển thị (body text), bảng biểu, form để đạt độ đọc tốt nhất trên mọi màn hình.
- **Sizes & Weights**:
  - Tiêu đề Hero: `font-extrabold text-4xl md:text-6xl tracking-tight`
  - Tiêu đề danh mục: `font-bold text-2xl md:text-3xl`
  - Body text: `font-normal text-sm md:text-base`

---

## 4. Bố cục & Responsive (Layout & Responsive Grid)
- **Mobile First**: Thiết kế mặc định cho các màn hình di động nhỏ, sau đó mở rộng cho tablet (`md: 768px`) và desktop (`lg: 1024px`, `xl: 1280px`).
- **Container**: Khoảng đệm lề hai bên màn hình:
  - Mobile: `px-4`
  - Tablet & Desktop: `px-8 mx-auto max-w-7xl`
- **Product Grid**:
  - Mobile: 1 - 2 cột.
  - Tablet: 3 cột.
  - Desktop: 4 cột.

---

## 5. Hiệu ứng chuyển động (Animations)
Sử dụng thư viện `framer-motion` để tạo các chuyển động mượt mà (micro-interactions):
- **Hover Button**: Tăng nhẹ kích thước (`scale: 1.02`), thay đổi độ sáng màu sắc nhẹ nhàng (`duration: 0.2`).
- **Page Transition**: Hiệu ứng chuyển trang fade-in nhẹ nhàng khi người dùng di chuyển giữa các route.
- **Cart Sheet**: Slide-in từ cạnh phải màn hình khi mở giỏ hàng nhanh.
