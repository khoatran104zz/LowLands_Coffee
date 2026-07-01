package com.lowlands.coffee.modules.order.repository;

import com.lowlands.coffee.modules.order.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
}
