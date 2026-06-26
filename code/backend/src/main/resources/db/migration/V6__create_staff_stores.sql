CREATE TABLE staff_stores (
    id BIGSERIAL PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    position VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_stores_staff FOREIGN KEY (staff_id) REFERENCES users(id),
    CONSTRAINT fk_staff_stores_store FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT uk_staff_stores UNIQUE (staff_id, store_id)
);

CREATE INDEX idx_staff_stores_staff_id ON staff_stores(staff_id);
CREATE INDEX idx_staff_stores_store_id ON staff_stores(store_id);
