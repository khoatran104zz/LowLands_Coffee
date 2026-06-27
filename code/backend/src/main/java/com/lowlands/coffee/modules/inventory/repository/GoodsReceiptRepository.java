package com.lowlands.coffee.modules.inventory.repository;

import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceiptEntity, Long> {

    boolean existsByReceiptCode(String receiptCode);

    boolean existsByReceiptCodeAndIdNot(String receiptCode, Long id);

    @Override
    @EntityGraph(attributePaths = {"supplier", "store", "createdBy", "items", "items.ingredient"})
    List<GoodsReceiptEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"supplier", "store", "createdBy", "items", "items.ingredient"})
    Optional<GoodsReceiptEntity> findById(Long id);
}
