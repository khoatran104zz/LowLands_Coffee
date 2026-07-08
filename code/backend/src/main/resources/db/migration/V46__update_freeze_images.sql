-- Update image URLs for the 5 active Freeze products to local custom images
UPDATE products SET image_url = '/images/products/freeze_tra_xanh.png' WHERE name = 'Freeze Trà Xanh';
UPDATE products SET image_url = '/images/products/freeze_ca_phe.png' WHERE name = 'Freeze Cà Phê';
UPDATE products SET image_url = '/images/products/freeze_socola.png' WHERE name = 'Freeze Socola';
UPDATE products SET image_url = '/images/products/freeze_caramel.png' WHERE name = 'Freeze Caramel';
UPDATE products SET image_url = '/images/products/freeze_cookies_and_cream.png' WHERE name = 'Freeze Cookies and Cream';
