package com.lowlands.coffee.modules.promotion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class PromotionValidateRequest {

    @NotBlank
    private String promotionCode;

    @NotEmpty
    private List<PromotionItemRequest> items;

    @NotNull
    private BigDecimal orderTotal;
}
