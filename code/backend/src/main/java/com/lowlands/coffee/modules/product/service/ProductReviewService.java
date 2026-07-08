package com.lowlands.coffee.modules.product.service;

import com.lowlands.coffee.modules.product.dto.request.ProductReviewRequest;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewEligibilityResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewSummaryResponse;

public interface ProductReviewService {

    ProductReviewSummaryResponse findByProductId(Long productId);

    ProductReviewEligibilityResponse getEligibility(Long productId, String actorEmail);

    ProductReviewResponse submit(Long productId, ProductReviewRequest request, String actorEmail);
}
