INSERT INTO categories (name, description, status)
SELECT 'Coffee', 'Signature coffee drinks', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Coffee');

INSERT INTO categories (name, description, status)
SELECT 'Tea', 'Tea and fruit tea drinks', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tea');

INSERT INTO categories (name, description, status)
SELECT 'Freeze', 'Ice blended drinks', 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Freeze');

INSERT INTO toppings (name, price, status)
SELECT 'Coffee Jelly', 6000, 'active'
WHERE NOT EXISTS (SELECT 1 FROM toppings WHERE name = 'Coffee Jelly');

INSERT INTO toppings (name, price, status)
SELECT 'White Pearl', 8000, 'active'
WHERE NOT EXISTS (SELECT 1 FROM toppings WHERE name = 'White Pearl');

INSERT INTO toppings (name, price, status)
SELECT 'Cheese Foam', 10000, 'active'
WHERE NOT EXISTS (SELECT 1 FROM toppings WHERE name = 'Cheese Foam');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Phin Sua Da',
       'Traditional Vietnamese phin coffee with condensed milk.',
       'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Coffee'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Phin Sua Da');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Bac Xiu',
       'A smooth coffee drink with fresh milk and condensed milk.',
       'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Coffee'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bac Xiu');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Golden Lotus Tea',
       'Oolong tea with lotus seed and a refreshing floral finish.',
       'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Tea'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Golden Lotus Tea');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Green Tea Freeze',
       'Ice blended matcha green tea with creamy topping.',
       'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=800',
       'active'
FROM categories c
WHERE c.name = 'Freeze'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Green Tea Freeze');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'S', 29000, 'active'
FROM products p
WHERE p.name = 'Phin Sua Da'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'S');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 35000, 'active'
FROM products p
WHERE p.name = 'Phin Sua Da'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 39000, 'active'
FROM products p
WHERE p.name = 'Phin Sua Da'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'S', 32000, 'active'
FROM products p
WHERE p.name = 'Bac Xiu'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'S');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 39000, 'active'
FROM products p
WHERE p.name = 'Bac Xiu'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 45000, 'active'
FROM products p
WHERE p.name = 'Bac Xiu'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 45000, 'active'
FROM products p
WHERE p.name = 'Golden Lotus Tea'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 52000, 'active'
FROM products p
WHERE p.name = 'Golden Lotus Tea'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 55000, 'active'
FROM products p
WHERE p.name = 'Green Tea Freeze'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'L', 65000, 'active'
FROM products p
WHERE p.name = 'Green Tea Freeze'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'L');

INSERT INTO product_toppings (product_id, topping_id)
SELECT p.id, t.id
FROM products p
JOIN toppings t ON t.name IN ('Coffee Jelly', 'White Pearl')
WHERE p.name IN ('Phin Sua Da', 'Bac Xiu')
  AND NOT EXISTS (
      SELECT 1 FROM product_toppings pt
      WHERE pt.product_id = p.id AND pt.topping_id = t.id
  );

INSERT INTO product_toppings (product_id, topping_id)
SELECT p.id, t.id
FROM products p
JOIN toppings t ON t.name IN ('White Pearl', 'Cheese Foam')
WHERE p.name IN ('Golden Lotus Tea', 'Green Tea Freeze')
  AND NOT EXISTS (
      SELECT 1 FROM product_toppings pt
      WHERE pt.product_id = p.id AND pt.topping_id = t.id
  );
