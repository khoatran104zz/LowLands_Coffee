package com.lowlands.coffee.modules.order.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentResponse {

    private Long id;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
