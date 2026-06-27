package com.lowlands.coffee.modules.product.service.impl;

import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.product.dto.request.ToppingCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ToppingUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.ToppingResponse;
import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import com.lowlands.coffee.modules.product.mapper.ToppingMapper;
import com.lowlands.coffee.modules.product.repository.ToppingRepository;
import com.lowlands.coffee.modules.product.service.ToppingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ToppingServiceImpl implements ToppingService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";

    private final ToppingRepository toppingRepository;
    private final ToppingMapper toppingMapper;

    public ToppingServiceImpl(ToppingRepository toppingRepository, ToppingMapper toppingMapper) {
        this.toppingRepository = toppingRepository;
        this.toppingMapper = toppingMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ToppingResponse> findAll() {
        return toppingRepository.findAllByOrderByIdAsc().stream()
                .map(toppingMapper::toResponse)
                .toList();
    }

    @Override
    public ToppingResponse create(ToppingCreateRequest request) {
        if (toppingRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Topping name already exists");
        }
        ToppingEntity topping = new ToppingEntity();
        topping.setName(request.getName().trim());
        topping.setPrice(request.getPrice());
        topping.setStatus(defaultStatus(request.getStatus()));
        return toppingMapper.toResponse(toppingRepository.save(topping));
    }

    @Override
    public ToppingResponse update(Long id, ToppingUpdateRequest request) {
        ToppingEntity topping = getTopping(id);
        if (toppingRepository.existsByNameIgnoreCaseAndIdNot(request.getName().trim(), id)) {
            throw new DuplicateResourceException("Topping name already exists");
        }
        topping.setName(request.getName().trim());
        topping.setPrice(request.getPrice());
        topping.setStatus(request.getStatus());
        return toppingMapper.toResponse(toppingRepository.save(topping));
    }

    @Override
    public void delete(Long id) {
        ToppingEntity topping = getTopping(id);
        topping.setStatus(INACTIVE);
        toppingRepository.save(topping);
    }

    private ToppingEntity getTopping(Long id) {
        return toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found"));
    }

    private String defaultStatus(String status) {
        return status == null ? ACTIVE : status;
    }
}
