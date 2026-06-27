INSERT INTO permissions (code, name)
SELECT 'USER_VIEW', 'View users'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_VIEW');

INSERT INTO permissions (code, name)
SELECT 'USER_CREATE', 'Create users'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_CREATE');

INSERT INTO permissions (code, name)
SELECT 'USER_UPDATE', 'Update users'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_UPDATE');

INSERT INTO permissions (code, name)
SELECT 'STORE_VIEW', 'View stores'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'STORE_VIEW');

INSERT INTO permissions (code, name)
SELECT 'STORE_CREATE', 'Create stores'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'STORE_CREATE');

INSERT INTO permissions (code, name)
SELECT 'STORE_UPDATE', 'Update stores'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'STORE_UPDATE');

INSERT INTO permissions (code, name)
SELECT 'ROLE_VIEW', 'View roles'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'ROLE_VIEW');

INSERT INTO permissions (code, name)
SELECT 'PERMISSION_VIEW', 'View permissions'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'PERMISSION_VIEW');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
  AND p.code IN (
      'USER_VIEW',
      'USER_CREATE',
      'USER_UPDATE',
      'STORE_VIEW',
      'STORE_CREATE',
      'STORE_UPDATE',
      'ROLE_VIEW',
      'PERMISSION_VIEW'
  )
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('USER_VIEW', 'STORE_VIEW', 'STORE_CREATE', 'STORE_UPDATE')
WHERE r.name = 'MANAGER'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('USER_VIEW', 'STORE_VIEW')
WHERE r.name = 'STAFF'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
