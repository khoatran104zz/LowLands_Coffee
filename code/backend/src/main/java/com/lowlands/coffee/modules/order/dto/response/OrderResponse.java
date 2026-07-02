package com.lowlands.coffee.modules.order.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderResponse {

    private Long id;
    private String orderCode;
    private String orderType;
    private String status;
    private Long userId;
    private Long storeId;
    private String storeName;
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String note;
    private PaymentResponse payment;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
