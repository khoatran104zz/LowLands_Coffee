package com.lowlands.coffee.modules.promotion.mapper;

import com.lowlands.coffee.modules.product.entity.CategoryEntity;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.promotion.dto.response.PromotionResponse;
import com.lowlands.coffee.modules.promotion.entity.PromotionEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class PromotionMapper {

    public PromotionResponse toResponse(PromotionEntity entity) {
        if (entity == null) {
            return null;
        }

        PromotionResponse response = new PromotionResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setDiscountType(entity.getDiscountType());
        response.setDiscountValue(entity.getDiscountValue());
        response.setMinimumOrderValue(entity.getMinimumOrderValue());
        response.setMaximumDiscount(entity.getMaximumDiscount());
        response.setStartDate(entity.getStartDate());
        response.setEndDate(entity.getEndDate());
        response.setUsageLimit(entity.getUsageLimit());
        response.setUsedCount(entity.getUsedCount());
        response.setStatus(entity.getStatus());
        response.setApplicableType(entity.getApplicableType());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getProducts() != null) {
            response.setApplicableProductIds(
                entity.getProducts().stream()
                    .map(ProductEntity::getId)
                    .collect(Collectors.toList())
            );
        } else {
            response.setApplicableProductIds(new ArrayList<>());
        }

        if (entity.getCategories() != null) {
            response.setApplicableCategoryIds(
                entity.getCategories().stream()
                    .map(CategoryEntity::getId)
                    .collect(Collectors.toList())
            );
        } else {
            response.setApplicableCategoryIds(new ArrayList<>());
        }

        return response;
    }
}
