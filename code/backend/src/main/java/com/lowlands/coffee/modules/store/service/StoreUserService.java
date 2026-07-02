package com.lowlands.coffee.modules.store.service;

import com.lowlands.coffee.modules.store.dto.request.StoreUserCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUserUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreUserResponse;

import java.util.List;

public interface StoreUserService {

    List<StoreUserResponse> findAll();

    List<StoreUserResponse> findByStore(Long storeId);

    StoreUserResponse create(StoreUserCreateRequest request);

    StoreUserResponse update(Long id, StoreUserUpdateRequest request);

    StoreUserResponse deactivate(Long id);
}
