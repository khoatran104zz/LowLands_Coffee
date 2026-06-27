INSERT INTO permissions (code, name)
SELECT code, name
FROM (VALUES
    ('SUPPLIER_VIEW', 'View suppliers'),
    ('SUPPLIER_CREATE', 'Create suppliers'),
    ('SUPPLIER_UPDATE', 'Update suppliers'),
    ('SUPPLIER_DELETE', 'Delete suppliers'),
    ('INGREDIENT_VIEW', 'View ingredients'),
    ('INGREDIENT_CREATE', 'Create ingredients'),
    ('INGREDIENT_UPDATE', 'Update ingredients'),
    ('INGREDIENT_DELETE', 'Delete ingredients'),
    ('RECIPE_VIEW', 'View recipes'),
    ('RECIPE_CREATE', 'Create recipes'),
    ('RECIPE_UPDATE', 'Update recipes'),
    ('RECIPE_DELETE', 'Delete recipes'),
    ('INVENTORY_VIEW', 'View inventory'),
    ('INVENTORY_ADJUST', 'Adjust inventory'),
    ('GOODS_RECEIPT_VIEW', 'View goods receipts'),
    ('GOODS_RECEIPT_CREATE', 'Create goods receipts'),
    ('GOODS_RECEIPT_UPDATE', 'Update goods receipts'),
    ('GOODS_RECEIPT_DELETE', 'Delete goods receipts'),
    ('GOODS_RECEIPT_COMPLETE', 'Complete goods receipts')
) AS seed(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions p WHERE p.code = seed.code
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'SUPPLIER_VIEW',
    'SUPPLIER_CREATE',
    'SUPPLIER_UPDATE',
    'SUPPLIER_DELETE',
    'INGREDIENT_VIEW',
    'INGREDIENT_CREATE',
    'INGREDIENT_UPDATE',
    'INGREDIENT_DELETE',
    'RECIPE_VIEW',
    'RECIPE_CREATE',
    'RECIPE_UPDATE',
    'RECIPE_DELETE',
    'INVENTORY_VIEW',
    'INVENTORY_ADJUST',
    'GOODS_RECEIPT_VIEW',
    'GOODS_RECEIPT_CREATE',
    'GOODS_RECEIPT_UPDATE',
    'GOODS_RECEIPT_DELETE',
    'GOODS_RECEIPT_COMPLETE'
)
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'SUPPLIER_VIEW',
    'INGREDIENT_VIEW',
    'RECIPE_VIEW',
    'INVENTORY_VIEW',
    'INVENTORY_ADJUST',
    'GOODS_RECEIPT_VIEW',
    'GOODS_RECEIPT_CREATE',
    'GOODS_RECEIPT_UPDATE',
    'GOODS_RECEIPT_COMPLETE'
)
WHERE r.name = 'MANAGER'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'SUPPLIER_VIEW',
    'INGREDIENT_VIEW',
    'RECIPE_VIEW',
    'INVENTORY_VIEW',
    'GOODS_RECEIPT_VIEW',
    'GOODS_RECEIPT_CREATE'
)
WHERE r.name = 'STAFF'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
