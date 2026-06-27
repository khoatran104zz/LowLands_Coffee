package com.lowlands.coffee.modules.inventory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class StockMovementResponse {

    private Long id;
    private Long storeId;
    private String storeName;
    private Long ingredientId;
    private String ingredientCode;
    private String ingredientName;
    private String movementType;
    private BigDecimal quantity;
    private String unit;
    private String referenceType;
    private Long referenceId;
    private String note;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}
