package com.lowlands.coffee.modules.store.service;

import com.lowlands.coffee.modules.store.dto.request.StoreCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreResponse;

import java.util.List;

public interface StoreService {

    List<StoreResponse> findAll();

    StoreResponse findById(Long id);

    StoreResponse create(StoreCreateRequest request);

    StoreResponse update(Long id, StoreUpdateRequest request);

    void delete(Long id);
}
