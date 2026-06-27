package com.lowlands.coffee.modules.product.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.product.dto.request.ToppingCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ToppingUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.ToppingResponse;
import com.lowlands.coffee.modules.product.service.ToppingService;
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
@RequestMapping("/api/v1/admin/toppings")
public class AdminToppingController {

    private final ToppingService toppingService;

    public AdminToppingController(ToppingService toppingService) {
        this.toppingService = toppingService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('TOPPING_VIEW')")
    public ApiResponse<List<ToppingResponse>> findAll() {
        return ApiResponse.success(toppingService.findAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('TOPPING_CREATE')")
    public ApiResponse<ToppingResponse> create(@Valid @RequestBody ToppingCreateRequest request) {
        return ApiResponse.success("Topping created", toppingService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPPING_UPDATE')")
    public ApiResponse<ToppingResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ToppingUpdateRequest request
    ) {
        return ApiResponse.success(toppingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPPING_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        toppingService.delete(id);
        return ApiResponse.success(null);
    }
}
