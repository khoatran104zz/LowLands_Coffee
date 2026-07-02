package com.lowlands.coffee.modules.store.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.store.dto.request.StoreUserCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUserUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreUserResponse;
import com.lowlands.coffee.modules.store.service.StoreUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StoreUserController {

    private final StoreUserService storeUserService;

    public StoreUserController(StoreUserService storeUserService) {
        this.storeUserService = storeUserService;
    }

    @GetMapping("/api/v1/store-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<StoreUserResponse>> findAll() {
        return ApiResponse.success(storeUserService.findAll());
    }

    @GetMapping("/api/v1/stores/{storeId}/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<StoreUserResponse>> findByStore(@PathVariable Long storeId) {
        return ApiResponse.success(storeUserService.findByStore(storeId));
    }

    @PostMapping("/api/v1/store-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StoreUserResponse> create(@Valid @RequestBody StoreUserCreateRequest request) {
        return ApiResponse.success("Store user assignment created", storeUserService.create(request));
    }

    @PutMapping("/api/v1/store-users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StoreUserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody StoreUserUpdateRequest request
    ) {
        return ApiResponse.success(storeUserService.update(id, request));
    }

    @PatchMapping("/api/v1/store-users/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StoreUserResponse> deactivate(@PathVariable Long id) {
        return ApiResponse.success(storeUserService.deactivate(id));
    }
}
