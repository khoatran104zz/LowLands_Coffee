INSERT INTO permissions (code, name)
SELECT 'CATEGORY_VIEW', 'View categories'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CATEGORY_VIEW');

INSERT INTO permissions (code, name)
SELECT 'CATEGORY_CREATE', 'Create categories'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CATEGORY_CREATE');

INSERT INTO permissions (code, name)
SELECT 'CATEGORY_UPDATE', 'Update categories'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CATEGORY_UPDATE');

INSERT INTO permissions (code, name)
SELECT 'CATEGORY_DELETE', 'Delete categories'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CATEGORY_DELETE');

INSERT INTO permissions (code, name)
SELECT 'PRODUCT_VIEW', 'View products'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'PRODUCT_VIEW');

INSERT INTO permissions (code, name)
SELECT 'PRODUCT_CREATE', 'Create products'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'PRODUCT_CREATE');

INSERT INTO permissions (code, name)
SELECT 'PRODUCT_UPDATE', 'Update products'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'PRODUCT_UPDATE');

INSERT INTO permissions (code, name)
SELECT 'PRODUCT_DELETE', 'Delete products'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'PRODUCT_DELETE');

INSERT INTO permissions (code, name)
SELECT 'TOPPING_VIEW', 'View toppings'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'TOPPING_VIEW');

INSERT INTO permissions (code, name)
SELECT 'TOPPING_CREATE', 'Create toppings'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'TOPPING_CREATE');

INSERT INTO permissions (code, name)
SELECT 'TOPPING_UPDATE', 'Update toppings'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'TOPPING_UPDATE');

INSERT INTO permissions (code, name)
SELECT 'TOPPING_DELETE', 'Delete toppings'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'TOPPING_DELETE');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'CATEGORY_VIEW',
    'CATEGORY_CREATE',
    'CATEGORY_UPDATE',
    'CATEGORY_DELETE',
    'PRODUCT_VIEW',
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE',
    'TOPPING_VIEW',
    'TOPPING_CREATE',
    'TOPPING_UPDATE',
    'TOPPING_DELETE'
)
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
