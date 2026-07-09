-- Seed promotions matching landing page banners
INSERT INTO promotions (code, name, description, discount_type, discount_value, minimum_order_value, maximum_discount, start_date, end_date, usage_limit, used_count, status, applicable_type)
VALUES
('HAPPYHOUR', 'HAPPY HOUR - Giảm 20% toàn bộ đồ uống', 'Nhập mã HAPPYHOUR giảm 20% cho tất cả các sản phẩm đồ uống vào khung giờ 14h - 17h hàng ngày.', 'Percentage', 20.00, 0.00, 50000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 5000, 0, 'Active', 'Category'),
('WELCOME20', 'Chào Bạn Mới - Giảm 20% đơn đầu tiên', 'Chào mừng thành viên mới đăng ký thành công Lowlands Club! Giảm 20% cho đơn hàng đầu tiên của bạn.', 'Percentage', 20.00, 0.00, 100000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 0, 'Active', 'Entire Order')
ON CONFLICT (code) DO NOTHING;

-- Map HAPPYHOUR to Coffee, Tea, and Freeze categories
INSERT INTO promotion_categories (promotion_id, category_id)
SELECT p.id, c.id
FROM promotions p, categories c
WHERE p.code = 'HAPPYHOUR' AND c.name IN ('Coffee', 'Tea', 'Freeze')
  AND NOT EXISTS (
      SELECT 1 FROM promotion_categories pc 
      WHERE pc.promotion_id = p.id AND pc.category_id = c.id
  );
