package com.lowlands.coffee.modules.permission.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.permission.dto.request.PermissionCreateRequest;
import com.lowlands.coffee.modules.permission.dto.request.PermissionUpdateRequest;
import com.lowlands.coffee.modules.permission.dto.response.PermissionResponse;
import com.lowlands.coffee.modules.permission.entity.PermissionEntity;
import com.lowlands.coffee.modules.permission.mapper.PermissionMapper;
import com.lowlands.coffee.modules.permission.repository.PermissionRepository;
import com.lowlands.coffee.modules.permission.service.PermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    public PermissionServiceImpl(PermissionRepository permissionRepository, PermissionMapper permissionMapper) {
        this.permissionRepository = permissionRepository;
        this.permissionMapper = permissionMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> findAll() {
        return permissionRepository.findAll().stream().map(permissionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionResponse findById(Long id) {
        return permissionMapper.toResponse(getPermission(id));
    }

    @Override
    public PermissionResponse create(PermissionCreateRequest request) {
        if (permissionRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Permission already exists");
        }
        PermissionEntity permission = permissionMapper.toEntity(request);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    public PermissionResponse update(Long id, PermissionUpdateRequest request) {
        PermissionEntity permission = getPermission(id);
        permissionMapper.updateEntity(request, permission);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    public void delete(Long id) {
        permissionRepository.delete(getPermission(id));
    }

    private PermissionEntity getPermission(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
    }
}
