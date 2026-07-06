package com.lowlands.coffee.modules.promotion.repository;

import com.lowlands.coffee.modules.promotion.entity.PromotionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<PromotionEntity, Long> {

    Optional<PromotionEntity> findByCodeIgnoreCase(String code);

    List<PromotionEntity> findAllByStatusIgnoreCase(String status);

    @Query("SELECT p FROM PromotionEntity p WHERE " +
           "(:status IS NULL OR LOWER(p.status) = LOWER(:status)) AND " +
           "(:applicableType IS NULL OR LOWER(p.applicableType) = LOWER(:applicableType)) AND " +
           "(:search IS NULL OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PromotionEntity> findAllFiltered(
            @Param("status") String status,
            @Param("applicableType") String applicableType,
            @Param("search") String search,
            Pageable pageable
    );
}
