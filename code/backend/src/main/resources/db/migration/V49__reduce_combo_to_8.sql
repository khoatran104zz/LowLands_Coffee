-- Deactivate 2 combos to reduce total from 10 to 8
UPDATE products SET status = 'inactive' WHERE id IN (50, 51);
