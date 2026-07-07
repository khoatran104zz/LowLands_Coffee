package com.lowlands.coffee.modules.inventory.repository;

import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardIngredientConsumptionResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovementEntity, Long> {

    boolean existsByMovementTypeAndReferenceTypeAndReferenceId(
            String movementType,
            String referenceType,
            Long referenceId
    );

    @Override
    @EntityGraph(attributePaths = {"store", "ingredient", "createdBy"})
    List<StockMovementEntity> findAll();

    @EntityGraph(attributePaths = {"store", "ingredient", "createdBy"})
    List<StockMovementEntity> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    long countByStoreIdAndMovementTypeAndCreatedAtBetween(
            Long storeId,
            String movementType,
            java.time.LocalDateTime start,
            java.time.LocalDateTime end
    );

    @Query("""
            select coalesce(sum(
                case
                    when sm.movementType = 'IN' then sm.quantity
                    when sm.movementType = 'OUT' then -sm.quantity
                    else sm.quantity
                end
            ), 0)
            from StockMovementEntity sm
            where sm.store.id = :storeId and sm.ingredient.id = :ingredientId
            """)
    BigDecimal calculateCurrentStock(
            @Param("storeId") Long storeId,
            @Param("ingredientId") Long ingredientId
    );

    @Query("""
            select sm.store.id, sm.store.name, sm.ingredient.id, sm.ingredient.code,
                   sm.ingredient.name, sm.ingredient.unit, sm.ingredient.minStock,
                   coalesce(sum(
                       case
                           when sm.movementType = 'IN' then sm.quantity
                           when sm.movementType = 'OUT' then -sm.quantity
                           else sm.quantity
                       end
                   ), 0)
            from StockMovementEntity sm
            group by sm.store.id, sm.store.name, sm.ingredient.id,
                     sm.ingredient.code, sm.ingredient.name, sm.ingredient.unit,
                     sm.ingredient.minStock
            order by sm.store.id, sm.ingredient.id
            """)
    List<Object[]> calculateAllStockBalances();

    @Query("""
            select sm.store.id, sm.store.name, sm.ingredient.id, sm.ingredient.code,
                   sm.ingredient.name, sm.ingredient.unit, sm.ingredient.minStock,
                   coalesce(sum(
                       case
                           when sm.movementType = 'IN' then sm.quantity
                           when sm.movementType = 'OUT' then -sm.quantity
                           else sm.quantity
                       end
                   ), 0)
            from StockMovementEntity sm
            where sm.store.id = :storeId
            group by sm.store.id, sm.store.name, sm.ingredient.id,
                     sm.ingredient.code, sm.ingredient.name, sm.ingredient.unit,
                     sm.ingredient.minStock
            order by sm.ingredient.id
            """)
    List<Object[]> calculateStockBalancesByStoreId(@Param("storeId") Long storeId);

    @Query("""
            select new com.lowlands.coffee.modules.dashboard.dto.response.DashboardIngredientConsumptionResponse(
                sm.ingredient.id,
                sm.ingredient.name,
                sm.unit,
                coalesce(sum(sm.quantity), 0)
            )
            from StockMovementEntity sm
            where sm.movementType = 'OUT'
              and sm.referenceType = 'ORDER'
              and sm.store.id = :storeId
              and sm.createdAt >= :start
              and sm.createdAt < :end
            group by sm.ingredient.id, sm.ingredient.name, sm.unit
            order by coalesce(sum(sm.quantity), 0) desc
            """)
    List<DashboardIngredientConsumptionResponse> findIngredientConsumptionByStore(
            @Param("storeId") Long storeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    @Query("""
            select sm
            from StockMovementEntity sm
            join fetch sm.store
            join fetch sm.ingredient
            where (:storeId is null or sm.store.id = :storeId)
            order by sm.createdAt desc
            """)
    List<StockMovementEntity> findRecentMovements(
            @Param("storeId") Long storeId,
            Pageable pageable
    );

    @Query("""
            select count(distinct sm.ingredient.id)
            from StockMovementEntity sm
            where sm.store.id = :storeId
            """)
    long countDistinctIngredientsByStoreId(@Param("storeId") Long storeId);
}
