-- 1. Deactivate the duplicate Phin Sữa Đá (ID 5)
UPDATE products SET status = 'inactive' WHERE id = 5;

-- 2. Move Bánh Mì Que (ID 21) from Freeze to Other category
UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Other') WHERE id = 21;

-- 3. Update names, descriptions, and images of existing products to be accurate and high quality
UPDATE products SET name = 'Phin Sữa Đá', description = 'Cà phê phin truyền thống đậm đà, kết hợp với sữa đặc béo ngậy và đá lạnh.', image_url = 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800' WHERE id = 1;
UPDATE products SET name = 'Bạc Xỉu', description = 'Cà phê phin Việt Nam hòa quyện với sữa tươi và sữa đặc béo ngậy.', image_url = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800' WHERE id = 2;
UPDATE products SET name = 'Cà phê Latte', description = 'Espresso đậm vị hòa quyện với sữa tươi đánh nóng mịn màng và một lớp bọt mỏng nhẹ.', image_url = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800' WHERE id = 6;
UPDATE products SET name = 'Phin Đen Đá', description = 'Cà phê đen nguyên chất pha phin truyền thống thơm nồng nàn.', image_url = 'https://images.unsplash.com/photo-1765827623461-bd8ea6e82b0e?q=80&w=987&auto=format&fit=crop' WHERE id = 14;
UPDATE products SET name = 'Cappuccino', description = 'Espresso truyền thống kết hợp cùng lượng sữa nóng và bọt sữa dày mịn màng.', image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800' WHERE id = 15;
UPDATE products SET name = 'Americano', description = 'Sự kết hợp tinh tế giữa Espresso đậm đà và nước nóng thanh nhẹ.', image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800' WHERE id = 16;
UPDATE products SET name = 'Espresso', description = 'Cà phê nguyên chất được chiết xuất dưới áp suất cao, đậm đà thơm ngát.', image_url = 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800' WHERE id = 17;
UPDATE products SET name = 'Caramel Macchiato', description = 'Espresso kết hợp sữa tươi, bọt kem mịn và xốt caramel ngọt ngào.', image_url = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800' WHERE id = 18;
UPDATE products SET name = 'Cà phê Mocha', description = 'Espresso quyện cùng sữa tươi nóng và xốt sô-cô-la ngọt ngào đậm vị.', image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800' WHERE id = 19;
UPDATE products SET name = 'Cà phê Cold Brew', description = 'Cà phê ủ lạnh hơn 16 tiếng đem lại hương vị mộc mạc, ít chua và ngọt hậu.', image_url = 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800' WHERE id = 20;

UPDATE products SET name = 'Trà Sen Vàng', description = 'Sự kết hợp hoàn hảo giữa trà ô long, hạt sen bùi béo và củ năng giòn ngọt.', image_url = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800' WHERE id = 3;
UPDATE products SET name = 'Trà Đào Cam Sả', description = 'Trà đào mát lạnh hòa quyện vị cam ngọt dịu cùng hương sả nồng nàn.', image_url = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800' WHERE id = 7;
UPDATE products SET name = 'Matcha Latte', description = 'Bột matcha Nhật Bản nguyên chất hòa cùng sữa tươi béo mịn ấm áp.', image_url = 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800' WHERE id = 22;

UPDATE products SET name = 'Freeze Trà Xanh', description = 'Thức uống đá xay kết hợp bột trà xanh matcha đậm vị và lớp kem béo ngậy.', image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800' WHERE id = 4;

UPDATE products SET name = 'Bánh Mì Que Pate', description = 'Bánh mì que giòn tan với nhân pate béo ngậy đặc trưng miền Trung.', image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800' WHERE id = 8;
UPDATE products SET name = 'Bánh Phô Mai Việt Quất', description = 'Bánh phô mai nướng mịn màng phủ xốt quả việt quất chua ngọt đậm đà.', image_url = 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800' WHERE id = 9;
UPDATE products SET name = 'Cà Phê Phin Giấy Lowlands', description = 'Hộp cà phê phin giấy tiện lợi đóng gói sẵn từ Lowlands Coffee.', image_url = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800' WHERE id = 10;
UPDATE products SET name = 'Bánh Mì Que Phô Mai', description = 'Bánh mì que giòn xốp với nhân phô mai béo ngậy thơm ngon.', image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800' WHERE id = 21;

