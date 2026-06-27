package com.lowlands.coffee.modules.product.service;

import com.lowlands.coffee.modules.product.dto.request.ToppingCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ToppingUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.ToppingResponse;

import java.util.List;

public interface ToppingService {

    List<ToppingResponse> findAll();

    ToppingResponse create(ToppingCreateRequest request);

    ToppingResponse update(Long id, ToppingUpdateRequest request);

    void delete(Long id);
}
