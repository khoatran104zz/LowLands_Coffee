-- Ensure migration-level actor and store exist before opening stock movements.
-- Runtime bootstrap still keeps the same admin/store idempotently.
INSERT INTO users (full_name, email, phone, password, role_id, status)
SELECT 'Lowlands Admin',
       'admin@lowlands.coffee',
       '0900000001',
       '$2a$10$KcAcW3m0IKvTsUuiAk2LoeeMEG7bgV7bnk9orGepeRRPEssgshCGa',
       r.id,
       'ACTIVE'
FROM roles r
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@lowlands.coffee');

INSERT INTO stores (name, address, phone, status)
SELECT 'Lowlands Coffee - Default Store',
       '1 Nguyen Hue, District 1, Ho Chi Minh City',
       '02838224466',
       'active'
WHERE NOT EXISTS (SELECT 1 FROM stores);

-- Additional operational ingredients needed by food/package recipes.
INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000054', 'Baguette', 'piece', 200, 'Small baguette used for banh mi products.', 'active'
FROM ingredient_categories c
WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000054');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000055', 'Pate', 'g', 3000, 'Pate filling for banh mi products.', 'active'
FROM ingredient_categories c
WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000055');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000056', 'Cream Cheese', 'g', 3000, 'Cream cheese base for cheesecake products.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000056');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000057', 'Blueberry Sauce', 'g', 2000, 'Blueberry sauce for cheesecake products.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000057');

-- Every active variant must have exactly one active recipe.
INSERT INTO recipes (product_variant_id, code, name, description, status)
SELECT pv.id,
       'REC_AUTO_' || pv.id,
       p.name || ' Size ' || pv.size,
       'Master data recipe for POS availability and order completion.',
       'active'
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
WHERE pv.status = 'active'
  AND p.status = 'active'
  AND c.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM recipes r WHERE r.product_variant_id = pv.id);

-- Coffee recipes: latte-style variants.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 22.00 WHEN 'S' THEN 14.00 ELSE 18.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000002'
WHERE r.status = 'active'
  AND c.name = 'Coffee'
  AND p.name LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 240.00 WHEN 'S' THEN 140.00 ELSE 180.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active'
  AND c.name = 'Coffee'
  AND p.name LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Coffee recipes: phin and bac xiu variants.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 20.00 WHEN 'S' THEN 12.00 ELSE 16.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000004'
WHERE r.status = 'active'
  AND c.name = 'Coffee'
  AND p.name NOT LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 45.00 WHEN 'S' THEN 25.00 ELSE 35.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000011'
WHERE r.status = 'active'
  AND c.name = 'Coffee'
  AND p.name NOT LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 160.00 WHEN 'S' THEN 80.00 ELSE 120.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active'
  AND c.name = 'Coffee'
  AND p.name LIKE '%Bac Xiu%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Tea recipes.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 16.00 WHEN 'S' THEN 8.00 ELSE 12.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000007'
WHERE r.status = 'active'
  AND c.name = 'Tea'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 40.00 WHEN 'S' THEN 20.00 ELSE 30.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE r.status = 'active'
  AND c.name = 'Tea'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Freeze recipes.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 14.00 WHEN 'S' THEN 8.00 ELSE 10.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000001'
WHERE r.status = 'active'
  AND c.name = 'Freeze'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 240.00 WHEN 'S' THEN 140.00 ELSE 180.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active'
  AND c.name = 'Freeze'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 35.00 WHEN 'S' THEN 20.00 ELSE 25.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE r.status = 'active'
  AND c.name = 'Freeze'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Ice for all beverage recipes.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 180.00 WHEN 'S' THEN 100.00 ELSE 140.00 END,
       i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000038'
WHERE r.status = 'active'
  AND c.name IN ('Coffee', 'Tea', 'Freeze')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Other product recipes.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000054'
WHERE r.status = 'active'
  AND c.name = 'Other'
  AND pv.price = 19000
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 40.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000055'
WHERE r.status = 'active'
  AND c.name = 'Other'
  AND pv.price = 19000
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 80.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000056'
WHERE r.status = 'active'
  AND c.name = 'Other'
  AND pv.price = 35000
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 25.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000057'
WHERE r.status = 'active'
  AND c.name = 'Other'
  AND pv.price = 35000
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 250.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000004'
WHERE r.status = 'active'
  AND c.name = 'Other'
  AND pv.price = 95000
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 10.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000051'
WHERE r.status = 'active'
  AND c.name = 'Other'
  AND pv.price = 95000
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Combo recipes mirror their component consumption because order completion does not expand combo_items.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, combo.quantity, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN (
    SELECT 49000 AS price, 'ING000004' AS code, 16.00 AS quantity
    UNION ALL SELECT 49000, 'ING000011', 35.00
    UNION ALL SELECT 49000, 'ING000038', 140.00
    UNION ALL SELECT 49000, 'ING000054', 1.00
    UNION ALL SELECT 49000, 'ING000055', 40.00
    UNION ALL SELECT 59000, 'ING000004', 16.00
    UNION ALL SELECT 59000, 'ING000011', 35.00
    UNION ALL SELECT 59000, 'ING000007', 12.00
    UNION ALL SELECT 59000, 'ING000053', 30.00
    UNION ALL SELECT 59000, 'ING000038', 280.00
    UNION ALL SELECT 69000, 'ING000002', 18.00
    UNION ALL SELECT 69000, 'ING000010', 180.00
    UNION ALL SELECT 69000, 'ING000056', 80.00
    UNION ALL SELECT 69000, 'ING000057', 25.00
) combo ON combo.price = pv.price
JOIN ingredients i ON i.code = combo.code
WHERE r.status = 'active'
  AND c.name = 'Combo'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Packaging for beverages and combos.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE c.name WHEN 'Combo' THEN 2.00 ELSE 1.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000042'
WHERE r.status = 'active'
  AND c.name IN ('Coffee', 'Tea', 'Freeze', 'Combo')
  AND pv.size <> 'L'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000043'
WHERE r.status = 'active'
  AND c.name IN ('Coffee', 'Tea', 'Freeze')
  AND pv.size = 'L'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE c.name WHEN 'Combo' THEN 2.00 ELSE 1.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000046'
WHERE r.status = 'active'
  AND c.name IN ('Coffee', 'Tea', 'Freeze', 'Combo')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE c.name WHEN 'Combo' THEN 2.00 ELSE 1.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000048'
WHERE r.status = 'active'
  AND c.name IN ('Coffee', 'Tea', 'Freeze', 'Combo')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Packaging for food/package items and combos that include food/package components.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000049'
WHERE r.status = 'active'
  AND (
      c.name = 'Other'
      OR (c.name = 'Combo' AND pv.price IN (49000, 69000))
  )
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Opening stock for every ingredient that has never had stock movement.
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
       CASE
           WHEN i.unit = 'ml' THEN 50000.00
           WHEN i.unit = 'g' THEN 20000.00
           WHEN i.unit = 'piece' THEN 2000.00
           WHEN i.unit = 'portion' THEN 500.00
           ELSE 10000.00
       END,
       i.unit,
       'MANUAL_ADJUSTMENT',
       NULL,
       'Master data opening stock V32',
       u.id
FROM ingredients i
JOIN stores s ON s.id = (SELECT MIN(id) FROM stores)
JOIN users u ON u.email = 'admin@lowlands.coffee'
WHERE NOT EXISTS (
    SELECT 1
    FROM stock_movements sm
    WHERE sm.ingredient_id = i.id
);
