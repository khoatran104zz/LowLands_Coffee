INSERT INTO permissions (code, name)
SELECT 'REPORT_VIEW', 'View reports'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'REPORT_VIEW');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'REPORT_VIEW'
WHERE r.name IN ('ADMIN', 'MANAGER')
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.permission_id = p.id
  );
