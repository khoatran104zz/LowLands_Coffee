CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    shift_name VARCHAR(20) NOT NULL,
    shift_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shifts_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT fk_shifts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_shifts_store_user_date UNIQUE (store_id, user_id, shift_date, shift_name)
);

CREATE INDEX IF NOT EXISTS idx_shifts_store_id ON shifts (store_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts (user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts (shift_date);

INSERT INTO permissions (code, name)
SELECT code, name
FROM (VALUES
    ('SHIFT_VIEW', 'View shift schedules'),
    ('SHIFT_MANAGE', 'Manage shift assignments')
) AS seed(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions p WHERE p.code = seed.code
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('SHIFT_VIEW', 'SHIFT_MANAGE')
WHERE r.name IN ('ADMIN', 'MANAGER')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
