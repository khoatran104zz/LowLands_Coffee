ALTER TABLE IF EXISTS staff_stores RENAME TO store_users;

ALTER TABLE store_users RENAME CONSTRAINT fk_staff_stores_staff TO fk_store_users_user;
ALTER TABLE store_users RENAME CONSTRAINT fk_staff_stores_store TO fk_store_users_store;
ALTER TABLE store_users RENAME CONSTRAINT uk_staff_stores TO uk_store_users;

ALTER INDEX IF EXISTS staff_stores_pkey RENAME TO store_users_pkey;
ALTER INDEX IF EXISTS idx_staff_stores_staff_id RENAME TO idx_store_users_user_id;
ALTER INDEX IF EXISTS idx_staff_stores_store_id RENAME TO idx_store_users_store_id;
