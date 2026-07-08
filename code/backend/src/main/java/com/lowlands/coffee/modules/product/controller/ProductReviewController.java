package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.request.ProductReviewRequest;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewEligibilityResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewSummaryResponse;
import com.lowlands.coffee.modules.product.service.ProductReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    public ProductReviewController(ProductReviewService productReviewService) {
        this.productReviewService = productReviewService;
    }

    @GetMapping
    public ApiResponse<ProductReviewSummaryResponse> findByProductId(@PathVariable Long productId) {
        return ApiResponse.success(productReviewService.findByProductId(productId));
    }

    @GetMapping("/eligibility")
    public ApiResponse<ProductReviewEligibilityResponse> getEligibility(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        return ApiResponse.success(productReviewService.getEligibility(productId, authentication.getName()));
    }

    @PostMapping
    public ApiResponse<ProductReviewResponse> submit(
            @PathVariable Long productId,
            @Valid @RequestBody ProductReviewRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Review saved", productReviewService.submit(productId, request, authentication.getName()));
    }
}
