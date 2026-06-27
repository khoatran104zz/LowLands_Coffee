package com.lowlands.coffee.modules.ingredient.mapper;

import com.lowlands.coffee.modules.ingredient.dto.response.IngredientCategoryResponse;
import com.lowlands.coffee.modules.ingredient.entity.IngredientCategoryEntity;
import org.springframework.stereotype.Component;

@Component
public class IngredientCategoryMapper {

    public IngredientCategoryResponse toResponse(IngredientCategoryEntity entity) {
        IngredientCategoryResponse response = new IngredientCategoryResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}
