ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_key;

ALTER TABLE toppings ADD CONSTRAINT uk_toppings_name UNIQUE (name);
