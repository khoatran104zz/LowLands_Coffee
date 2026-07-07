package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class DashboardPaymentBreakdownResponse {

    private final String paymentMethod;
    private final long orderCount;
    private final BigDecimal revenue;

    public DashboardPaymentBreakdownResponse(String paymentMethod, long orderCount, BigDecimal revenue) {
        this.paymentMethod = paymentMethod;
        this.orderCount = orderCount;
        this.revenue = revenue;
    }
}
