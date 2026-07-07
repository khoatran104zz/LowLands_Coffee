package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class DashboardLowStockResponse {

    private final Long storeId;
    private final String storeName;
    private final Long ingredientId;
    private final String ingredientCode;
    private final String ingredientName;
    private final String unit;
    private final BigDecimal minStock;
    private final BigDecimal currentStock;

    public DashboardLowStockResponse(
            Long storeId,
            String storeName,
            Long ingredientId,
            String ingredientCode,
            String ingredientName,
            String unit,
            BigDecimal minStock,
            BigDecimal currentStock
    ) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.ingredientId = ingredientId;
        this.ingredientCode = ingredientCode;
        this.ingredientName = ingredientName;
        this.unit = unit;
        this.minStock = minStock;
        this.currentStock = currentStock;
    }
}
