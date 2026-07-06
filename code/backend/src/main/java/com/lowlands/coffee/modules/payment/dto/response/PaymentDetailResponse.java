package com.lowlands.coffee.modules.payment.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentDetailResponse {

    private Long id;
    private Long orderId;
    private String orderCode;
    private Long storeId;
    private String storeName;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
