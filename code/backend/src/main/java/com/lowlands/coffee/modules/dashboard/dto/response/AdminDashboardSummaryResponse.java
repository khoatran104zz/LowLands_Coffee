package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AdminDashboardSummaryResponse {

    private final long totalUsers;
    private final long totalStores;
    private final long totalProducts;
    private final long totalOrders;
    private final BigDecimal totalRevenue;
    private final BigDecimal todayRevenue;
    private final BigDecimal weekRevenue;
    private final BigDecimal monthRevenue;
    private final BigDecimal yearRevenue;
    private final long ordersToday;
    private final long completedOrdersToday;
    private final long cancelledOrdersToday;
    private final long completedOrders;
    private final long cancelledOrders;
    private final long lowStockCount;
    private final List<DashboardPaymentBreakdownResponse> paymentBreakdown;
    private final List<DashboardTopProductResponse> topProducts;
    private final List<DashboardTopCategoryResponse> topCategories;
    private final List<DashboardStoreRankingResponse> storeRanking;
    private final List<DashboardTrendPointResponse> revenueTrend;
    private final List<DashboardTrendPointResponse> orderTrend;
    private final List<DashboardLowStockResponse> lowStockItems;
    private final List<DashboardRecentActivityResponse> recentActivities;
}
