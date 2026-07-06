package com.lowlands.coffee.modules.product.dto.response;

import com.lowlands.coffee.modules.order.dto.response.StockShortageResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProductAvailabilityResponse {

    private final Long productId;
    private final String productName;
    private final Long variantId;
    private final String size;
    private final boolean available;
    private final String reason;
    private final List<StockShortageResponse> shortages;
}
