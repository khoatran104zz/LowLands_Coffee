package com.lowlands.coffee.modules.promotion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PromotionValidateResponse {
    private boolean valid;
    private BigDecimal discount;
    private String message;
}
