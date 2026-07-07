ALTER TABLE goods_receipts DROP CONSTRAINT chk_goods_receipts_status;
ALTER TABLE goods_receipts ADD CONSTRAINT chk_goods_receipts_status CHECK (status IN ('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED'));
