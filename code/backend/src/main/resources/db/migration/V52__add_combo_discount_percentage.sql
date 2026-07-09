-- Add discount_percentage column to products table for combo products
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2);

-- Set default discount percentage (10%) for existing combo products
UPDATE products p
SET discount_percentage = 10
FROM categories c
WHERE p.category_id = c.id
  AND c.name = 'Combo'
  AND p.discount_percentage IS NULL;
