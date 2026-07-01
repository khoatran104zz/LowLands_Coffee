package com.lowlands.coffee.modules.ingredient.service.impl;

import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCreateRequest;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientUpdateRequest;
import com.lowlands.coffee.modules.ingredient.dto.response.IngredientResponse;
import com.lowlands.coffee.modules.ingredient.entity.IngredientCategoryEntity;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import com.lowlands.coffee.modules.ingredient.mapper.IngredientMapper;
import com.lowlands.coffee.modules.ingredient.repository.IngredientCategoryRepository;
import com.lowlands.coffee.modules.ingredient.repository.IngredientRepository;
import com.lowlands.coffee.modules.ingredient.service.IngredientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class IngredientServiceImpl implements IngredientService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";
    private static final BigDecimal ZERO_STOCK = BigDecimal.ZERO;

    private final IngredientRepository ingredientRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final IngredientMapper ingredientMapper;

    public IngredientServiceImpl(
            IngredientRepository ingredientRepository,
            IngredientCategoryRepository categoryRepository,
            IngredientMapper ingredientMapper
    ) {
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
        this.ingredientMapper = ingredientMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> findAll() {
        return ingredientRepository.findAll().stream()
                .map(ingredientMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientResponse findById(Long id) {
        return ingredientMapper.toResponse(getIngredient(id));
    }

    @Override
    public IngredientResponse create(IngredientCreateRequest request) {
        String code = request.getCode().trim();
        if (ingredientRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Ingredient code already exists");
        }
        IngredientEntity ingredient = new IngredientEntity();
        ingredient.setCategory(getCategory(request.getCategoryId()));
        ingredient.setCode(code);
        ingredient.setName(request.getName().trim());
        ingredient.setUnit(request.getUnit().trim());
        ingredient.setMinStock(request.getMinStock() == null ? ZERO_STOCK : request.getMinStock());
        ingredient.setDescription(clean(request.getDescription()));
        ingredient.setStatus(request.getStatus() == null ? ACTIVE : request.getStatus());
        return ingredientMapper.toResponse(ingredientRepository.save(ingredient));
    }

    @Override
    public IngredientResponse update(Long id, IngredientUpdateRequest request) {
        IngredientEntity ingredient = getIngredient(id);
        String code = request.getCode().trim();
        if (ingredientRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Ingredient code already exists");
        }
        ingredient.setCategory(getCategory(request.getCategoryId()));
        ingredient.setCode(code);
        ingredient.setName(request.getName().trim());
        ingredient.setUnit(request.getUnit().trim());
        ingredient.setMinStock(request.getMinStock() == null ? ZERO_STOCK : request.getMinStock());
        ingredient.setDescription(clean(request.getDescription()));
        ingredient.setStatus(request.getStatus());
        return ingredientMapper.toResponse(ingredientRepository.save(ingredient));
    }

    @Override
    public void delete(Long id) {
        IngredientEntity ingredient = getIngredient(id);
        ingredient.setStatus(INACTIVE);
        ingredientRepository.save(ingredient);
    }

    private IngredientEntity getIngredient(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
    }

    private IngredientCategoryEntity getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient category not found"));
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
