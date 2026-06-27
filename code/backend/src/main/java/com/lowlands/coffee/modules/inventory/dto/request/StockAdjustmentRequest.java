package com.lowlands.coffee.modules.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class StockAdjustmentRequest {

    @NotNull
    private Long storeId;

    @NotNull
    private Long ingredientId;

    @NotNull
    private BigDecimal quantity;

    @NotBlank
    @Size(max = 20)
    private String unit;

    @NotNull
    private Long createdById;

    @Size(max = 255)
    private String note;
}
