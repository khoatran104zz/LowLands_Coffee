package com.lowlands.coffee.modules.supplier.service;

import com.lowlands.coffee.modules.supplier.dto.request.SupplierCreateRequest;
import com.lowlands.coffee.modules.supplier.dto.request.SupplierUpdateRequest;
import com.lowlands.coffee.modules.supplier.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {

    List<SupplierResponse> findAll();

    SupplierResponse findById(Long id);

    SupplierResponse create(SupplierCreateRequest request);

    SupplierResponse update(Long id, SupplierUpdateRequest request);

    void delete(Long id);
}
