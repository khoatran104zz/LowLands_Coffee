package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.ProductToppingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductToppingRepository extends JpaRepository<ProductToppingEntity, Long> {
}
