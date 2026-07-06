package com.lowlands.coffee.modules.promotion.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PromotionItemRequest {
    private Long productId;
    private Integer quantity;
}
