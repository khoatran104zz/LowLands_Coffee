ALTER TABLE orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_store_created_at
    ON orders (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_orders_status_store_created_at
    ON orders (status, store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
    ON payments (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_status_method
    ON payments (payment_status, payment_method);

CREATE INDEX IF NOT EXISTS idx_goods_receipts_store_created_at
    ON goods_receipts (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_goods_receipts_store_status_created_at
    ON goods_receipts (store_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_movements_store_created_at
    ON stock_movements (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_movements_store_ingredient_created_at
    ON stock_movements (store_id, ingredient_id, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_movements_type_reference_store_created_at
    ON stock_movements (movement_type, reference_type, store_id, created_at);
