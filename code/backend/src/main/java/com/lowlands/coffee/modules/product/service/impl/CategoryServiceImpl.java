package com.lowlands.coffee.modules.product.service.impl;

import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.product.dto.request.CategoryCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.CategoryUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.CategoryResponse;
import com.lowlands.coffee.modules.product.entity.CategoryEntity;
import com.lowlands.coffee.modules.product.mapper.CategoryMapper;
import com.lowlands.coffee.modules.product.repository.CategoryRepository;
import com.lowlands.coffee.modules.product.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findPublicCategories() {
        return categoryRepository.findByStatusOrderByIdAsc(ACTIVE).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAllByOrderByIdAsc().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse create(CategoryCreateRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Category name already exists");
        }
        CategoryEntity category = new CategoryEntity();
        category.setName(request.getName().trim());
        category.setDescription(clean(request.getDescription()));
        category.setStatus(defaultStatus(request.getStatus()));
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse update(Long id, CategoryUpdateRequest request) {
        CategoryEntity category = getCategory(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName().trim(), id)) {
            throw new DuplicateResourceException("Category name already exists");
        }
        category.setName(request.getName().trim());
        category.setDescription(clean(request.getDescription()));
        category.setStatus(request.getStatus());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        CategoryEntity category = getCategory(id);
        category.setStatus(INACTIVE);
        categoryRepository.save(category);
    }

    private CategoryEntity getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private String defaultStatus(String status) {
        return status == null ? ACTIVE : status;
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
