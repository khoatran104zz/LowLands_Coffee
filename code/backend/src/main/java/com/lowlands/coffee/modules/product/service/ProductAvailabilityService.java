package com.lowlands.coffee.modules.product.service;

import com.lowlands.coffee.modules.product.dto.response.ProductAvailabilityResponse;

import java.util.List;

public interface ProductAvailabilityService {

    List<ProductAvailabilityResponse> findAvailability(Long storeId, String actorEmail);
}
