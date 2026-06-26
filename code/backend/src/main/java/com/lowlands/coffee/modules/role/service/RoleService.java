package com.lowlands.coffee.modules.role.service;

import com.lowlands.coffee.modules.role.dto.request.RoleCreateRequest;
import com.lowlands.coffee.modules.role.dto.request.RoleUpdateRequest;
import com.lowlands.coffee.modules.role.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    List<RoleResponse> findAll();

    RoleResponse findById(Long id);

    RoleResponse create(RoleCreateRequest request);

    RoleResponse update(Long id, RoleUpdateRequest request);

    void delete(Long id);
}
