package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class DashboardTrendPointResponse {

    private final LocalDate date;
    private final String label;
    private final BigDecimal revenue;
    private final long orders;

    public DashboardTrendPointResponse(LocalDate date, String label, BigDecimal revenue, long orders) {
        this.date = date;
        this.label = label;
        this.revenue = revenue;
        this.orders = orders;
    }
}
