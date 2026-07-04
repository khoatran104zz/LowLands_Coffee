INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'TOPPING_VIEW',
    'PRODUCT_VIEW',
    'CATEGORY_VIEW'
)
WHERE r.name IN ('MANAGER', 'STAFF')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
