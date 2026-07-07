package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class DashboardTopProductResponse {

    private final Long productId;
    private final String productName;
    private final long quantity;
    private final BigDecimal revenue;

    public DashboardTopProductResponse(Long productId, String productName, long quantity, BigDecimal revenue) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.revenue = revenue;
    }
}
