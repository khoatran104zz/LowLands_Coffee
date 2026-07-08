-- V50: Seed recipes and recipe_ingredients for new products added in V41,
--      plus new specialty ingredients needed for those recipes.
--      All inserts are idempotent (NOT EXISTS guards).

-- ─── NEW SPECIALTY INGREDIENTS ────────────────────────────────────────────────

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000060', 'Peach Puree', 'ml', 3000, 'Peach purée for trà đào cam sả.', 'active'
FROM ingredient_categories c WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000060');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000061', 'Longan', 'g', 2000, 'Dried longan for trà nhãn.', 'active'
FROM ingredient_categories c WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000061');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000062', 'Mango Puree', 'ml', 3000, 'Mango purée for trà xoài.', 'active'
FROM ingredient_categories c WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000062');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000063', 'Oreo Crumble', 'g', 2000, 'Crushed Oreo for freeze cookies & cream.', 'active'
FROM ingredient_categories c WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000063');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000064', 'Golden Lotus Tea', 'g', 1500, 'Golden lotus tea leaves for trà sen vàng.', 'active'
FROM ingredient_categories c WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000064');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000065', 'Espresso Shot', 'ml', 5000, 'Brewed espresso shot for americano and espresso drinks.', 'active'
FROM ingredient_categories c WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000065');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000066', 'Tiramisu Base', 'g', 2000, 'Tiramisu cream and biscuit base.', 'active'
FROM ingredient_categories c WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000066');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000067', 'Croissant', 'piece', 200, 'Butter croissant (bánh sừng bò).', 'active'
FROM ingredient_categories c WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000067');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000068', 'Saigon Bread', 'piece', 200, 'Traditional Saigon-style bánh mì loaf.', 'active'
FROM ingredient_categories c WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000068');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000069', 'Cheese Stick Dough', 'g', 3000, 'Pre-mixed dough for bánh mì que phô mai.', 'active'
FROM ingredient_categories c WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000069');

-- Opening stock for new ingredients
INSERT INTO stock_movements (store_id, ingredient_id, movement_type, quantity, unit, reference_type, reference_id, note, created_by)
SELECT s.id, i.id, 'IN',
       CASE WHEN i.unit = 'ml' THEN 30000.00 WHEN i.unit = 'g' THEN 15000.00 ELSE 500.00 END,
       i.unit, 'MANUAL_ADJUSTMENT', NULL, 'Opening stock V50', u.id
FROM ingredients i
JOIN stores s ON s.id = (SELECT MIN(id) FROM stores)
JOIN users u ON u.email = 'admin@lowlands.coffee'
WHERE i.code IN ('ING000060','ING000061','ING000062','ING000063','ING000064',
                 'ING000065','ING000066','ING000067','ING000068','ING000069')
  AND NOT EXISTS (SELECT 1 FROM stock_movements sm WHERE sm.ingredient_id = i.id);

-- ─── AUTO-CREATE MISSING RECIPES FOR ALL ACTIVE VARIANTS ─────────────────────
-- (Same idempotent pattern as V32 — covers V41 new products)

INSERT INTO recipes (product_variant_id, code, name, description, status)
SELECT pv.id,
       'REC_AUTO_' || pv.id,
       p.name || ' Size ' || pv.size,
       'Auto-generated recipe V50.',
       'active'
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
WHERE pv.status = 'active'
  AND p.status = 'active'
  AND c.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM recipes r WHERE r.product_variant_id = pv.id);

-- ─── COFFEE RECIPES ───────────────────────────────────────────────────────────

-- Espresso / Americano: espresso shot + water + ice
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 60.00 WHEN 'S' THEN 30.00 ELSE 45.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000065'
WHERE r.status = 'active' AND c.name = 'Coffee'
  AND (p.name LIKE '%Espresso%' OR p.name LIKE '%Americano%')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 200.00 WHEN 'S' THEN 100.00 ELSE 150.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000041'
