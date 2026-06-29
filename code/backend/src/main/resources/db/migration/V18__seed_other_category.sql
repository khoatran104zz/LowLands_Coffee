INSERT INTO categories (name, description, status)
SELECT 'Other', 'Other products including bread, cakes, and packaged coffee', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Other');

-- 1. Bánh Mì Que Pate
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Bánh Mì Que Pate',
       'Bánh mì que giòn tan với nhân pate béo ngậy đặc trưng miền Trung.',
       'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Other'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bánh Mì Que Pate');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'S', 19000, 'active'
FROM products p
WHERE p.name = 'Bánh Mì Que Pate'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'S');

-- 2. Bánh Phô Mai Việt Quất
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Bánh Phô Mai Việt Quất',
       'Bánh phô mai nướng mịn màng phủ xốt quả việt quất chua ngọt đậm đà.',
       'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Other'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bánh Phô Mai Việt Quất');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 35000, 'active'
FROM products p
WHERE p.name = 'Bánh Phô Mai Việt Quất'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

-- 3. Cà Phê Phin Giấy Lowlands
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Cà Phê Phin Giấy Lowlands',
       'Hộp cà phê phin giấy tiện lợi đóng gói sẵn từ Lowlands Coffee.',
       'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Other'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cà Phê Phin Giấy Lowlands');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 95000, 'active'
FROM products p
WHERE p.name = 'Cà Phê Phin Giấy Lowlands'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');
