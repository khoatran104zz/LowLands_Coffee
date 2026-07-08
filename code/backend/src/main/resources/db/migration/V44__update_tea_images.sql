-- 1. Increase column length for image_url to allow long URLs (like the Bing image URL for Trà Xoài)
ALTER TABLE products ALTER COLUMN image_url TYPE VARCHAR(1000);

-- 2. Update image URLs for Tea products with the user-provided URLs
UPDATE products SET image_url = 'https://img.meta.com.vn/Data/image/2021/05/20/tra-dao-cam-sa-2.jpg' WHERE name = 'Trà Đào Cam Sả';
UPDATE products SET image_url = 'https://cdn.hachihachi.com.vn/Uploads/_6/CMS/Blog/AmThuc/2025/T2/tra-sua-matcha.jpg' WHERE name = 'Trà Sữa Matcha';
UPDATE products SET image_url = 'https://cdn.hachihachi.com.vn/Uploads/_6/CMS/Blog/AmThuc/2025/T2/matcha-latte-nong.jpg' WHERE name = 'Matcha Latte';
UPDATE products SET image_url = 'https://befresh.vn/wp-content/uploads/2023/04/tra-vai-hoa-hong-1280x1000-ad7a.jpeg-1024x800.jpeg' WHERE name = 'Trà Vải';
UPDATE products SET image_url = 'https://befresh.vn/wp-content/uploads/2023/04/cach-lam-tra-nhan-1.jpg' WHERE name = 'Trà Nhãn';
UPDATE products SET image_url = 'https://thf.bing.com/th/id/R.ed14dedf83f4b1312011148a2d9c169b?rik=IJmftQ%2bvH1Tg0Q&pid=ImgRaw&r=0' WHERE name = 'Trà Sữa Trân Châu';
UPDATE products SET image_url = 'https://tse1.mm.bing.net/th/id/OIP.2kdNEo6Y8lBmC2z9K2xF2QHaEK?r=0&cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3' WHERE name = 'Trà Ô Long Kem Cheese';
UPDATE products SET image_url = 'https://thf.bing.com/th/id/R.b2036ddfba9a43df64e15837d820115b?rik=pzpw8UIJwm0dDQ&riu=http%3a%2f%2ffile.hstatic.net%2f1000394081%2farticle%2ftra-xoai_e2022354837e4e7eb8a789d6c5feb695.jpg&ehk=zzmi9%2bCytjcGgXXCBGe1WPG6blvhsxQ4G2wCBLNFMLs%3d&risl=&pid=ImgRaw&r=0' WHERE name = 'Trà Xoài Nhiệt Đới';
UPDATE products SET image_url = 'https://tse3.mm.bing.net/th/id/OIP.xTyqV3QdgSWR3C7LTazAeAHaHa?r=0&cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3' WHERE name = 'Trà Chanh Dây';
