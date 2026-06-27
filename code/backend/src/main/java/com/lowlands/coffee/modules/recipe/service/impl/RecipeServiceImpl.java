package com.lowlands.coffee.modules.recipe.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import com.lowlands.coffee.modules.ingredient.repository.IngredientRepository;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import com.lowlands.coffee.modules.product.repository.ProductVariantRepository;
import com.lowlands.coffee.modules.recipe.dto.request.RecipeCreateRequest;
import com.lowlands.coffee.modules.recipe.dto.request.RecipeIngredientRequest;
import com.lowlands.coffee.modules.recipe.dto.request.RecipeUpdateRequest;
import com.lowlands.coffee.modules.recipe.dto.response.RecipeResponse;
import com.lowlands.coffee.modules.recipe.entity.RecipeEntity;
import com.lowlands.coffee.modules.recipe.entity.RecipeIngredientEntity;
import com.lowlands.coffee.modules.recipe.mapper.RecipeMapper;
import com.lowlands.coffee.modules.recipe.repository.RecipeRepository;
import com.lowlands.coffee.modules.recipe.service.RecipeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class RecipeServiceImpl implements RecipeService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";

    private final RecipeRepository recipeRepository;
    private final ProductVariantRepository productVariantRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeMapper recipeMapper;

    public RecipeServiceImpl(
            RecipeRepository recipeRepository,
            ProductVariantRepository productVariantRepository,
            IngredientRepository ingredientRepository,
            RecipeMapper recipeMapper
    ) {
        this.recipeRepository = recipeRepository;
        this.productVariantRepository = productVariantRepository;
        this.ingredientRepository = ingredientRepository;
        this.recipeMapper = recipeMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponse> findAll() {
        return recipeRepository.findAll().stream()
                .map(recipeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponse findById(Long id) {
        return recipeMapper.toResponse(getRecipe(id));
    }

    @Override
    public RecipeResponse create(RecipeCreateRequest request) {
        validateIngredientDuplicates(request.getIngredients());
        String code = request.getCode().trim();
        if (recipeRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Recipe code already exists");
        }
        if (recipeRepository.existsByProductVariant_Id(request.getProductVariantId())) {
            throw new DuplicateResourceException("Product variant already has recipe");
        }
        RecipeEntity recipe = new RecipeEntity();
        recipe.setProductVariant(getProductVariant(request.getProductVariantId()));
        recipe.setCode(code);
        recipe.setName(request.getName().trim());
        recipe.setDescription(clean(request.getDescription()));
        recipe.setStatus(request.getStatus() == null ? ACTIVE : request.getStatus());
        replaceIngredients(recipe, request.getIngredients());
        return recipeMapper.toResponse(recipeRepository.save(recipe));
    }

    @Override
    public RecipeResponse update(Long id, RecipeUpdateRequest request) {
        validateIngredientDuplicates(request.getIngredients());
        RecipeEntity recipe = getRecipe(id);
        String code = request.getCode().trim();
        if (recipeRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Recipe code already exists");
        }
        if (recipeRepository.existsByProductVariant_IdAndIdNot(request.getProductVariantId(), id)) {
            throw new DuplicateResourceException("Product variant already has recipe");
        }
        recipe.setProductVariant(getProductVariant(request.getProductVariantId()));
        recipe.setCode(code);
        recipe.setName(request.getName().trim());
        recipe.setDescription(clean(request.getDescription()));
        recipe.setStatus(request.getStatus());
        recipe.getIngredients().clear();
        replaceIngredients(recipe, request.getIngredients());
        return recipeMapper.toResponse(recipeRepository.save(recipe));
    }

    @Override
    public void delete(Long id) {
        RecipeEntity recipe = getRecipe(id);
        recipe.setStatus(INACTIVE);
        recipeRepository.save(recipe);
    }

    private RecipeEntity getRecipe(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));
    }

    private ProductVariantEntity getProductVariant(Long id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
    }

    private IngredientEntity getIngredient(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
    }

    private void replaceIngredients(RecipeEntity recipe, List<RecipeIngredientRequest> items) {
        items.forEach(item -> {
            RecipeIngredientEntity recipeIngredient = new RecipeIngredientEntity();
            recipeIngredient.setRecipe(recipe);
            recipeIngredient.setIngredient(getIngredient(item.getIngredientId()));
            recipeIngredient.setQuantity(item.getQuantity());
            recipeIngredient.setUnit(item.getUnit().trim());
            recipe.getIngredients().add(recipeIngredient);
        });
    }

    private void validateIngredientDuplicates(List<RecipeIngredientRequest> items) {
        Set<Long> ingredientIds = new HashSet<>();
        for (RecipeIngredientRequest item : items) {
            if (!ingredientIds.add(item.getIngredientId())) {
                throw new BadRequestException("Ingredient must be unique per recipe");
            }
        }
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
