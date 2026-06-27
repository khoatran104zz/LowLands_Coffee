package com.lowlands.coffee.modules.supplier.service.impl;

import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.supplier.dto.request.SupplierCreateRequest;
import com.lowlands.coffee.modules.supplier.dto.request.SupplierUpdateRequest;
import com.lowlands.coffee.modules.supplier.dto.response.SupplierResponse;
import com.lowlands.coffee.modules.supplier.entity.SupplierEntity;
import com.lowlands.coffee.modules.supplier.mapper.SupplierMapper;
import com.lowlands.coffee.modules.supplier.repository.SupplierRepository;
import com.lowlands.coffee.modules.supplier.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    public SupplierServiceImpl(SupplierRepository supplierRepository, SupplierMapper supplierMapper) {
        this.supplierRepository = supplierRepository;
        this.supplierMapper = supplierMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse findById(Long id) {
        return supplierMapper.toResponse(getSupplier(id));
    }

    @Override
    public SupplierResponse create(SupplierCreateRequest request) {
        String code = request.getCode().trim();
        if (supplierRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Supplier code already exists");
        }
        SupplierEntity supplier = new SupplierEntity();
        supplier.setCode(code);
        supplier.setName(request.getName().trim());
        supplier.setContactName(clean(request.getContactName()));
        supplier.setPhone(clean(request.getPhone()));
        supplier.setEmail(clean(request.getEmail()));
        supplier.setAddress(clean(request.getAddress()));
        supplier.setTaxCode(clean(request.getTaxCode()));
        supplier.setStatus(request.getStatus() == null ? ACTIVE : request.getStatus());
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public SupplierResponse update(Long id, SupplierUpdateRequest request) {
        SupplierEntity supplier = getSupplier(id);
        String code = request.getCode().trim();
        if (supplierRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Supplier code already exists");
        }
        supplier.setCode(code);
        supplier.setName(request.getName().trim());
        supplier.setContactName(clean(request.getContactName()));
        supplier.setPhone(clean(request.getPhone()));
        supplier.setEmail(clean(request.getEmail()));
        supplier.setAddress(clean(request.getAddress()));
        supplier.setTaxCode(clean(request.getTaxCode()));
        supplier.setStatus(request.getStatus());
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public void delete(Long id) {
        SupplierEntity supplier = getSupplier(id);
        supplier.setStatus(INACTIVE);
        supplierRepository.save(supplier);
    }

    private SupplierEntity getSupplier(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
