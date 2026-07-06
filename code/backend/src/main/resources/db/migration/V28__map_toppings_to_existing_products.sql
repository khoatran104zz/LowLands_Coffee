-- Map all active toppings to all existing products in Coffee, Tea, and Freeze categories
INSERT INTO product_toppings (product_id, topping_id)
SELECT p.id, t.id
FROM products p
CROSS JOIN toppings t
JOIN categories c ON p.category_id = c.id
WHERE LOWER(c.name) IN ('coffee', 'tea', 'freeze')
  AND t.status = 'active'
  AND NOT EXISTS (
      SELECT 1 FROM product_toppings pt
      WHERE pt.product_id = p.id AND pt.topping_id = t.id
  );
