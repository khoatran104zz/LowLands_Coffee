package com.lowlands.coffee.modules.ingredient.repository;

import com.lowlands.coffee.modules.ingredient.entity.IngredientCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IngredientCategoryRepository extends JpaRepository<IngredientCategoryEntity, Long> {

    Optional<IngredientCategoryEntity> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);
}
