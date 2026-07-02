package com.lowlands.coffee.modules.order.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private Long productVariantId;
    private String productName;
    private String size;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String note;
    private List<OrderItemToppingResponse> toppings;
}
