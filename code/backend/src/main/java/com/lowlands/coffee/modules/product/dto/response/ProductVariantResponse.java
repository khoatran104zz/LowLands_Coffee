package com.lowlands.coffee.modules.product.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String size;
    private BigDecimal price;
    private String status;
}
