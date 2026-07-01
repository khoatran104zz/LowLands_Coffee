ALTER TABLE ingredients
    ADD COLUMN min_stock NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE ingredients
    ADD COLUMN description TEXT;

ALTER TABLE ingredients
    ADD CONSTRAINT chk_ingredients_min_stock CHECK (min_stock >= 0);

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'COFFEE', 'Coffee', 'Coffee beans, tea leaves, matcha, cocoa and base beverage powders.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'COFFEE');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'MILK_DAIRY', 'Milk & Dairy', 'Milk, cream and dairy foam bases.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'MILK_DAIRY');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'SYRUP_SAUCE', 'Syrup & Sauce', 'Syrups, sauces and sweetener bases used in drinks.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'SYRUP_SAUCE');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'FRUIT', 'Fruit', 'Fresh and preserved fruit for tea and blended drinks.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'FRUIT');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'TOPPING', 'Topping', 'Pearls, jellies, pudding and drink toppings.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'TOPPING');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'ICE_BASIC', 'Ice & Basic Ingredients', 'Ice, water, salt, honey and basic consumables.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'ICE_BASIC');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'PACKAGING', 'Packaging', 'Cups, lids, straws, bags, napkins and other packaging stock.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'PACKAGING');

INSERT INTO ingredient_categories (code, name, description, status)
SELECT 'OTHER', 'Other', 'Other operational materials and shop supplies.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingredient_categories WHERE code = 'OTHER');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000001', 'Matcha Powder', 'g', 1000, 'Japanese-style matcha powder for lattes and blended drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000001');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000002', 'Espresso Beans', 'g', 5000, 'Espresso blend beans for machine coffee drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000002');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000003', 'Arabica Beans', 'g', 5000, 'Arabica beans for specialty coffee recipes.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000003');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000004', 'Robusta Beans', 'g', 5000, 'Vietnamese robusta beans for phin coffee.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000004');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000005', 'Black Tea', 'g', 2000, 'Black tea leaves for milk tea and fruit tea bases.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000005');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000006', 'Jasmine Tea', 'g', 2000, 'Jasmine tea leaves for fragrant tea drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000006');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000007', 'Oolong Tea', 'g', 2000, 'Oolong tea leaves for tea recipes.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000007');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000008', 'Chocolate Powder', 'g', 1000, 'Chocolate powder for cocoa and blended drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000008');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000009', 'Cocoa Powder', 'g', 1000, 'Cocoa powder for chocolate beverages.', 'active'
FROM ingredient_categories c
WHERE c.code = 'COFFEE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000009');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000010', 'Fresh Milk', 'ml', 10000, 'Fresh milk for latte, milk tea and blended drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000010');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000011', 'Condensed Milk', 'ml', 5000, 'Sweetened condensed milk for Vietnamese coffee.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000011');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000012', 'Oat Milk', 'ml', 3000, 'Plant-based oat milk.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000012');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000013', 'Soy Milk', 'ml', 3000, 'Plant-based soy milk.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000013');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000014', 'Whipping Cream', 'ml', 2000, 'Whipping cream for topping and blended recipes.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000014');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000015', 'Cheese Foam Base', 'ml', 2000, 'Cheese foam base for cream cheese topping.', 'active'
FROM ingredient_categories c
WHERE c.code = 'MILK_DAIRY'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000015');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000016', 'Vanilla Syrup', 'ml', 2000, 'Vanilla syrup for flavored beverages.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000016');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000017', 'Caramel Syrup', 'ml', 2000, 'Caramel syrup for coffee and milk drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000017');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000018', 'Hazelnut Syrup', 'ml', 2000, 'Hazelnut syrup for flavored coffee drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000018');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000019', 'Brown Sugar Syrup', 'ml', 3000, 'Brown sugar syrup for milk tea and pearl drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000019');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000020', 'Chocolate Sauce', 'ml', 2000, 'Chocolate sauce for beverages and toppings.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000020');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000021', 'Strawberry Sauce', 'ml', 2000, 'Strawberry sauce for fruit drinks and toppings.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000021');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000022', 'White Sugar', 'g', 5000, 'White sugar for drink preparation.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000022');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000023', 'Brown Sugar', 'g', 5000, 'Brown sugar for syrup and topping recipes.', 'active'
FROM ingredient_categories c
WHERE c.code = 'SYRUP_SAUCE'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000023');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000024', 'Strawberry', 'g', 2000, 'Fresh strawberry for fruit drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000024');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000025', 'Mango', 'g', 3000, 'Fresh mango for fruit tea and blended drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000025');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000026', 'Orange', 'g', 3000, 'Fresh orange for citrus drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000026');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000027', 'Lemon', 'g', 1000, 'Fresh lemon for tea and fruit drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000027');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000028', 'Passion Fruit', 'g', 2000, 'Fresh passion fruit for fruit tea.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000028');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000029', 'Lychee', 'g', 2000, 'Lychee fruit for tea and seasonal drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'FRUIT'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000029');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000030', 'Black Pearl', 'g', 3000, 'Black tapioca pearls for milk tea.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000030');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000031', 'White Pearl', 'g', 3000, 'White tapioca pearls for tea drinks.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000031');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000032', 'Coffee Jelly', 'g', 2000, 'Coffee jelly topping.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000032');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000033', 'Grass Jelly', 'g', 2000, 'Grass jelly topping.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000033');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000034', 'Pudding', 'portion', 50, 'Pudding topping portion.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000034');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000035', 'Aloe Vera', 'g', 2000, 'Aloe vera topping.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000035');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000036', 'Cheese Foam', 'portion', 50, 'Prepared cheese foam topping portion.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000036');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000037', 'Whipped Cream', 'portion', 50, 'Whipped cream topping portion.', 'active'
FROM ingredient_categories c
WHERE c.code = 'TOPPING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000037');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000038', 'Ice', 'g', 10000, 'Ice used for cold beverages.', 'active'
FROM ingredient_categories c
WHERE c.code = 'ICE_BASIC'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000038');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000039', 'Salt', 'g', 1000, 'Salt for foam and basic preparation.', 'active'
FROM ingredient_categories c
WHERE c.code = 'ICE_BASIC'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000039');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000040', 'Honey', 'ml', 2000, 'Honey for tea and specialty beverages.', 'active'
FROM ingredient_categories c
WHERE c.code = 'ICE_BASIC'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000040');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000041', 'Mineral Water', 'ml', 10000, 'Mineral water for beverage preparation.', 'active'
FROM ingredient_categories c
WHERE c.code = 'ICE_BASIC'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000041');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000042', 'Cup M', 'piece', 500, 'Medium cold drink cup.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000042');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000043', 'Cup L', 'piece', 500, 'Large cold drink cup.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000043');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000044', 'Cup XL', 'piece', 300, 'Extra large cold drink cup.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000044');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000045', 'Hot Cup', 'piece', 300, 'Paper hot cup for hot beverages.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000045');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000046', 'Plastic Lid', 'piece', 500, 'Plastic lid for cold cups.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000046');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000047', 'Paper Lid', 'piece', 300, 'Paper lid for hot cups.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000047');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000048', 'Straw', 'piece', 500, 'Drinking straw for cold beverages.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000048');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000049', 'Paper Bag', 'piece', 200, 'Takeaway paper bag.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000049');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000050', 'Napkin', 'piece', 500, 'Customer napkin.', 'active'
FROM ingredient_categories c
WHERE c.code = 'PACKAGING'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000050');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000051', 'Coffee Filter', 'piece', 200, 'Coffee filter paper and phin support material.', 'active'
FROM ingredient_categories c
WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000051');

INSERT INTO ingredients (category_id, code, name, unit, min_stock, description, status)
SELECT c.id, 'ING000052', 'Cleaning Chemical', 'ml', 5000, 'Cleaning chemical for store operations.', 'active'
FROM ingredient_categories c
WHERE c.code = 'OTHER'
  AND NOT EXISTS (SELECT 1 FROM ingredients WHERE code = 'ING000052');
