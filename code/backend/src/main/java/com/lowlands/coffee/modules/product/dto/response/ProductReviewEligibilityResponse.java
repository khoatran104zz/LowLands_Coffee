package com.lowlands.coffee.modules.product.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductReviewEligibilityResponse {

    private boolean canReview;
    private boolean hasReviewed;
    private String message;
    private ProductReviewResponse review;
}
