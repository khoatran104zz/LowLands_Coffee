package com.lowlands.coffee.modules.permission.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.permission.dto.request.PermissionCreateRequest;
import com.lowlands.coffee.modules.permission.dto.request.PermissionUpdateRequest;
import com.lowlands.coffee.modules.permission.dto.response.PermissionResponse;
import com.lowlands.coffee.modules.permission.service.PermissionService;
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
@RequestMapping("/api/v1/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ApiResponse<List<PermissionResponse>> findAll() {
        return ApiResponse.success(permissionService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ApiResponse<PermissionResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(permissionService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    public ApiResponse<PermissionResponse> create(@Valid @RequestBody PermissionCreateRequest request) {
        return ApiResponse.success(permissionService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    public ApiResponse<PermissionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PermissionUpdateRequest request
    ) {
        return ApiResponse.success(permissionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return ApiResponse.success(null);
    }
}
