package com.lowlands.coffee.modules.recipe.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.recipe.dto.request.RecipeCreateRequest;
import com.lowlands.coffee.modules.recipe.dto.request.RecipeUpdateRequest;
import com.lowlands.coffee.modules.recipe.dto.response.RecipeResponse;
import com.lowlands.coffee.modules.recipe.service.RecipeService;
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
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('RECIPE_VIEW')")
    public ApiResponse<List<RecipeResponse>> findAll() {
        return ApiResponse.success(recipeService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RECIPE_VIEW')")
    public ApiResponse<RecipeResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(recipeService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('RECIPE_CREATE')")
    public ApiResponse<RecipeResponse> create(@Valid @RequestBody RecipeCreateRequest request) {
        return ApiResponse.success("Recipe created", recipeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RECIPE_UPDATE')")
    public ApiResponse<RecipeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RecipeUpdateRequest request
    ) {
        return ApiResponse.success(recipeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RECIPE_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        recipeService.delete(id);
        return ApiResponse.success(null);
    }
}
