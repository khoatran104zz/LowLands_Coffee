package com.lowlands.coffee.modules.store.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.store.dto.request.StoreCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreResponse;
import com.lowlands.coffee.modules.store.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('STORE_READ')")
    public ApiResponse<List<StoreResponse>> findAll() {
        return ApiResponse.success(storeService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public ApiResponse<StoreResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(storeService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('STORE_MANAGE')")
    public ApiResponse<StoreResponse> create(@Valid @RequestBody StoreCreateRequest request) {
        return ApiResponse.success(storeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('STORE_MANAGE')")
    public ApiResponse<StoreResponse> update(@PathVariable Long id, @Valid @RequestBody StoreUpdateRequest request) {
        return ApiResponse.success(storeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('STORE_MANAGE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        storeService.delete(id);
        return ApiResponse.success(null);
    }
}
