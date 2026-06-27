package com.lowlands.coffee.modules.product.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ToppingResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private String status;
}
