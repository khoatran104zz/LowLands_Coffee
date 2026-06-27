CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_categories_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_categories_status ON categories (status);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT chk_products_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_status ON products (status);

CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    size VARCHAR(20) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uk_product_variants_product_size UNIQUE (product_id, size),
    CONSTRAINT chk_product_variants_size CHECK (size IN ('S', 'M', 'L')),
    CONSTRAINT chk_product_variants_price CHECK (price >= 0),
    CONSTRAINT chk_product_variants_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_product_variants_status ON product_variants (status);

CREATE TABLE toppings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_toppings_price CHECK (price >= 0),
    CONSTRAINT chk_toppings_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_toppings_status ON toppings (status);

CREATE TABLE product_toppings (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    topping_id BIGINT NOT NULL,
    CONSTRAINT fk_product_toppings_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_product_toppings_topping FOREIGN KEY (topping_id) REFERENCES toppings(id),
    CONSTRAINT uk_product_toppings_product_topping UNIQUE (product_id, topping_id)
);

CREATE INDEX idx_product_toppings_product_id ON product_toppings (product_id);
CREATE INDEX idx_product_toppings_topping_id ON product_toppings (topping_id);
