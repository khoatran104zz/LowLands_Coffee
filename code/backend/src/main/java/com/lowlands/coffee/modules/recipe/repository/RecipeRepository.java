package com.lowlands.coffee.modules.recipe.repository;

import com.lowlands.coffee.modules.recipe.entity.RecipeEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<RecipeEntity, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByProductVariant_Id(Long productVariantId);

    boolean existsByProductVariant_IdAndIdNot(Long productVariantId, Long id);

    @Override
    @EntityGraph(attributePaths = {"productVariant", "ingredients", "ingredients.ingredient"})
    List<RecipeEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"productVariant", "ingredients", "ingredients.ingredient"})
    Optional<RecipeEntity> findById(Long id);

    @EntityGraph(attributePaths = {"productVariant", "ingredients", "ingredients.ingredient"})
    Optional<RecipeEntity> findByProductVariant_IdAndStatus(Long productVariantId, String status);
}
