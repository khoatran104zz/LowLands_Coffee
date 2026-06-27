package com.lowlands.coffee.modules.ingredient.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCategoryCreateRequest;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCategoryUpdateRequest;
import com.lowlands.coffee.modules.ingredient.dto.response.IngredientCategoryResponse;
import com.lowlands.coffee.modules.ingredient.service.IngredientCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ingredient-categories")
public class IngredientCategoryController {

    private final IngredientCategoryService categoryService;

    public IngredientCategoryController(IngredientCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INGREDIENT_VIEW')")
    public ApiResponse<List<IngredientCategoryResponse>> findAll() {
        return ApiResponse.success(categoryService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INGREDIENT_VIEW')")
    public ApiResponse<IngredientCategoryResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(categoryService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('INGREDIENT_CREATE')")
    public ApiResponse<IngredientCategoryResponse> create(
            @Valid @RequestBody IngredientCategoryCreateRequest request
    ) {
        return ApiResponse.success("Ingredient category created", categoryService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INGREDIENT_UPDATE')")
    public ApiResponse<IngredientCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody IngredientCategoryUpdateRequest request
    ) {
        return ApiResponse.success(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INGREDIENT_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.success(null);
    }
}