UPDATE products SET name = 'Combo Buổi Sáng', description = 'Bữa sáng trọn vẹn kiểu Việt: bánh mì giòn tan kết hợp cùng ly Phin Sữa Đá truyền thống thơm ngon đậm đà.', image_url = '/images/products/combo_buoi_sang.png' WHERE id = 23;
UPDATE products SET name = 'Combo Đôi Bạn', description = 'Bộ đôi thanh mát và tỉnh táo: 1 ly Phin Sữa Đá đậm đà truyền thống và 1 ly Trà Đào thanh mát ngọt ngào.', image_url = '/images/products/combo_doi_ban.png' WHERE id = 24;
UPDATE products SET name = 'Combo Chiều Ngọt Ngào', description = 'Khoảnh khắc ngọt ngào thư giãn: 1 ly Latte ấm áp quyện cùng 1 lát bánh phô mai việt quất chua ngọt thơm ngậy.', image_url = '/images/products/combo_chieu_ngot_ngao.png' WHERE id = 25;


-- 4. Seed new products in Tea category
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Vải', 'Trà thanh mát kết hợp cùng những trái vải căng mọng và ngọt ngào.', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Vải');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Nhãn', 'Hương trà thanh khiết hòa quyện tuyệt vời cùng quả nhãn tươi giòn ngọt lịm.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Nhãn');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Sữa Trân Châu', 'Trà sữa đậm vị hồng trà hòa quyện cùng trân châu đen dai giòn ngọt ngào.', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Sữa Trân Châu');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Sữa Matcha', 'Sự kết hợp giữa bột trà xanh matcha thanh mát và sữa tươi thơm béo.', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Sữa Matcha');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Ô Long Kem Cheese', 'Trà ô long thanh nhẹ kết hợp lớp kem phô mai sánh mịn mặn ngọt béo ngậy.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Ô Long Kem Cheese');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Xoài Nhiệt Đới', 'Trà trái cây thơm mát kết hợp vị xoài chín ngọt lịm đầy sảng khoái.', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Xoài Nhiệt Đới');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Trà Chanh Dây', 'Trà chanh dây chua ngọt tươi mát giải nhiệt hiệu quả cho những ngày hè.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Tea' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Trà Chanh Dây');


-- 5. Seed new products in Freeze category
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Freeze Cà Phê', 'Thức uống đá xay hương vị cà phê đậm đà kết hợp cùng thạch cà phê dai giòn và kem béo.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Freeze Cà Phê');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Freeze Sô-cô-la', 'Đá xay sô-cô-la ngọt ngào đậm đà, phủ kem whipping cream tươi ngon và sốt sô-cô-la.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Freeze Sô-cô-la');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Freeze Caramel', 'Cà phê đá xay hương caramel ngọt dịu, kết hợp thạch giòn và lớp kem tươi béo ngậy.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Freeze Caramel');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Cookie Đá Xay', 'Bánh quy sô-cô-la xay cùng sữa tươi và đá, tạo nên hương vị giòn ngọt béo ngậy đặc trưng.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cookie Đá Xay');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Việt Quất Đá Xay', 'Quả việt quất chua ngọt xay nhuyễn cùng đá và sữa tươi sữa chua thanh mát béo ngậy.', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Việt Quất Đá Xay');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Dâu Tây Đá Xay', 'Quả dâu tây tươi mọng xay mịn mang hương vị chua ngọt sảng khoái mát lạnh.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dâu Tây Đá Xay');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Xoài Đá Xay', 'Xoài cát ngọt lịm đá xay mát lành cùng sữa tươi đánh bọt mịn màng thơm dịu.', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Xoài Đá Xay');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Chanh Dây Đá Xay', 'Chanh dây tươi chua thanh mát xay tuyết cực kỳ giải nhiệt giải khát nồng nàn.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Chanh Dây Đá Xay');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Dừa Đá Xay', 'Sự quyện hòa của cốt dừa béo bùi ngọt lịm cùng đá tuyết xay giòn tan mát mẻ.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Freeze' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dừa Đá Xay');


