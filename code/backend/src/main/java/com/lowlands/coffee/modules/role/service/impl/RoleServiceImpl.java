package com.lowlands.coffee.modules.role.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.role.dto.request.RoleCreateRequest;
import com.lowlands.coffee.modules.role.dto.request.RoleUpdateRequest;
import com.lowlands.coffee.modules.role.dto.response.RoleResponse;
import com.lowlands.coffee.modules.role.entity.RoleEntity;
import com.lowlands.coffee.modules.role.mapper.RoleMapper;
import com.lowlands.coffee.modules.role.repository.RoleRepository;
import com.lowlands.coffee.modules.role.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream().map(roleMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse findById(Long id) {
        return roleMapper.toResponse(getRole(id));
    }

    @Override
    public RoleResponse create(RoleCreateRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new BadRequestException("Role already exists");
        }
        RoleEntity role = roleMapper.toEntity(request);
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    public RoleResponse update(Long id, RoleUpdateRequest request) {
        RoleEntity role = getRole(id);
        roleMapper.updateEntity(request, role);
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    public void delete(Long id) {
        roleRepository.delete(getRole(id));
    }

    private RoleEntity getRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }
}
