package com.lowlands.coffee.modules.product.mapper;

import com.lowlands.coffee.modules.product.dto.response.ProductVariantResponse;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariantResponse toResponse(ProductVariantEntity entity) {
        ProductVariantResponse response = new ProductVariantResponse();
        response.setId(entity.getId());
        response.setProductId(entity.getProduct().getId());
        response.setSize(entity.getSize());
        response.setPrice(entity.getPrice());
        response.setStatus(entity.getStatus());
        return response;
    }
}
