package com.lowlands.coffee.modules.product.mapper;

import com.lowlands.coffee.modules.product.dto.response.ProductResponse;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.entity.ProductToppingEntity;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class ProductMapper {

    private static final String ACTIVE = "active";

    private final CategoryMapper categoryMapper;
    private final ProductVariantMapper productVariantMapper;
    private final ToppingMapper toppingMapper;

    public ProductMapper(
            CategoryMapper categoryMapper,
            ProductVariantMapper productVariantMapper,
            ToppingMapper toppingMapper
    ) {
        this.categoryMapper = categoryMapper;
        this.productVariantMapper = productVariantMapper;
        this.toppingMapper = toppingMapper;
    }

    public ProductResponse toResponse(ProductEntity entity) {
        return toResponse(entity, false);
    }

    public ProductResponse toPublicResponse(ProductEntity entity) {
        return toResponse(entity, true);
    }

    private ProductResponse toResponse(ProductEntity entity, boolean activeOnly) {
        ProductResponse response = new ProductResponse();
        response.setId(entity.getId());
        response.setCategoryId(entity.getCategory().getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setImageUrl(entity.getImageUrl());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setCategory(categoryMapper.toResponse(entity.getCategory()));
        response.setVariants(entity.getVariants().stream()
                .filter(variant -> includeStatus(variant.getStatus(), activeOnly))
                .sorted(Comparator.comparingInt(this::sizeOrder))
                .map(productVariantMapper::toResponse)
                .toList());
        response.setToppings(entity.getProductToppings().stream()
                .map(ProductToppingEntity::getTopping)
                .filter(topping -> includeStatus(topping.getStatus(), activeOnly))
                .sorted(Comparator.comparing(ToppingEntity::getId))
                .map(toppingMapper::toResponse)
                .toList());
        return response;
    }

    private boolean includeStatus(String status, boolean activeOnly) {
        return !activeOnly || ACTIVE.equals(status);
    }

    private int sizeOrder(ProductVariantEntity variant) {
        return switch (variant.getSize()) {
            case "S" -> 1;
            case "M" -> 2;
            case "L" -> 3;
            default -> 4;
        };
    }
}
