package com.lowlands.coffee.modules.inventory.repository;

import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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
            select count(distinct sm.ingredient.id)
            from StockMovementEntity sm
            where sm.store.id = :storeId
            """)
    long countDistinctIngredientsByStoreId(@Param("storeId") Long storeId);
}
