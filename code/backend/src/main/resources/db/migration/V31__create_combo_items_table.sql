-- 1. Create combo_items table
CREATE TABLE combo_items (
    combo_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    CONSTRAINT fk_combo_items_combo FOREIGN KEY (combo_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_combo_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT pk_combo_items PRIMARY KEY (combo_id, product_id)
);

-- 2. Insert Category 'Combo'
INSERT INTO categories (name, description, status)
SELECT 'Combo', 'Special combos combining drinks and delicious snacks at discounted prices', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Combo');

-- 3. Insert Combo Products
-- 3.1. Combo Buổi Sáng (Phin Sữa Đá + Bánh Mì Que Pate) - Price: 49,000đ
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Combo Buổi Sáng',
       'Bữa sáng trọn vẹn kiểu Việt: bánh mì giòn tan kết hợp cùng ly Phin Sữa Đá truyền thống thơm ngon đậm đà.',
       'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Combo'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Buổi Sáng');

-- 3.2. Combo Đôi Bạn (Phin Sữa Đá + Trà Đào) - Price: 59,000đ
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Combo Đôi Bạn',
       'Bộ đôi thanh mát và tỉnh táo: 1 ly Phin Sữa Đá đậm đà truyền thống và 1 ly Trà Đào thanh mát ngọt ngào.',
       'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Combo'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Đôi Bạn');

-- 3.3. Combo Chiều Ngọt Ngào (Latte + Bánh Phô Mai Việt Quất) - Price: 69,000đ
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Combo Chiều Ngọt Ngào',
       'Khoảnh khắc ngọt ngào thư giãn: 1 ly Latte ấm áp quyện cùng 1 lát bánh phô mai việt quất chua ngọt thơm ngậy.',
       'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Combo'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Chiều Ngọt Ngào');

-- 4. Add Variants (Price) for Combo Products
-- 4.1. Combo Buổi Sáng - Size M (49,000đ)
INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 49000, 'active'
FROM products p
WHERE p.name = 'Combo Buổi Sáng'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

-- 4.2. Combo Đôi Bạn - Size M (59,000đ)
INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 59000, 'active'
FROM products p
WHERE p.name = 'Combo Đôi Bạn'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

-- 4.3. Combo Chiều Ngọt Ngào - Size M (69,000đ)
INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 69000, 'active'
FROM products p
WHERE p.name = 'Combo Chiều Ngọt Ngào'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

-- 5. Add items to combo_items map
-- 5.1. Combo Buổi Sáng (Phin Sữa Đá + Bánh Mì Que Pate)
INSERT INTO combo_items (combo_id, product_id)
SELECT p_combo.id, p_item.id
FROM products p_combo, products p_item
WHERE p_combo.name = 'Combo Buổi Sáng'
  AND p_item.name IN ('Phin Sữa Đá', 'Bánh Mì Que Pate')
  AND NOT EXISTS (
      SELECT 1 FROM combo_items ci 
      WHERE ci.combo_id = p_combo.id AND ci.product_id = p_item.id
  );

-- 5.2. Combo Đôi Bạn (Phin Sữa Đá + Trà Đào)
INSERT INTO combo_items (combo_id, product_id)
SELECT p_combo.id, p_item.id
FROM products p_combo, products p_item
WHERE p_combo.name = 'Combo Đôi Bạn'
  AND p_item.name IN ('Phin Sữa Đá', 'Trà Đào')
  AND NOT EXISTS (
      SELECT 1 FROM combo_items ci 
      WHERE ci.combo_id = p_combo.id AND ci.product_id = p_item.id
  );

-- 5.3. Combo Chiều Ngọt Ngào (Latte + Bánh Phô Mai Việt Quất)
INSERT INTO combo_items (combo_id, product_id)
SELECT p_combo.id, p_item.id
FROM products p_combo, products p_item
WHERE p_combo.name = 'Combo Chiều Ngọt Ngào'
  AND p_item.name IN ('Latte', 'Bánh Phô Mai Việt Quất')
  AND NOT EXISTS (
      SELECT 1 FROM combo_items ci 
      WHERE ci.combo_id = p_combo.id AND ci.product_id = p_item.id
  );
