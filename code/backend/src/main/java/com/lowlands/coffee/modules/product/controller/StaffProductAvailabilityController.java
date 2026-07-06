package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductAvailabilityResponse;
import com.lowlands.coffee.modules.product.service.ProductAvailabilityService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff/products/availability")
public class StaffProductAvailabilityController {

    private final ProductAvailabilityService productAvailabilityService;

    public StaffProductAvailabilityController(ProductAvailabilityService productAvailabilityService) {
        this.productAvailabilityService = productAvailabilityService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ApiResponse<List<ProductAvailabilityResponse>> findAvailability(
            @RequestParam(required = false) Long storeId,
            Authentication authentication
    ) {
        return ApiResponse.success(productAvailabilityService.findAvailability(storeId, authentication.getName()));
    }
}
