CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    tax_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_suppliers_code UNIQUE (code),
    CONSTRAINT chk_suppliers_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_suppliers_status ON suppliers (status);

CREATE TABLE ingredient_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_ingredient_categories_code UNIQUE (code),
    CONSTRAINT chk_ingredient_categories_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_ingredient_categories_status ON ingredient_categories (status);

CREATE TABLE ingredients (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_ingredients_code UNIQUE (code),
    CONSTRAINT fk_ingredients_category FOREIGN KEY (category_id) REFERENCES ingredient_categories(id),
    CONSTRAINT chk_ingredients_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_ingredients_category_id ON ingredients (category_id);
CREATE INDEX idx_ingredients_status ON ingredients (status);

CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_recipes_product_variant UNIQUE (product_variant_id),
    CONSTRAINT uk_recipes_code UNIQUE (code),
    CONSTRAINT fk_recipes_product_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
    CONSTRAINT chk_recipes_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_recipes_status ON recipes (status);

CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    CONSTRAINT fk_recipe_ingredients_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    CONSTRAINT uk_recipe_ingredients_recipe_ingredient UNIQUE (recipe_id, ingredient_id),
    CONSTRAINT chk_recipe_ingredients_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients (ingredient_id);

CREATE TABLE goods_receipts (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    receipt_code VARCHAR(50) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    note VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_goods_receipts_receipt_code UNIQUE (receipt_code),
    CONSTRAINT fk_goods_receipts_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_goods_receipts_store FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT fk_goods_receipts_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT chk_goods_receipts_status CHECK (status IN ('DRAFT', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_goods_receipts_total_amount CHECK (total_amount >= 0)
);

CREATE INDEX idx_goods_receipts_supplier_id ON goods_receipts (supplier_id);
CREATE INDEX idx_goods_receipts_store_id ON goods_receipts (store_id);
CREATE INDEX idx_goods_receipts_status ON goods_receipts (status);

CREATE TABLE goods_receipt_items (
    id BIGSERIAL PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goods_receipt_items_receipt FOREIGN KEY (receipt_id) REFERENCES goods_receipts(id),
    CONSTRAINT fk_goods_receipt_items_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    CONSTRAINT chk_goods_receipt_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_goods_receipt_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_goods_receipt_items_total_price CHECK (total_price >= 0)
);

CREATE INDEX idx_goods_receipt_items_receipt_id ON goods_receipt_items (receipt_id);
CREATE INDEX idx_goods_receipt_items_ingredient_id ON goods_receipt_items (ingredient_id);

CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reference_type VARCHAR(30) NOT NULL,
    reference_id BIGINT,
    note VARCHAR(255),
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_movements_store FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT fk_stock_movements_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    CONSTRAINT fk_stock_movements_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT chk_stock_movements_type CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    CONSTRAINT chk_stock_movements_reference_type CHECK (reference_type IN ('GOODS_RECEIPT', 'ORDER', 'MANUAL_ADJUSTMENT')),
    CONSTRAINT chk_stock_movements_quantity CHECK (
        (movement_type IN ('IN', 'OUT') AND quantity > 0)
        OR (movement_type = 'ADJUSTMENT' AND quantity <> 0)
    )
);

CREATE INDEX idx_stock_movements_store_ingredient ON stock_movements (store_id, ingredient_id);
CREATE INDEX idx_stock_movements_reference ON stock_movements (reference_type, reference_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at);
