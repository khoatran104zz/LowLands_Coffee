package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductResponse;
import com.lowlands.coffee.modules.product.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class PublicProductController {

    private final ProductService productService;

    public PublicProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> findPublicProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return ApiResponse.success(productService.findPublicProducts(categoryId, search, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> findPublicById(@PathVariable Long id) {
        return ApiResponse.success(productService.findPublicById(id));
    }
}
