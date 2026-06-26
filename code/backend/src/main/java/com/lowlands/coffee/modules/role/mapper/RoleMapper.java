package com.lowlands.coffee.modules.role.mapper;

import com.lowlands.coffee.modules.permission.entity.PermissionEntity;
import com.lowlands.coffee.modules.role.dto.request.RoleCreateRequest;
import com.lowlands.coffee.modules.role.dto.request.RoleUpdateRequest;
import com.lowlands.coffee.modules.role.dto.response.RoleResponse;
import com.lowlands.coffee.modules.role.entity.RoleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleEntity toEntity(RoleCreateRequest request);

    @Mapping(target = "permissions", expression = "java(toPermissionCodes(entity.getPermissions()))")
    RoleResponse toResponse(RoleEntity entity);

    void updateEntity(RoleUpdateRequest request, @MappingTarget RoleEntity entity);

    default Set<String> toPermissionCodes(Set<PermissionEntity> permissions) {
        return permissions.stream()
                .map(PermissionEntity::getCode)
                .collect(Collectors.toSet());
    }
}
