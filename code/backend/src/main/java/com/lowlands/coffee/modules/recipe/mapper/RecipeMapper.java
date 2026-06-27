package com.lowlands.coffee.modules.recipe.mapper;

import com.lowlands.coffee.modules.recipe.dto.response.RecipeIngredientResponse;
import com.lowlands.coffee.modules.recipe.dto.response.RecipeResponse;
import com.lowlands.coffee.modules.recipe.entity.RecipeEntity;
import com.lowlands.coffee.modules.recipe.entity.RecipeIngredientEntity;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class RecipeMapper {

    public RecipeResponse toResponse(RecipeEntity entity) {
        RecipeResponse response = new RecipeResponse();
        response.setId(entity.getId());
        response.setProductVariantId(entity.getProductVariant().getId());
        response.setProductVariantSize(entity.getProductVariant().getSize());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setIngredients(entity.getIngredients().stream()
                .sorted(Comparator.comparing(item -> item.getIngredient().getId()))
                .map(this::toIngredientResponse)
                .toList());
        return response;
    }

    private RecipeIngredientResponse toIngredientResponse(RecipeIngredientEntity entity) {
        RecipeIngredientResponse response = new RecipeIngredientResponse();
        response.setId(entity.getId());
        response.setIngredientId(entity.getIngredient().getId());
        response.setIngredientCode(entity.getIngredient().getCode());
        response.setIngredientName(entity.getIngredient().getName());
        response.setQuantity(entity.getQuantity());
        response.setUnit(entity.getUnit());
        return response;
    }
}
