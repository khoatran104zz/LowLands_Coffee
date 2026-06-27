package com.lowlands.coffee.modules.ingredient.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCreateRequest;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientUpdateRequest;
import com.lowlands.coffee.modules.ingredient.dto.response.IngredientResponse;
import com.lowlands.coffee.modules.ingredient.service.IngredientService;
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
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INGREDIENT_VIEW')")
    public ApiResponse<List<IngredientResponse>> findAll() {
        return ApiResponse.success(ingredientService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INGREDIENT_VIEW')")
    public ApiResponse<IngredientResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(ingredientService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('INGREDIENT_CREATE')")
    public ApiResponse<IngredientResponse> create(@Valid @RequestBody IngredientCreateRequest request) {
        return ApiResponse.success("Ingredient created", ingredientService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INGREDIENT_UPDATE')")
    public ApiResponse<IngredientResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody IngredientUpdateRequest request
    ) {
        return ApiResponse.success(ingredientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INGREDIENT_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ingredientService.delete(id);
        return ApiResponse.success(null);
    }
}
