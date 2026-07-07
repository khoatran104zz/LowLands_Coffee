package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class DashboardStoreRankingResponse {

    private final Long storeId;
    private final String storeName;
    private final long completedOrders;
    private final BigDecimal revenue;

    public DashboardStoreRankingResponse(Long storeId, String storeName, long completedOrders, BigDecimal revenue) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.completedOrders = completedOrders;
        this.revenue = revenue;
    }
}
