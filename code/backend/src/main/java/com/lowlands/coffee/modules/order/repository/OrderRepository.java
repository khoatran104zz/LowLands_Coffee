package com.lowlands.coffee.modules.order.repository;

import com.lowlands.coffee.modules.order.entity.OrderEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {

    @Query("select o.user.id, count(o.id), coalesce(sum(o.totalAmount), 0) " +
           "from OrderEntity o " +
           "where o.status = :status and o.user.id is not null " +
           "group by o.user.id")
    List<Object[]> getCustomerOrderStatsByStatus(@Param("status") String status);

    boolean existsByOrderCode(String orderCode);

    long countByOrderCodeStartingWith(String prefix);

    @Override
    @EntityGraph(attributePaths = {"store", "user", "payment"})
    Optional<OrderEntity> findById(Long id);

    @EntityGraph(attributePaths = {"store", "user", "payment"})
    Optional<OrderEntity> findByOrderCode(String orderCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from OrderEntity o where o.id = :id")
    Optional<OrderEntity> findByIdForUpdate(@Param("id") Long id);

    @Query("select coalesce(sum(o.totalAmount), 0) from OrderEntity o where o.status = :status")
    BigDecimal sumTotalRevenueByStatus(@Param("status") String status);

    long countByStoreId(Long storeId);

    long countByStoreIdAndCreatedAtBetween(Long storeId, LocalDateTime start, LocalDateTime end);

    @Query("select coalesce(sum(o.totalAmount), 0) from OrderEntity o where o.store.id = :storeId and o.status = :status")
    BigDecimal sumRevenueByStoreAndStatus(
            @Param("storeId") Long storeId,
            @Param("status") String status
    );

    @Query("select coalesce(sum(o.totalAmount), 0) from OrderEntity o where o.store.id = :storeId and o.status = :status and o.createdAt >= :start and o.createdAt < :end")
    BigDecimal sumRevenueByStoreAndStatusAndCreatedAtBetween(
            @Param("storeId") Long storeId,
            @Param("status") String status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    long countByStoreIdAndStatus(Long storeId, String status);

    long countByStoreIdAndStatusAndCreatedAtBetween(Long storeId, String status, LocalDateTime start, LocalDateTime end);
}
