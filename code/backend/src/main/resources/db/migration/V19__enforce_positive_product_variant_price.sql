ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS chk_product_variants_price;

ALTER TABLE product_variants
    ADD CONSTRAINT chk_product_variants_price CHECK (price > 0);
