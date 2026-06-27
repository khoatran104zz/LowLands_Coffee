package com.lowlands.coffee.modules.ingredient.mapper;

import com.lowlands.coffee.modules.ingredient.dto.response.IngredientResponse;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import org.springframework.stereotype.Component;

@Component
public class IngredientMapper {

    public IngredientResponse toResponse(IngredientEntity entity) {
        IngredientResponse response = new IngredientResponse();
        response.setId(entity.getId());
        response.setCategoryId(entity.getCategory().getId());
        response.setCategoryName(entity.getCategory().getName());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setUnit(entity.getUnit());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}