-- 6. Seed new products in Other category
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Bánh Mì Sài Gòn', 'Bánh mì vỏ giòn ruột xốp với nhân giò lụa, xá xíu, pate, bơ và rau dưa chua đậm đà.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Other' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bánh Mì Sài Gòn');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Bánh Sừng Bò', 'Bánh sừng bò ngàn lớp thơm phức mùi bơ Pháp nướng chín vàng giòn rụm.', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Other' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bánh Sừng Bò');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Bánh Tiramisu', 'Bánh tiramisu mềm mịn hương cà phê nồng nàn kết hợp lớp kem phô mai béo ngậy.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', 'active'
FROM categories c WHERE c.name = 'Other' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bánh Tiramisu');


-- 7. Seed new products in Combo category
INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Tỉnh Táo', 'Năng lượng buổi sáng truyền thống: 1 ly Phin Đen Đá đậm đà và 1 chiếc Bánh Mì Sài Gòn đầy nhân giòn rụm.', '/images/products/combo_tinh_tao.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Tỉnh Táo');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Ngọt Ngào', 'Sự kết hợp hoàn hảo cho tín đồ hảo ngọt: 1 ly Trà Sữa Trân Châu đen dai giòn cùng 1 lát bánh Tiramisu béo ngậy.', '/images/products/combo_ngot_ngao.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Ngọt Ngào');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Trà Chiều', 'Set trà chiều thanh lịch: 1 ly Trà Đào Cam Sả thơm mát và 1 chiếc bánh sừng bò (Croissant) bơ tỏi thơm ngậy.', '/images/products/combo_tra_chieu.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Trà Chiều');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Năng Lượng', 'Khởi động ngày mới đầy hứng khởi: 1 ly Cà phê Latte thơm béo mịn màng quyện cùng bánh mì que pate giòn giòn.', '/images/products/combo_nang_luong.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Năng Lượng');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Thư Giãn', 'Thư giãn cuối ngày tao nhã: 1 ly Trà Sen Vàng hạt sen bùi ngậy và 1 lát bánh phô mai việt quất chua ngọt dịu.', '/images/products/combo_thu_gian.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Thư Giãn');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Đôi Lứa', 'Khoảnh khắc ấm áp sẻ chia: 1 ly Cappuccino bọt sữa thơm nồng quyện cùng chiếc bánh sừng bò giòn tan thơm phức.', '/images/products/combo_doi_lua.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Đôi Lứa');

INSERT INTO products (category_id, name, description, image_url, status)
SELECT c.id, 'Combo Sáng Tạo', 'Khơi nguồn cảm hứng sáng tạo: 1 ly Bạc Xỉu ngọt ngào nhiều sữa quyện cùng chiếc bánh mì que nhân phô mai béo ngậy.', '/images/products/combo_sang_tao.png', 'active'
FROM categories c WHERE c.name = 'Combo' AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Sáng Tạo');


-- 8. Seed variants for new Tea and Freeze products (Sizes M and L)
INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 39000 AS pr UNION ALL SELECT 'L', 49000
) size_table
WHERE p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Sữa Trân Châu')
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 45000 AS pr UNION ALL SELECT 'L', 55000
) size_table
WHERE p.name IN ('Trà Sữa Matcha', 'Trà Ô Long Kem Cheese')
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 42000 AS pr UNION ALL SELECT 'L', 52000
) size_table
WHERE p.name = 'Trà Xoài Nhiệt Đới'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 35000 AS pr UNION ALL SELECT 'L', 45000
) size_table
WHERE p.name = 'Trà Chanh Dây'
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 49000 AS pr UNION ALL SELECT 'L', 59000
) size_table
WHERE p.name IN ('Freeze Cà Phê', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 55000 AS pr UNION ALL SELECT 'L', 65000
) size_table
WHERE p.name IN ('Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);

INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, size_table.sz, size_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'M' AS sz, 45000 AS pr UNION ALL SELECT 'L', 55000
) size_table
WHERE p.name IN ('Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = size_table.sz);


-- 9. Seed variants for new Other products (Size M)
INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', pr_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'Bánh Mì Sài Gòn' AS name, 25000 AS pr
    UNION ALL SELECT 'Bánh Sừng Bò', 22000
    UNION ALL SELECT 'Bánh Tiramisu', 35000
) pr_table
WHERE p.name = pr_table.name
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');


