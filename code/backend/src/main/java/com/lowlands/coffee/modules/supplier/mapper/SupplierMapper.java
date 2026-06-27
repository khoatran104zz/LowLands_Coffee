package com.lowlands.coffee.modules.supplier.mapper;

import com.lowlands.coffee.modules.supplier.dto.response.SupplierResponse;
import com.lowlands.coffee.modules.supplier.entity.SupplierEntity;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierResponse toResponse(SupplierEntity entity) {
        SupplierResponse response = new SupplierResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setContactName(entity.getContactName());
        response.setPhone(entity.getPhone());
        response.setEmail(entity.getEmail());
        response.setAddress(entity.getAddress());
        response.setTaxCode(entity.getTaxCode());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}
