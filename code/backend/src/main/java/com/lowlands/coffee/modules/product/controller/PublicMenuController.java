package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.response.MenuResponse;
import com.lowlands.coffee.modules.product.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/menu")
public class PublicMenuController {

    private final ProductService productService;

    public PublicMenuController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<MenuResponse> getMenu() {
        return ApiResponse.success(productService.getMenu());
    }
}
