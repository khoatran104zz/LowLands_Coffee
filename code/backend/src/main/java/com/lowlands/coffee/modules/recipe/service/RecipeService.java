package com.lowlands.coffee.modules.recipe.service;

import com.lowlands.coffee.modules.recipe.dto.request.RecipeCreateRequest;
import com.lowlands.coffee.modules.recipe.dto.request.RecipeUpdateRequest;
import com.lowlands.coffee.modules.recipe.dto.response.RecipeResponse;

import java.util.List;

public interface RecipeService {

    List<RecipeResponse> findAll();

    RecipeResponse findById(Long id);

    RecipeResponse create(RecipeCreateRequest request);

    RecipeResponse update(Long id, RecipeUpdateRequest request);

    void delete(Long id);
}
