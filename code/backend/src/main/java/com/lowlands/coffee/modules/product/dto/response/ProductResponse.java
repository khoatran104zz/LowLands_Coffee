package com.lowlands.coffee.modules.product.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductResponse {

    private Long id;
    private Long categoryId;
    private String name;
    private String description;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CategoryResponse category;
    private List<ProductVariantResponse> variants;
    private List<ToppingResponse> toppings;
}
