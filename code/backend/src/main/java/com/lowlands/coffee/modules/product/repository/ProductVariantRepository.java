package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, Long> {

    @EntityGraph(attributePaths = {"product", "product.category", "product.productToppings", "product.productToppings.topping"})
    @Query("select pv from ProductVariantEntity pv where pv.id = :id")
    Optional<ProductVariantEntity> findWithDetailsById(Long id);
}