-- 10. Seed variants for new Combo products (Size M)
INSERT INTO product_variants (product_id, size, price, status)
SELECT p.id, 'M', pr_table.pr, 'active'
FROM products p
CROSS JOIN (
    SELECT 'Combo Tỉnh Táo' AS name, 49000 AS pr
    UNION ALL SELECT 'Combo Ngọt Ngào', 65000
    UNION ALL SELECT 'Combo Trà Chiều', 52000
    UNION ALL SELECT 'Combo Năng Lượng', 59000
    UNION ALL SELECT 'Combo Thư Giãn', 69000
    UNION ALL SELECT 'Combo Đôi Lứa', 59000
    UNION ALL SELECT 'Combo Sáng Tạo', 49000
) pr_table
WHERE p.name = pr_table.name
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = 'M');


-- 11. Automatically generate recipes for all new active variants
INSERT INTO recipes (product_variant_id, code, name, description, status)
SELECT pv.id,
       'REC_AUTO_' || pv.id,
       p.name || ' Size ' || pv.size,
       'Master data recipe for POS availability and order completion.',
       'active'
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.status = 'active'
  AND p.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM recipes r WHERE r.product_variant_id = pv.id);


-- 12. Seed packaging & basic ingredients for new Tea and Freeze drinks
-- 12.1. Ice (ING000038)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 180.00 ELSE 140.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000038'
WHERE c.name IN ('Tea', 'Freeze')
  AND p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Sữa Trân Châu', 'Trà Sữa Matcha', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây',
                 'Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay', 'Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 12.2. Cups (ING000042 for S/M, ING000043 for L)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = CASE pv.size WHEN 'L' THEN 'ING000043' ELSE 'ING000042' END
WHERE c.name IN ('Tea', 'Freeze')
  AND p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Sữa Trân Châu', 'Trà Sữa Matcha', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây',
                 'Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay', 'Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 12.3. Straws (ING000046)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000046'
WHERE c.name IN ('Tea', 'Freeze')
  AND p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Sữa Trân Châu', 'Trà Sữa Matcha', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây',
                 'Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay', 'Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 12.4. Plastic bags (ING000048)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000048'
WHERE c.name IN ('Tea', 'Freeze')
  AND p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Sữa Trân Châu', 'Trà Sữa Matcha', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây',
                 'Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay', 'Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);


-- 13. Seed core tea ingredients
-- 13.1. Oolong Tea leaves (ING000007) for new fruit & cheese foam teas
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 14.00 ELSE 10.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000007'
WHERE p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 13.2. Sugar Syrup (ING000053) for new fruit & cheese foam teas
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 30.00 ELSE 20.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 13.3. Black Tea (ING000005) and Fresh Milk (ING000010) and Condensed Milk (ING000011) for Pearl Milk Tea
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 16.00 ELSE 12.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000005'
WHERE p.name = 'Trà Sữa Trân Châu' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 160.00 ELSE 120.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE p.name = 'Trà Sữa Trân Châu' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000011'
WHERE p.name = 'Trà Sữa Trân Châu' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 13.4. Matcha Powder (ING000001) and Fresh Milk (ING000010) and Sugar Syrup (ING000053) for Matcha Milk Tea
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 12.00 ELSE 8.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000001'
WHERE p.name = 'Trà Sữa Matcha' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 180.00 ELSE 140.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE p.name = 'Trà Sữa Matcha' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 30.00 ELSE 20.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE p.name = 'Trà Sữa Matcha' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 13.5. Cheese Foam (ING000036) for Oolong Cheese Foam Tea
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000036'
WHERE p.name = 'Trà Ô Long Kem Cheese' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 13.6. Fruit ingredients mapping
-- Lychee (ING000029) for Trà Vải
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000029'
WHERE p.name = 'Trà Vải' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Lychee (ING000029) for Trà Nhãn (as a placeholder)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000029'
WHERE p.name = 'Trà Nhãn' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Mango (ING000025) for Trà Xoài Nhiệt Đới
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000025'
WHERE p.name = 'Trà Xoài Nhiệt Đới' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Passion Fruit (ING000028) for Trà Chanh Dây
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000028'
WHERE p.name = 'Trà Chanh Dây' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);


