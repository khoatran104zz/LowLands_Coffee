INSERT INTO permissions (code, name)
SELECT code, name
FROM (VALUES
    ('USER_VIEW', 'View users'),
    ('USER_CREATE', 'Create users'),
    ('USER_UPDATE', 'Update users'),
    ('USER_DELETE', 'Delete users'),
    ('STORE_VIEW', 'View stores'),
    ('STORE_CREATE', 'Create stores'),
    ('STORE_UPDATE', 'Update stores'),
    ('STORE_DELETE', 'Delete stores'),
    ('ROLE_VIEW', 'View roles'),
    ('ROLE_CREATE', 'Create roles'),
    ('ROLE_UPDATE', 'Update roles'),
    ('ROLE_DELETE', 'Delete roles'),
    ('PERMISSION_VIEW', 'View permissions'),
    ('PERMISSION_CREATE', 'Create permissions'),
    ('PERMISSION_UPDATE', 'Update permissions'),
    ('PERMISSION_DELETE', 'Delete permissions')
) AS seed(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions p WHERE p.code = seed.code
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'USER_VIEW',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'STORE_VIEW',
    'STORE_CREATE',
    'STORE_UPDATE',
    'STORE_DELETE',
    'ROLE_VIEW',
    'ROLE_CREATE',
    'ROLE_UPDATE',
    'ROLE_DELETE',
    'PERMISSION_VIEW',
    'PERMISSION_CREATE',
    'PERMISSION_UPDATE',
    'PERMISSION_DELETE'
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
    'USER_VIEW',
    'STORE_VIEW',
    'STORE_CREATE',
    'STORE_UPDATE'
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
    'USER_VIEW',
    'STORE_VIEW'
)
WHERE r.name = 'STAFF'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id
    FROM permissions
    WHERE code IN (
        'USER_READ',
        'USER_MANAGE',
        'STORE_READ',
        'STORE_MANAGE',
        'ROLE_READ',
        'ROLE_MANAGE',
        'PERMISSION_READ',
        'PERMISSION_MANAGE'
    )
);

DELETE FROM permissions
WHERE code IN (
    'USER_READ',
    'USER_MANAGE',
    'STORE_READ',
    'STORE_MANAGE',
    'ROLE_READ',
    'ROLE_MANAGE',
    'PERMISSION_READ',
    'PERMISSION_MANAGE'
);
