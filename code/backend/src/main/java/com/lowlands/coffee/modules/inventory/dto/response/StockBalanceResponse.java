package com.lowlands.coffee.modules.inventory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class StockBalanceResponse {

    private Long storeId;
    private String storeName;
    private Long ingredientId;
    private String ingredientCode;
    private String ingredientName;
    private String unit;
    private BigDecimal currentStock;
}
