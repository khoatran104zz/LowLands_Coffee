package com.lowlands.coffee.modules.ingredient.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class IngredientResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String code;
    private String name;
    private String unit;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
