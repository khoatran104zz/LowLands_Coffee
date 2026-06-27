package com.lowlands.coffee.modules.product.service;

import com.lowlands.coffee.modules.product.dto.request.CategoryCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.CategoryUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> findPublicCategories();

    List<CategoryResponse> findAll();

    CategoryResponse create(CategoryCreateRequest request);

    CategoryResponse update(Long id, CategoryUpdateRequest request);

    void delete(Long id);
}
