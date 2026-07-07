package com.lowlands.coffee.modules.order.repository;

import com.lowlands.coffee.modules.dashboard.dto.response.DashboardPaymentBreakdownResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardStoreRankingResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardTopCategoryResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardTopProductResponse;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
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

    @Query("""
            select count(o)
            from OrderEntity o
            where (:storeId is null or o.store.id = :storeId)
            """)
    long countByOptionalStoreId(@Param("storeId") Long storeId);

    @Query("""
            select count(o)
            from OrderEntity o
            where o.status = :status
              and (:storeId is null or o.store.id = :storeId)
            """)
    long countByStatusAndOptionalStoreId(
            @Param("status") String status,
            @Param("storeId") Long storeId
    );

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

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from OrderEntity o
            join o.payment p
            where o.status = 'COMPLETED'
              and p.paymentStatus = 'PAID'
              and (:storeId is null or o.store.id = :storeId)
            """)
    BigDecimal sumPaidCompletedRevenue(@Param("storeId") Long storeId);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from OrderEntity o
            join o.payment p
            where o.status = 'COMPLETED'
              and p.paymentStatus = 'PAID'
              and (:storeId is null or o.store.id = :storeId)
              and o.createdAt >= :start
              and o.createdAt < :end
            """)
    BigDecimal sumPaidCompletedRevenueBetween(
            @Param("storeId") Long storeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            select new com.lowlands.coffee.modules.dashboard.dto.response.DashboardPaymentBreakdownResponse(
                p.paymentMethod,
                count(o),
                coalesce(sum(o.totalAmount), 0)
            )
            from OrderEntity o
            join o.payment p
            where o.status = 'COMPLETED'
              and p.paymentStatus = 'PAID'
              and (:storeId is null or o.store.id = :storeId)
              and o.createdAt >= :start
              and o.createdAt < :end
            group by p.paymentMethod
            order by coalesce(sum(o.totalAmount), 0) desc
            """)
    List<DashboardPaymentBreakdownResponse> findPaymentBreakdownForPaidCompletedOrders(
            @Param("storeId") Long storeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            select new com.lowlands.coffee.modules.dashboard.dto.response.DashboardTopProductResponse(
                oi.product.id,
                oi.productName,
                coalesce(sum(oi.quantity), 0),
                coalesce(sum(oi.totalPrice), 0)
            )
            from OrderItemEntity oi
            join oi.order o
            join o.payment p
            where o.status = 'COMPLETED'
              and p.paymentStatus = 'PAID'
              and (:storeId is null or o.store.id = :storeId)
              and o.createdAt >= :start
              and o.createdAt < :end
            group by oi.product.id, oi.productName
            order by coalesce(sum(oi.totalPrice), 0) desc
            """)
    List<DashboardTopProductResponse> findTopProductsByPaidCompletedRevenue(
            @Param("storeId") Long storeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    @Query("""
            select new com.lowlands.coffee.modules.dashboard.dto.response.DashboardTopCategoryResponse(
                oi.product.category.id,
                oi.product.category.name,
                coalesce(sum(oi.quantity), 0),
                coalesce(sum(oi.totalPrice), 0)
            )
            from OrderItemEntity oi
            join oi.order o
            join o.payment p
            where o.status = 'COMPLETED'
              and p.paymentStatus = 'PAID'
              and (:storeId is null or o.store.id = :storeId)
              and o.createdAt >= :start
              and o.createdAt < :end
            group by oi.product.category.id, oi.product.category.name
            order by coalesce(sum(oi.totalPrice), 0) desc
            """)
    List<DashboardTopCategoryResponse> findTopCategoriesByPaidCompletedRevenue(
            @Param("storeId") Long storeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    @Query("""
            select new com.lowlands.coffee.modules.dashboard.dto.response.DashboardStoreRankingResponse(
                o.store.id,
                o.store.name,
                count(o),
                coalesce(sum(o.totalAmount), 0)
            )
            from OrderEntity o
            join o.payment p
            where o.status = 'COMPLETED'
              and p.paymentStatus = 'PAID'
              and (:storeId is null or o.store.id = :storeId)
              and o.createdAt >= :start
              and o.createdAt < :end
            group by o.store.id, o.store.name
            order by coalesce(sum(o.totalAmount), 0) desc
            """)
    List<DashboardStoreRankingResponse> findStoreRankingByPaidCompletedRevenue(
            @Param("storeId") Long storeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    long countByStoreIdAndStatus(Long storeId, String status);

    long countByStoreIdAndStatusAndCreatedAtBetween(Long storeId, String status, LocalDateTime start, LocalDateTime end);
}
