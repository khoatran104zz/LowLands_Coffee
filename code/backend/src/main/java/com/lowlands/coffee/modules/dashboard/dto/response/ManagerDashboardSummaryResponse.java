package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ManagerDashboardSummaryResponse {

    private final Long storeId;
    private final long totalProducts;
    private final long inventoryItems;
    private final long lowStockItems;
    private final long totalOrders;
    private final BigDecimal totalRevenue;
}
