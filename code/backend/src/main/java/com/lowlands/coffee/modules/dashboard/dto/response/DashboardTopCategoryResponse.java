package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class DashboardTopCategoryResponse {

    private final Long categoryId;
    private final String categoryName;
    private final long quantity;
    private final BigDecimal revenue;

    public DashboardTopCategoryResponse(Long categoryId, String categoryName, long quantity, BigDecimal revenue) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.quantity = quantity;
        this.revenue = revenue;
    }
}
