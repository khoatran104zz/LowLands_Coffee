package com.lowlands.coffee.modules.ingredient.service;

import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCategoryCreateRequest;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCategoryUpdateRequest;
import com.lowlands.coffee.modules.ingredient.dto.response.IngredientCategoryResponse;

import java.util.List;

public interface IngredientCategoryService {

    List<IngredientCategoryResponse> findAll();

    IngredientCategoryResponse findById(Long id);

    IngredientCategoryResponse create(IngredientCategoryCreateRequest request);

    IngredientCategoryResponse update(Long id, IngredientCategoryUpdateRequest request);

    void delete(Long id);
}
