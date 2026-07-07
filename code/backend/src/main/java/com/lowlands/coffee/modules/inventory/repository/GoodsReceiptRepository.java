package com.lowlands.coffee.modules.inventory.repository;

import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    @EntityGraph(attributePaths = {"supplier", "store", "createdBy", "items", "items.ingredient"})
    List<GoodsReceiptEntity> findByStoreId(Long storeId);

    long countByStoreIdAndCreatedAtBetween(Long storeId, LocalDateTime start, LocalDateTime end);

    @Query("""
            select gr
            from GoodsReceiptEntity gr
            join fetch gr.store
            where (:storeId is null or gr.store.id = :storeId)
            order by gr.createdAt desc
            """)
    List<GoodsReceiptEntity> findRecentGoodsReceipts(
            @Param("storeId") Long storeId,
            Pageable pageable
    );
}
