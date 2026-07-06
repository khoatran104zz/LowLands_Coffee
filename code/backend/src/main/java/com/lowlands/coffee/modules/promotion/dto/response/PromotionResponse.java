package com.lowlands.coffee.modules.promotion.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PromotionResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumOrderValue;
    private BigDecimal maximumDiscount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private String status;
    private String applicableType;
    private List<Long> applicableProductIds;
    private List<Long> applicableCategoryIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
