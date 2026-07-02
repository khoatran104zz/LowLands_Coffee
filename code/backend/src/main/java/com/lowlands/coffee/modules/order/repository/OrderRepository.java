package com.lowlands.coffee.modules.order.repository;

import com.lowlands.coffee.modules.order.entity.OrderEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {

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
}
