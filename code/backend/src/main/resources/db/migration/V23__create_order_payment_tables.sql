CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    store_id BIGINT NOT NULL,
    address_id BIGINT,
    order_code VARCHAR(50) NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    receiver_name VARCHAR(100),
    receiver_phone VARCHAR(20),
    delivery_address VARCHAR(255),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    note VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_orders_order_code UNIQUE (order_code),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT chk_orders_order_type CHECK (order_type IN ('DELIVERY', 'PICKUP', 'DINE_IN', 'TAKEAWAY')),
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_orders_discount_amount CHECK (discount_amount >= 0),
    CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders (store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders (order_type);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    size VARCHAR(20) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_order_items_product_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_total_price CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items (product_variant_id);

CREATE TABLE IF NOT EXISTS order_item_toppings (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL,
    topping_id BIGINT NOT NULL,
    topping_name VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(12,2) NOT NULL,
    CONSTRAINT fk_order_item_toppings_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    CONSTRAINT fk_order_item_toppings_topping FOREIGN KEY (topping_id) REFERENCES toppings(id),
    CONSTRAINT chk_order_item_toppings_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_order_item_toppings_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_item_toppings_total_price CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_item_toppings_order_item_id ON order_item_toppings (order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_toppings_topping_id ON order_item_toppings (topping_id);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    amount NUMERIC(12,2) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_payments_order_id UNIQUE (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT chk_payments_method CHECK (payment_method IN ('CASH', 'BANKING', 'MOMO', 'CARD')),
    CONSTRAINT chk_payments_status CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_payments_amount CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (payment_status);

INSERT INTO permissions (code, name)
SELECT code, name
FROM (VALUES
    ('ORDER_VIEW', 'View orders'),
    ('ORDER_CREATE', 'Create orders'),
    ('ORDER_UPDATE', 'Update order status'),
    ('ORDER_CANCEL', 'Cancel orders'),
    ('ORDER_COMPLETE', 'Complete orders')
) AS seed(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions p WHERE p.code = seed.code
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'ORDER_VIEW',
    'ORDER_CREATE',
    'ORDER_UPDATE',
    'ORDER_CANCEL',
    'ORDER_COMPLETE'
)
WHERE r.name IN ('ADMIN', 'MANAGER', 'STAFF')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
