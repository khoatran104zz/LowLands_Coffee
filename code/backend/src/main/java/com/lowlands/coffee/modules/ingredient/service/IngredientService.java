package com.lowlands.coffee.modules.ingredient.service;

import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCreateRequest;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientUpdateRequest;
import com.lowlands.coffee.modules.ingredient.dto.response.IngredientResponse;

import java.util.List;

public interface IngredientService {

    List<IngredientResponse> findAll();

    IngredientResponse findById(Long id);

    IngredientResponse create(IngredientCreateRequest request);

    IngredientResponse update(Long id, IngredientUpdateRequest request);

    void delete(Long id);
}
