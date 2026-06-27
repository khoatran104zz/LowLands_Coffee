INSERT INTO categories (name, description, status)
SELECT 'Coffee', 'Coffee drinks', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Coffee');

INSERT INTO categories (name, description, status)
SELECT 'Tea', 'Tea drinks', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tea');

INSERT INTO toppings (name, price, status)
SELECT 'Trân Châu', 8000, 'active'
WHERE NOT EXISTS (SELECT 1 FROM toppings WHERE name = 'Trân Châu');

INSERT INTO toppings (name, price, status)
SELECT 'Coffee Jelly', 6000, 'active'
WHERE NOT EXISTS (SELECT 1 FROM toppings WHERE name = 'Coffee Jelly');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Phin Sữa Đá',
       'Cà phê phin Việt Nam pha cùng sữa đặc và đá.',
       'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Coffee'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Phin Sữa Đá');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Latte',
       'Espresso kết hợp sữa tươi đánh nóng mềm mịn.',
       'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Coffee'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Latte');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Trà Đào',
       'Trà đào thanh mát với hương trái cây dịu nhẹ.',
       'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Tea'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Đào');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 35000, 'active'
FROM products p
WHERE p.name = 'Phin Sữa Đá'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 42000, 'active'
FROM products p
WHERE p.name = 'Phin Sữa Đá'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 45000, 'active'
FROM products p
WHERE p.name = 'Latte'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 52000, 'active'
FROM products p
WHERE p.name = 'Latte'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 39000, 'active'
FROM products p
WHERE p.name = 'Trà Đào'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 46000, 'active'
FROM products p
WHERE p.name = 'Trà Đào'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_toppings (product_id, topping_id)
SELECT p.id, t.id
FROM products p
JOIN toppings t ON t.name IN ('Trân Châu', 'Coffee Jelly')
WHERE p.name IN ('Phin Sữa Đá', 'Latte', 'Trà Đào')
  AND NOT EXISTS (
      SELECT 1 FROM product_toppings pt
      WHERE pt.product_id = p.id AND pt.topping_id = t.id
  );
