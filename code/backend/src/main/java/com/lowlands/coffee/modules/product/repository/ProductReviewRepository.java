package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.ProductReviewEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReviewEntity, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<ProductReviewEntity> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status);

    @EntityGraph(attributePaths = {"user", "product"})
    Optional<ProductReviewEntity> findByProductIdAndUserId(Long productId, Long userId);
}
