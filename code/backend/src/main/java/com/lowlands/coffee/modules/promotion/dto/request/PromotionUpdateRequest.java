package com.lowlands.coffee.modules.promotion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PromotionUpdateRequest {

    @NotBlank
    @Size(max = 50)
    private String code;

    @NotBlank
    @Size(max = 150)
    private String name;

    private String description;

    @NotBlank
    @Size(max = 30)
    private String discountType;

    @NotNull
    private BigDecimal discountValue;

    private BigDecimal minimumOrderValue;

    private BigDecimal maximumDiscount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer usageLimit;

    @NotBlank
    @Size(max = 30)
    private String status;

    @NotBlank
    @Size(max = 30)
    private String applicableType;

    private List<Long> applicableProductIds;

    private List<Long> applicableCategoryIds;
}
