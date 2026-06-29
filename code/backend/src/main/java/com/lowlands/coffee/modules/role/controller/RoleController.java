package com.lowlands.coffee.modules.role.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.role.dto.request.RoleCreateRequest;
import com.lowlands.coffee.modules.role.dto.request.RoleUpdateRequest;
import com.lowlands.coffee.modules.role.dto.response.RoleResponse;
import com.lowlands.coffee.modules.role.service.RoleService;
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
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ApiResponse<List<RoleResponse>> findAll() {
        return ApiResponse.success(roleService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ApiResponse<RoleResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(roleService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ApiResponse<RoleResponse> create(@Valid @RequestBody RoleCreateRequest request) {
        return ApiResponse.success(roleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public ApiResponse<RoleResponse> update(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        return ApiResponse.success(roleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ApiResponse.success(null);
    }
}
