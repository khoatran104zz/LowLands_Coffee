package com.lowlands.coffee.modules.order.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemToppingResponse {

    private Long id;
    private Long toppingId;
    private String toppingName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
}
