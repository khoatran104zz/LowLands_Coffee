package com.lowlands.coffee.modules.recipe.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RecipeResponse {

    private Long id;
    private Long productVariantId;
    private String productVariantSize;
    private String code;
    private String name;
    private String description;
    private String status;
    private List<RecipeIngredientResponse> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
