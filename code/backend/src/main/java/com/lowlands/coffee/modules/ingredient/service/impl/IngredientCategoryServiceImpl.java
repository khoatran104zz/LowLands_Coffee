package com.lowlands.coffee.modules.ingredient.service.impl;

import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCategoryCreateRequest;
import com.lowlands.coffee.modules.ingredient.dto.request.IngredientCategoryUpdateRequest;
import com.lowlands.coffee.modules.ingredient.dto.response.IngredientCategoryResponse;
import com.lowlands.coffee.modules.ingredient.entity.IngredientCategoryEntity;
import com.lowlands.coffee.modules.ingredient.mapper.IngredientCategoryMapper;
import com.lowlands.coffee.modules.ingredient.repository.IngredientCategoryRepository;
import com.lowlands.coffee.modules.ingredient.service.IngredientCategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class IngredientCategoryServiceImpl implements IngredientCategoryService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";

    private final IngredientCategoryRepository categoryRepository;
    private final IngredientCategoryMapper categoryMapper;

    public IngredientCategoryServiceImpl(
            IngredientCategoryRepository categoryRepository,
            IngredientCategoryMapper categoryMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientCategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientCategoryResponse findById(Long id) {
        return categoryMapper.toResponse(getCategory(id));
    }

    @Override
    public IngredientCategoryResponse create(IngredientCategoryCreateRequest request) {
        String code = request.getCode().trim();
        if (categoryRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Ingredient category code already exists");
        }
        IngredientCategoryEntity category = new IngredientCategoryEntity();
        category.setCode(code);
        category.setName(request.getName().trim());
        category.setDescription(clean(request.getDescription()));
        category.setStatus(request.getStatus() == null ? ACTIVE : request.getStatus());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public IngredientCategoryResponse update(Long id, IngredientCategoryUpdateRequest request) {
        IngredientCategoryEntity category = getCategory(id);
        String code = request.getCode().trim();
        if (categoryRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Ingredient category code already exists");
        }
        category.setCode(code);
        category.setName(request.getName().trim());
        category.setDescription(clean(request.getDescription()));
        category.setStatus(request.getStatus());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        IngredientCategoryEntity category = getCategory(id);
        category.setStatus(INACTIVE);
        categoryRepository.save(category);
    }

    private IngredientCategoryEntity getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient category not found"));
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
