-- Update image URLs for Phin Sữa Đá, Bạc Xỉu, and Trà Sen Vàng to use hero banner images
UPDATE products SET image_url = '/images/hero-coffee.png' WHERE name = 'Phin Sữa Đá' AND status = 'active';
UPDATE products SET image_url = '/images/hero-bac-xiu.png' WHERE name = 'Bạc Xỉu';
UPDATE products SET image_url = '/images/hero-tra-sen.png' WHERE name = 'Trà Sen Vàng';
