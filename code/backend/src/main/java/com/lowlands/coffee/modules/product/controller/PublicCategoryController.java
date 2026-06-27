package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.response.CategoryResponse;
import com.lowlands.coffee.modules.product.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class PublicCategoryController {

    private final CategoryService categoryService;

    public PublicCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> findPublicCategories() {
        return ApiResponse.success(categoryService.findPublicCategories());
    }
}
