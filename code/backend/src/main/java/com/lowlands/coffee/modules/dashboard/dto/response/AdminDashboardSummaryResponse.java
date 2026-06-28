package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminDashboardSummaryResponse {

    private final long totalUsers;
    private final long totalStores;
    private final long totalProducts;
    private final long totalOrders;
    private final BigDecimal totalRevenue;
}