WHERE r.status = 'active' AND c.name = 'Coffee'
  AND p.name LIKE '%Americano%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Cappuccino: espresso + steamed milk + milk foam
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 45.00 WHEN 'S' THEN 25.00 ELSE 35.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000065'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Cappuccino%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 160.00 WHEN 'S' THEN 80.00 ELSE 120.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Cappuccino%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Caramel Macchiato: espresso + milk + caramel syrup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 35.00 WHEN 'S' THEN 18.00 ELSE 25.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000065'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Caramel%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 180.00 WHEN 'S' THEN 100.00 ELSE 140.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Caramel%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 30.00 WHEN 'S' THEN 15.00 ELSE 20.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000017'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Caramel%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Mocha: espresso + milk + chocolate sauce
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 35.00 WHEN 'S' THEN 18.00 ELSE 25.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000065'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Mocha%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 180.00 WHEN 'S' THEN 100.00 ELSE 140.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Mocha%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 25.00 WHEN 'S' THEN 12.00 ELSE 18.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000020'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Mocha%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Generic Robusta (Phin, Bac Xiu) — any coffee not yet having ING000004
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 20.00 WHEN 'S' THEN 12.00 ELSE 16.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000004'
WHERE r.status = 'active' AND c.name = 'Coffee'
  AND p.name NOT LIKE '%Espresso%' AND p.name NOT LIKE '%Americano%'
  AND p.name NOT LIKE '%Cappuccino%' AND p.name NOT LIKE '%Caramel%'
  AND p.name NOT LIKE '%Mocha%' AND p.name NOT LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Condensed milk for Phin Sữa Đá, Bạc Xỉu
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 45.00 WHEN 'S' THEN 25.00 ELSE 35.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000011'
WHERE r.status = 'active' AND c.name = 'Coffee'
  AND (p.name LIKE '%Phin%' OR p.name LIKE '%Bac Xiu%' OR p.name LIKE '%Bạc Xỉu%')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Fresh milk for latte-style
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 220.00 WHEN 'S' THEN 130.00 ELSE 180.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 22.00 WHEN 'S' THEN 14.00 ELSE 18.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000002'
WHERE r.status = 'active' AND c.name = 'Coffee' AND p.name LIKE '%Latte%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- ─── TEA RECIPES ──────────────────────────────────────────────────────────────

-- Trà Sen Vàng: golden lotus tea + honey
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 16.00 WHEN 'S' THEN 8.00 ELSE 12.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000064'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Sen%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 20.00 WHEN 'S' THEN 10.00 ELSE 15.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000040'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Sen%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Trà Đào Cam Sả: peach purée + oolong + lemon
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 80.00 WHEN 'S' THEN 45.00 ELSE 60.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000060'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Đào%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 12.00 WHEN 'S' THEN 6.00 ELSE 9.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000007'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Đào%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Trà Vải / Trà Nhãn: fruit + oolong base
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 60.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000029'   -- Lychee
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Vải%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 60.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000061'   -- Longan
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Nhãn%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Trà Xoài
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 80.00 WHEN 'S' THEN 45.00 ELSE 60.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000062'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Xoài%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Ô Long Kem Cheese: oolong + cheese foam
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 12.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000007'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Long%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000036'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Long%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Trà Sữa Matcha: matcha + black pearl + milk
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 14.00 WHEN 'S' THEN 8.00 ELSE 10.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000001'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Matcha%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 200.00 WHEN 'S' THEN 120.00 ELSE 160.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Matcha%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Trà Sữa Trân Châu: black tea + milk + black pearl
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 12.00 WHEN 'S' THEN 6.00 ELSE 9.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000005'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Trân Châu%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 50.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000030'
WHERE r.status = 'active' AND c.name = 'Tea' AND p.name LIKE '%Trân Châu%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Generic oolong base for all tea not yet having ING000007
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 14.00 WHEN 'S' THEN 7.00 ELSE 10.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000007'
WHERE r.status = 'active' AND c.name = 'Tea'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Generic simple syrup for all tea not yet having ING000053 (simple syrup)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 35.00 WHEN 'S' THEN 18.00 ELSE 25.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE r.status = 'active' AND c.name = 'Tea'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- ─── FREEZE RECIPES ───────────────────────────────────────────────────────────

-- Freeze Cà Phê: matcha powder replaced by espresso beans
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 18.00 WHEN 'S' THEN 10.00 ELSE 14.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000002'
WHERE r.status = 'active' AND c.name = 'Freeze' AND p.name LIKE '%Cà Phê%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Freeze Socola: chocolate powder
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 20.00 WHEN 'S' THEN 10.00 ELSE 15.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000008'
WHERE r.status = 'active' AND c.name = 'Freeze' AND p.name LIKE '%Socola%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Freeze Caramel
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 25.00 WHEN 'S' THEN 13.00 ELSE 18.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000017'
WHERE r.status = 'active' AND c.name = 'Freeze' AND p.name LIKE '%Caramel%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Freeze Cookies & Cream: oreo crumble + whipping cream
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 30.00 WHEN 'S' THEN 15.00 ELSE 22.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000063'
WHERE r.status = 'active' AND c.name = 'Freeze' AND p.name LIKE '%Cookies%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Generic matcha for Freeze Trà Xanh + any freeze missing matcha
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 14.00 WHEN 'S' THEN 8.00 ELSE 10.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000001'
WHERE r.status = 'active' AND c.name = 'Freeze' AND p.name LIKE '%Trà Xanh%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Fresh milk + simple syrup for all freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 200.00 WHEN 'S' THEN 120.00 ELSE 160.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE r.status = 'active' AND c.name = 'Freeze'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 30.00 WHEN 'S' THEN 15.00 ELSE 22.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE r.status = 'active' AND c.name = 'Freeze'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- ─── OTHER / FOOD RECIPES ─────────────────────────────────────────────────────

