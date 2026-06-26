package com.lowlands.coffee.modules.store.service.impl;

import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.store.dto.request.StoreCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreResponse;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.mapper.StoreMapper;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.service.StoreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final StoreMapper storeMapper;

    public StoreServiceImpl(StoreRepository storeRepository, StoreMapper storeMapper) {
        this.storeRepository = storeRepository;
        this.storeMapper = storeMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoreResponse> findAll() {
        return storeRepository.findAll().stream().map(storeMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StoreResponse findById(Long id) {
        return storeMapper.toResponse(getStore(id));
    }

    @Override
    public StoreResponse create(StoreCreateRequest request) {
        StoreEntity store = storeMapper.toEntity(request);
        return storeMapper.toResponse(storeRepository.save(store));
    }

    @Override
    public StoreResponse update(Long id, StoreUpdateRequest request) {
        StoreEntity store = getStore(id);
        storeMapper.updateEntity(request, store);
        return storeMapper.toResponse(storeRepository.save(store));
    }

    @Override
    public void delete(Long id) {
        storeRepository.delete(getStore(id));
    }

    private StoreEntity getStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));
    }
}
