package com.lowlands.coffee.modules.order.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OrderCompletionFailureResponse {

    private final String reason;
    private final Long productId;
    private final String productName;
    private final Long variantId;
    private final String size;
    private final List<StockShortageResponse> shortages;
}
