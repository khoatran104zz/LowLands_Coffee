CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

INSERT INTO permissions (code, name)
VALUES
    ('ROLE_READ', 'Read roles'),
    ('ROLE_MANAGE', 'Manage roles'),
    ('PERMISSION_READ', 'Read permissions'),
    ('PERMISSION_MANAGE', 'Manage permissions'),
    ('USER_READ', 'Read users'),
    ('USER_MANAGE', 'Manage users'),
    ('STORE_READ', 'Read stores'),
    ('STORE_MANAGE', 'Manage stores');
