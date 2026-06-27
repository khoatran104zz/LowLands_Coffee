package com.lowlands.coffee.modules.recipe.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RecipeIngredientResponse {

    private Long id;
    private Long ingredientId;
    private String ingredientCode;
    private String ingredientName;
    private BigDecimal quantity;
    private String unit;
}
