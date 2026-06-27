package com.lowlands.coffee.modules.product.mapper;

import com.lowlands.coffee.modules.product.dto.response.ToppingResponse;
import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import org.springframework.stereotype.Component;

@Component
public class ToppingMapper {

    public ToppingResponse toResponse(ToppingEntity entity) {
        ToppingResponse response = new ToppingResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setPrice(entity.getPrice());
        response.setStatus(entity.getStatus());
        return response;
    }
}