-- Bánh Mì Que Phô Mai
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 80.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000069'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Phô Mai%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 40.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000056'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Phô Mai%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Bánh Mì Sài Gòn
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000068'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Sài Gòn%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Bánh Sừng Bò (Croissant)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000067'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Sừng Bò%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Bánh Tiramisu
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 120.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000066'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Tiramisu%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Generic baguette + pate for remaining bánh mì que pate that may not have been covered in V32
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000054'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Pate%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 40.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000055'
WHERE r.status = 'active' AND c.name = 'Other' AND p.name LIKE '%Pate%'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- ─── ICE FOR ALL BEVERAGES (new variants) ─────────────────────────────────────
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id,
       CASE pv.size WHEN 'L' THEN 180.00 WHEN 'S' THEN 100.00 ELSE 140.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000038'
WHERE r.status = 'active' AND c.name IN ('Coffee', 'Tea', 'Freeze', 'Combo')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- ─── PACKAGING (new variants) ─────────────────────────────────────────────────
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE c.name WHEN 'Combo' THEN 2.00 ELSE 1.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000042'
WHERE r.status = 'active' AND c.name IN ('Coffee','Tea','Freeze','Combo') AND pv.size <> 'L'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000043'
WHERE r.status = 'active' AND c.name IN ('Coffee','Tea','Freeze') AND pv.size = 'L'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE c.name WHEN 'Combo' THEN 2.00 ELSE 1.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000046'
WHERE r.status = 'active' AND c.name IN ('Coffee','Tea','Freeze','Combo')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE c.name WHEN 'Combo' THEN 2.00 ELSE 1.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000048'
WHERE r.status = 'active' AND c.name IN ('Coffee','Tea','Freeze','Combo')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000049'
WHERE r.status = 'active' AND (c.name = 'Other' OR (c.name = 'Combo' AND pv.price > 50000))
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- ─── COMBO KEY INGREDIENTS ────────────────────────────────────────────────────

-- Combo Buổi Sáng (id=23, ~49k): robusta + condensed milk + baguette + pate
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, combo.quantity, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN (
    SELECT 49000 AS price_match, 'ING000004' AS code, 16.00 AS quantity
    UNION ALL SELECT 49000, 'ING000011', 35.00
    UNION ALL SELECT 49000, 'ING000054', 1.00
    UNION ALL SELECT 49000, 'ING000055', 40.00
    -- Combo Đôi Bạn (~59k): phin + oolong tea
    UNION ALL SELECT 59000, 'ING000004', 16.00
    UNION ALL SELECT 59000, 'ING000011', 35.00
    UNION ALL SELECT 59000, 'ING000007', 12.00
    UNION ALL SELECT 59000, 'ING000053', 30.00
    -- Combo Chiều Ngọt (~69k): latte + cheesecake
    UNION ALL SELECT 69000, 'ING000002', 18.00
    UNION ALL SELECT 69000, 'ING000010', 180.00
    UNION ALL SELECT 69000, 'ING000056', 80.00
    UNION ALL SELECT 69000, 'ING000057', 25.00
    -- Combo Tỉnh Táo / Năng Lượng / Thư Giãn (~79k): matcha freeze + bánh
    UNION ALL SELECT 79000, 'ING000001', 12.00
    UNION ALL SELECT 79000, 'ING000010', 160.00
    UNION ALL SELECT 79000, 'ING000067', 1.00
    -- Combo Trà Chiều / Ngọt Ngào (~89k): tea + cake
    UNION ALL SELECT 89000, 'ING000007', 14.00
    UNION ALL SELECT 89000, 'ING000053', 35.00
    UNION ALL SELECT 89000, 'ING000066', 100.00
) combo ON combo.price_match = pv.price
JOIN ingredients i ON i.code = combo.code
WHERE r.status = 'active' AND c.name = 'Combo'
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);
