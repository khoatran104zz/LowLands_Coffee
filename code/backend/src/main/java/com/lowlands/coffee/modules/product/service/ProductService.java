package com.lowlands.coffee.modules.product.service;

import com.lowlands.coffee.modules.product.dto.request.ProductCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.MenuResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    MenuResponse getMenu();

    List<ProductResponse> findPublicProducts(Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice);

    ProductResponse findPublicById(Long id);

    List<ProductResponse> findAll();

    ProductResponse create(ProductCreateRequest request);

    ProductResponse update(Long id, ProductUpdateRequest request);

    void delete(Long id);
}
