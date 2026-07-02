package com.lowlands.coffee.modules.order.repository;

import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
}
