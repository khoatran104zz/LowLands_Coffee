package com.lowlands.coffee.modules.dashboard.dto.response;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class DashboardRecentActivityResponse {

    private final String type;
    private final String title;
    private final String description;
    private final LocalDateTime createdAt;
    private final BigDecimal amount;
    private final String storeName;

    public DashboardRecentActivityResponse(
            String type,
            String title,
            String description,
            LocalDateTime createdAt,
            BigDecimal amount,
            String storeName
    ) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.amount = amount;
        this.storeName = storeName;
    }
}
