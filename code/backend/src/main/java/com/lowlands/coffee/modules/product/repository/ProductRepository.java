package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.ProductEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    @EntityGraph(attributePaths = {"category", "variants", "productToppings", "productToppings.topping"})
    @Query("select distinct p from ProductEntity p order by p.id asc")
    List<ProductEntity> findAllWithDetails();

    @EntityGraph(attributePaths = {"category", "variants", "productToppings", "productToppings.topping"})
    @Query("select p from ProductEntity p where p.id = :id")
    Optional<ProductEntity> findByIdWithDetails(Long id);
}
