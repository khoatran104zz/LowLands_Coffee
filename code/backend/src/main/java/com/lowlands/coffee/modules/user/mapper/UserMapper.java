package com.lowlands.coffee.modules.user.mapper;

import com.lowlands.coffee.modules.user.dto.request.UserCreateRequest;
import com.lowlands.coffee.modules.user.dto.request.UserUpdateRequest;
import com.lowlands.coffee.modules.user.dto.response.UserResponse;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.permission.entity.PermissionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserEntity toEntity(UserCreateRequest request);

    @Mapping(target = "roleId", source = "role.id")
    @Mapping(target = "roleName", source = "role.name")
    @Mapping(target = "role", source = "role.name")
    @Mapping(target = "employeeCode", source = "employee.employeeCode")
    @Mapping(target = "permissions", expression = "java(toPermissionCodes(entity))")
    UserResponse toResponse(UserEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UserUpdateRequest request, @MappingTarget UserEntity entity);

    default List<String> toPermissionCodes(UserEntity entity) {
        if (entity == null || entity.getRole() == null || entity.getRole().getPermissions() == null) {
            return List.of();
        }
        return entity.getRole().getPermissions().stream()
                .map(PermissionEntity::getCode)
                .sorted()
                .toList();
    }
}
