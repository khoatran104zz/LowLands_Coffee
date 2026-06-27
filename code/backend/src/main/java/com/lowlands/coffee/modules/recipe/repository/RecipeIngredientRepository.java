package com.lowlands.coffee.modules.recipe.repository;

import com.lowlands.coffee.modules.recipe.entity.RecipeIngredientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredientEntity, Long> {
}
