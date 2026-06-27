package com.lowlands.coffee.modules.recipe.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RecipeIngredientRequest {

    @NotNull
    private Long ingredientId;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal quantity;

    @NotBlank
    @Size(max = 20)
    private String unit;
}
