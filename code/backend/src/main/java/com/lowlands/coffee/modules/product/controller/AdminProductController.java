package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.request.ProductCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.ProductResponse;
import com.lowlands.coffee.modules.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ApiResponse<List<ProductResponse>> findAll() {
        return ApiResponse.success(productService.findAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        return ApiResponse.success("Product created", productService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ApiResponse<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ApiResponse.success(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.success(null);
    }
}
