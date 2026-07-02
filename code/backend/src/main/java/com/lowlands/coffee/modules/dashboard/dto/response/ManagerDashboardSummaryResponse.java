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

    // Added fields for real stats
    private final long todayOrders;
    private final BigDecimal todayRevenue;
    private final long preparingOrders;
    private final long completedOrders;
    private final long activeStaff;
    private final long todayGoodsReceipts;

    // Added fields for reports/revenue page
    private final BigDecimal yesterdayRevenue;
    private final BigDecimal thisWeekRevenue;
    private final BigDecimal thisMonthRevenue;
}
