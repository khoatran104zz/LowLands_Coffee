CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_employees_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_status ON employees(status);

INSERT INTO employees (user_id, employee_code, status, created_at, updated_at)
SELECT ranked.user_id,
       'EMP' || LPAD(ranked.sequence_number::text, 4, '0'),
       CASE WHEN ranked.user_status = 'ACTIVE' THEN 'active' ELSE 'inactive' END,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM (
    SELECT u.id AS user_id,
           u.status AS user_status,
           ROW_NUMBER() OVER (ORDER BY u.id) AS sequence_number
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.name IN ('MANAGER', 'STAFF')
) ranked
WHERE NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.user_id = ranked.user_id
);
