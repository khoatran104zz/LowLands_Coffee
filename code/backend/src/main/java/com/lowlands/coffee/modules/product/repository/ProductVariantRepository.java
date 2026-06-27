package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, Long> {
}
