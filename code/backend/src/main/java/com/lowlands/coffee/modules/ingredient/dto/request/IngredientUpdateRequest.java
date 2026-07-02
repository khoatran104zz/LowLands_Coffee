package com.lowlands.coffee.modules.ingredient.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class IngredientUpdateRequest {

    @NotNull
    private Long categoryId;

    @NotBlank
    @Size(max = 50)
    private String code;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 20)
    private String unit;

    @DecimalMin(value = "0.00")
    private BigDecimal minStock;

    @Size(max = 1000)
    private String description;

    @NotBlank
    @Pattern(regexp = "active|inactive")
    private String status;
}