-- 14. Seed core freeze ingredients
-- 14.1. Fresh Milk (ING000010) for Freeze drinks
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 160.00 ELSE 120.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000010'
WHERE p.name IN ('Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay', 'Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.2. Sugar Syrup (ING000053) for Freeze drinks
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 25.00 ELSE 15.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000053'
WHERE p.name IN ('Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.3. Robusta beans (ING000004) for Coffee Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 15.00 ELSE 10.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000004'
WHERE p.name = 'Freeze Cà Phê' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.4. Chocolate Sauce (ING000020) for Chocolate Freeze and Cookie Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000020'
WHERE p.name IN ('Freeze Sô-cô-la', 'Cookie Đá Xay') AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.5. Caramel Syrup (ING000017) for Caramel Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000017'
WHERE p.name = 'Freeze Caramel' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.6. Blueberry Sauce (ING000057) for Blueberry Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000057'
WHERE p.name = 'Việt Quất Đá Xay' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.7. Strawberry Sauce (ING000021) for Strawberry Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 40.00 ELSE 30.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000021'
WHERE p.name = 'Dâu Tây Đá Xay' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.8. Mango (ING000025) for Mango Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 70.00 ELSE 50.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000025'
WHERE p.name = 'Xoài Đá Xay' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- 14.9. Passion Fruit (ING000028) for Passion Fruit Freeze
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, CASE pv.size WHEN 'L' THEN 60.00 ELSE 40.00 END, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000028'
WHERE p.name = 'Chanh Dây Đá Xay' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);


-- 15. Seed packaging for new Other products
-- Paper bag (ING000049) for other products
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN categories c ON c.id = p.category_id
JOIN ingredients i ON i.code = 'ING000049'
WHERE c.name = 'Other'
  AND p.name IN ('Bánh Mì Sài Gòn', 'Bánh Sừng Bò', 'Bánh Tiramisu')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

-- Baguette (ING000054) and Pate (ING000055) for Bánh Mì Sài Gòn
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000054'
WHERE p.name = 'Bánh Mì Sài Gòn' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 30.00, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN ingredients i ON i.code = 'ING000055'
WHERE p.name = 'Bánh Mì Sài Gòn' AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);


-- 16. Seed recipe ingredients for new Combo products
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, combo_ing.qty, i.unit
FROM recipes r
JOIN product_variants pv ON pv.id = r.product_variant_id
JOIN products p ON p.id = pv.product_id
JOIN (
    -- Combo Tỉnh Táo
    SELECT 'Combo Tỉnh Táo' AS combo_name, 'ING000004' AS code, 16.00 AS qty
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000038', 140.00
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000054', 1.00
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000055', 30.00
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Tỉnh Táo', 'ING000049', 1.00
    
    -- Combo Ngọt Ngào
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000005', 12.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000010', 120.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000011', 30.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000030', 30.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000038', 140.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Ngọt Ngào', 'ING000049', 1.00
    
    -- Combo Trà Chiều
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000007', 12.00
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000053', 30.00
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000038', 140.00
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Trà Chiều', 'ING000049', 1.00
    
    -- Combo Năng Lượng
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000002', 18.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000010', 180.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000054', 1.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000055', 40.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Năng Lượng', 'ING000049', 1.00
    
    -- Combo Thư Giãn
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000007', 12.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000053', 30.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000038', 140.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000056', 80.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000057', 25.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Thư Giãn', 'ING000049', 1.00
    
    -- Combo Đôi Lứa
    UNION ALL SELECT 'Combo Đôi Lứa', 'ING000002', 18.00
    UNION ALL SELECT 'Combo Đôi Lứa', 'ING000010', 180.00
    UNION ALL SELECT 'Combo Đôi Lứa', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Đôi Lứa', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Đôi Lứa', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Đôi Lứa', 'ING000049', 1.00
    
    -- Combo Sáng Tạo
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000004', 16.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000010', 120.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000011', 35.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000038', 140.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000054', 1.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000042', 1.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000046', 1.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000048', 1.00
    UNION ALL SELECT 'Combo Sáng Tạo', 'ING000049', 1.00
) combo_ing ON combo_ing.combo_name = p.name
JOIN ingredients i ON i.code = combo_ing.code
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id = i.id);


