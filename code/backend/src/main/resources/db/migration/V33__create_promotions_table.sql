-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    discount_type VARCHAR(30) NOT NULL,
    discount_value NUMERIC(12,2) NOT NULL,
    minimum_order_value NUMERIC(12,2) DEFAULT 0,
    maximum_discount NUMERIC(12,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Draft',
    applicable_type VARCHAR(30) NOT NULL DEFAULT 'Entire Order',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create many-to-many relationship join tables
CREATE TABLE IF NOT EXISTS promotion_products (
    promotion_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    CONSTRAINT fk_promotion_products_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    CONSTRAINT fk_promotion_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT pk_promotion_products PRIMARY KEY (promotion_id, product_id)
);

CREATE TABLE IF NOT EXISTS promotion_categories (
    promotion_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_promotion_categories_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    CONSTRAINT fk_promotion_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT pk_promotion_categories PRIMARY KEY (promotion_id, category_id)
);

-- Alter orders table to reference promotions(id)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promotion_id BIGINT REFERENCES promotions(id) ON DELETE SET NULL;

-- Seed promotions
INSERT INTO promotions (code, name, description, discount_type, discount_value, minimum_order_value, maximum_discount, start_date, end_date, usage_limit, used_count, status, applicable_type)
VALUES
('ALL10', 'Giảm giá 10% đơn hàng', 'Giảm 10% tổng hóa đơn, tối đa 50.000đ cho đơn hàng từ 50.000đ.', 'Percentage', 10.00, 50000.00, 50000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 0, 'Active', 'Entire Order'),
('LATTE50', 'Giảm 50.000đ cho Cà phê Latte', 'Giảm 50.000đ trực tiếp cho sản phẩm Latte.', 'Fixed Amount', 50000.00, 0.00, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 0, 'Active', 'Product'),
('COFFEE20', 'Giảm 20% nhóm Coffee', 'Giảm 20% cho tất cả các sản phẩm thuộc danh mục Coffee.', 'Percentage', 20.00, 30000.00, 30000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 0, 'Active', 'Category');

-- Link LATTE50 promotion to product 'Latte'
INSERT INTO promotion_products (promotion_id, product_id)
SELECT p.id, pr.id
FROM promotions p, products pr
WHERE p.code = 'LATTE50' AND pr.name = 'Latte';

-- Link COFFEE20 promotion to category 'Coffee'
INSERT INTO promotion_categories (promotion_id, category_id)
SELECT p.id, c.id
FROM promotions p, categories c
WHERE p.code = 'COFFEE20' AND c.name = 'Coffee';

-- Seed promotion permissions
INSERT INTO permissions (code, name)
SELECT code, name
FROM (VALUES
    ('PROMOTION_VIEW', 'View promotions'),
    ('PROMOTION_CREATE', 'Create promotions'),
    ('PROMOTION_UPDATE', 'Update promotions'),
    ('PROMOTION_DELETE', 'Delete promotions')
) AS seed(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions p WHERE p.code = seed.code
);

-- Map permissions to ADMIN & MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('PROMOTION_VIEW', 'PROMOTION_CREATE', 'PROMOTION_UPDATE', 'PROMOTION_DELETE')
WHERE r.name IN ('ADMIN', 'MANAGER')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Map PROMOTION_VIEW to STAFF
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'PROMOTION_VIEW'
WHERE r.name = 'STAFF'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
