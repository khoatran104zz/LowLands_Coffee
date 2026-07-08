package com.lowlands.coffee.modules.product.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProductReviewSummaryResponse {

    private double averageRating;
    private long reviewCount;
    private List<ProductReviewResponse> reviews;
}
