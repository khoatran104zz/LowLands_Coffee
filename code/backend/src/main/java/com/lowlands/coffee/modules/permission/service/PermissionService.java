package com.lowlands.coffee.modules.permission.service;

import com.lowlands.coffee.modules.permission.dto.request.PermissionCreateRequest;
import com.lowlands.coffee.modules.permission.dto.request.PermissionUpdateRequest;
import com.lowlands.coffee.modules.permission.dto.response.PermissionResponse;

import java.util.List;

public interface PermissionService {

    List<PermissionResponse> findAll();

    PermissionResponse findById(Long id);

    PermissionResponse create(PermissionCreateRequest request);

    PermissionResponse update(Long id, PermissionUpdateRequest request);

    void delete(Long id);
}
