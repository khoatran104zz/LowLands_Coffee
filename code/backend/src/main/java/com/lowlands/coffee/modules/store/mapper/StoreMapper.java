package com.lowlands.coffee.modules.store.mapper;

import com.lowlands.coffee.modules.store.dto.request.StoreCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreResponse;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StoreMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    StoreEntity toEntity(StoreCreateRequest request);

    StoreResponse toResponse(StoreEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(StoreUpdateRequest request, @MappingTarget StoreEntity entity);
}
