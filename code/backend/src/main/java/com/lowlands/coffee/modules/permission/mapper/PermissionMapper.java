package com.lowlands.coffee.modules.permission.mapper;

import com.lowlands.coffee.modules.permission.dto.request.PermissionCreateRequest;
import com.lowlands.coffee.modules.permission.dto.request.PermissionUpdateRequest;
import com.lowlands.coffee.modules.permission.dto.response.PermissionResponse;
import com.lowlands.coffee.modules.permission.entity.PermissionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    @Mapping(target = "id", ignore = true)
    PermissionEntity toEntity(PermissionCreateRequest request);

    PermissionResponse toResponse(PermissionEntity entity);

    @Mapping(target = "id", ignore = true)
    void updateEntity(PermissionUpdateRequest request, @MappingTarget PermissionEntity entity);
}
