INSERT INTO permissions (code, name)
SELECT code, name
FROM (VALUES
    ('PAYMENT_VIEW', 'View payments'),
    ('PAYMENT_CREATE', 'Create payments'),
    ('PAYMENT_UPDATE', 'Update payments'),
    ('PAYMENT_REFUND', 'Refund payments')
) AS seed(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions p WHERE p.code = seed.code
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'PAYMENT_VIEW',
    'PAYMENT_CREATE',
    'PAYMENT_UPDATE',
    'PAYMENT_REFUND'
)
WHERE r.name IN ('ADMIN', 'MANAGER')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'PAYMENT_VIEW',
    'PAYMENT_CREATE'
)
WHERE r.name = 'STAFF'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