-- 17. Seed combo items map relationships
INSERT INTO combo_items (combo_id, product_id)
SELECT p_combo.id, p_item.id
FROM products p_combo, products p_item
WHERE (
    (p_combo.name = 'Combo Tỉnh Táo' AND p_item.name IN ('Phin Đen Đá', 'Bánh Mì Sài Gòn'))
    OR (p_combo.name = 'Combo Ngọt Ngào' AND p_item.name IN ('Trà Sữa Trân Châu', 'Bánh Tiramisu'))
    OR (p_combo.name = 'Combo Trà Chiều' AND p_item.name IN ('Trà Đào Cam Sả', 'Bánh Sừng Bò'))
    OR (p_combo.name = 'Combo Năng Lượng' AND p_item.name IN ('Cà phê Latte', 'Bánh Mì Que Pate'))
    OR (p_combo.name = 'Combo Thư Giãn' AND p_item.name IN ('Trà Sen Vàng', 'Bánh Phô Mai Việt Quất'))
    OR (p_combo.name = 'Combo Đôi Lứa' AND p_item.name IN ('Cappuccino', 'Bánh Sừng Bò'))
    OR (p_combo.name = 'Combo Sáng Tạo' AND p_item.name IN ('Bạc Xỉu', 'Bánh Mì Que Phô Mai'))
)
  AND NOT EXISTS (
      SELECT 1 FROM combo_items ci
      WHERE ci.combo_id = p_combo.id AND ci.product_id = p_item.id
  );


-- 18. Map toppings for new Tea and Freeze products
INSERT INTO product_toppings (product_id, topping_id)
SELECT p.id, t.id
FROM products p
JOIN toppings t ON t.name IN ('Trân Châu', 'Coffee Jelly', 'White Pearl', 'Cheese Foam')
WHERE p.name IN ('Trà Vải', 'Trà Nhãn', 'Trà Sữa Trân Châu', 'Trà Sữa Matcha', 'Trà Ô Long Kem Cheese', 'Trà Xoài Nhiệt Đới', 'Trà Chanh Dây',
                 'Freeze Cà Phê', 'Freeze Sô-cô-la', 'Freeze Caramel', 'Cookie Đá Xay', 'Việt Quất Đá Xay', 'Dâu Tây Đá Xay', 'Xoài Đá Xay', 'Chanh Dây Đá Xay', 'Dừa Đá Xay')
  AND NOT EXISTS (
      SELECT 1 FROM product_toppings pt
      WHERE pt.product_id = p.id AND pt.topping_id = t.id
  );


-- 19. Seed opening stock for any ingredients that don't have stock
INSERT INTO stock_movements (
    store_id,
    ingredient_id,
    movement_type,
    quantity,
    unit,
    reference_type,
    reference_id,
    note,
    created_by
)
SELECT s.id,
       i.id,
       'IN',
       CASE
           WHEN i.unit = 'ml' THEN 50000.00
           WHEN i.unit = 'g' THEN 20000.00
           WHEN i.unit = 'piece' THEN 2000.00
           WHEN i.unit = 'portion' THEN 500.00
           ELSE 10000.00
       END,
       i.unit,
       'MANUAL_ADJUSTMENT',
       NULL,
       'Catalog expansion opening stock V41',
       u.id
FROM ingredients i
JOIN stores s ON s.id = (SELECT MIN(id) FROM stores)
JOIN users u ON u.email = 'admin@lowlands.coffee'
WHERE NOT EXISTS (
    SELECT 1
    FROM stock_movements sm
    WHERE sm.ingredient_id = i.id
);
