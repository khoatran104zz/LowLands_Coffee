package com.lowlands.coffee.modules.permission.mapper;

import com.lowlands.coffee.modules.permission.dto.request.PermissionCreateRequest;
import com.lowlands.coffee.modules.permission.dto.request.PermissionUpdateRequest;
import com.lowlands.coffee.modules.permission.dto.response.PermissionResponse;
import com.lowlands.coffee.modules.permission.entity.PermissionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionEntity toEntity(PermissionCreateRequest request);

    PermissionResponse toResponse(PermissionEntity entity);

    void updateEntity(PermissionUpdateRequest request, @MappingTarget PermissionEntity entity);
}
