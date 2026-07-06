INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000053', 'Sugar Syrup', 'ml', 3000, 'Simple sugar syrup for latte and tea recipes.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000053');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id,
       'Matcha Latte',
       'Demo product with active recipe and inventory for POS completion testing.',
       '/images/products/matcha-latte.jpg',
       'active'
FROM categories c
WHERE c.id = COALESCE(
        (SELECT MIN(id) FROM categories WHERE LOWER(name) = 'tea'),
        (SELECT MIN(id) FROM categories)
      )
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Matcha Latte');

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', 49000, 'active'
FROM products p
WHERE p.name = 'Matcha Latte'
  AND NOT EXISTS (
      SELECT 1
      FROM product_variants pv
      WHERE pv.product_id = p.id AND pv.size = 'M'
  );

INSERT INTO recipes (product_variant_id, code, name, description, status)
SELECT pv.id,
       'REC_MATCHA_LATTE_M',
       'Matcha Latte Size M',
       'Matcha powder, fresh milk, sugar syrup and ice.',
       'active'
FROM products p
JOIN product_variants pv ON pv.product_id = p.id AND pv.size = 'M'
WHERE p.name = 'Matcha Latte'
  AND NOT EXISTS (SELECT 1 FROM recipes WHERE code = 'REC_MATCHA_LATTE_M')
  AND NOT EXISTS (SELECT 1 FROM recipes WHERE product_variant_id = pv.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, recipe.quantity, i.unit
FROM recipes r
JOIN (
    SELECT 'ING000001' AS ingredient_code, 8.00 AS quantity
    UNION ALL SELECT 'ING000010', 180.00
    UNION ALL SELECT 'ING000053', 20.00
    UNION ALL SELECT 'ING000038', 120.00
) recipe ON 1 = 1
JOIN ingredients i ON i.code = recipe.ingredient_code
WHERE r.code = 'REC_MATCHA_LATTE_M'
  AND NOT EXISTS (
      SELECT 1
      FROM recipe_ingredients ri
      WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id
  );

INSERT INTO stock_movements (
    store_id,
    ingredient_id,
    movement_type,
    quantity,
    unit,
    reference_type,
    reference_id,
    note,
    created_by
)
SELECT s.id,
       i.id,
       'IN',
       stock.quantity,
       i.unit,
       'MANUAL_ADJUSTMENT',
       NULL,
       'Demo Matcha Latte opening stock',
       u.id
FROM stores s
JOIN users u ON u.id = (SELECT MIN(id) FROM users WHERE email = 'admin@lowlands.coffee')
JOIN (
    SELECT 'ING000001' AS ingredient_code, 1000.00 AS quantity
    UNION ALL SELECT 'ING000010', 10000.00
    UNION ALL SELECT 'ING000053', 5000.00
    UNION ALL SELECT 'ING000038', 20000.00
) stock ON 1 = 1
JOIN ingredients i ON i.code = stock.ingredient_code
WHERE s.id = 1
  AND NOT EXISTS (
      SELECT 1
      FROM stock_movements sm
      WHERE sm.store_id = s.id
        AND sm.ingredient_id = i.id
        AND sm.reference_type = 'MANUAL_ADJUSTMENT'
        AND sm.note = 'Demo Matcha Latte opening stock'
  );
