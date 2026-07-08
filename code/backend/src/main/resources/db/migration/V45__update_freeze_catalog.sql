-- Update Freeze category catalog
-- 1. Rename Freeze Sô-cô-la to Freeze Socola
UPDATE products SET name = 'Freeze Socola' WHERE name = 'Freeze Sô-cô-la';

-- 2. Rename Cookie Đá Xay to Freeze Cookies and Cream
UPDATE products SET name = 'Freeze Cookies and Cream' WHERE name = 'Cookie Đá Xay';

-- 3. Deactivate all other Freeze products (soft delete)
UPDATE products SET status = 'inactive' WHERE name IN (
  'Việt Quất Đá Xay',
  'Dâu Tây Đá Xay',
  'Xoài Đá Xay',
  'Chanh Dây Đá Xay',
  'Dừa Đá Xay'
);
