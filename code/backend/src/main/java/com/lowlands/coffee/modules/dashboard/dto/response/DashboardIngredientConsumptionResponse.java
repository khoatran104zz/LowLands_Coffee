package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class DashboardIngredientConsumptionResponse {

    private final Long ingredientId;
    private final String ingredientName;
    private final String unit;
    private final BigDecimal quantity;

    public DashboardIngredientConsumptionResponse(
            Long ingredientId,
            String ingredientName,
            String unit,
            BigDecimal quantity
    ) {
        this.ingredientId = ingredientId;
        this.ingredientName = ingredientName;
        this.unit = unit;
        this.quantity = quantity;
    }
}
