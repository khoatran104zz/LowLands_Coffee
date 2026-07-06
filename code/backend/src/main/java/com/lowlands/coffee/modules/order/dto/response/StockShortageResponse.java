package com.lowlands.coffee.modules.order.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class StockShortageResponse {

    private final Long ingredientId;
    private final String ingredientName;
    private final BigDecimal requiredQuantity;
    private final BigDecimal availableQuantity;
    private final String unit;
}
