package com.lowlands.coffee.modules.promotion.service;

import com.lowlands.coffee.modules.promotion.dto.request.*;
import com.lowlands.coffee.modules.promotion.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PromotionService {
    Page<PromotionResponse> findAll(String status, String applicableType, String search, Pageable pageable);
    List<PromotionResponse> findActive();
    PromotionResponse findById(Long id);
    PromotionResponse create(PromotionCreateRequest request);
    PromotionResponse update(Long id, PromotionUpdateRequest request);
    void delete(Long id);
    PromotionResponse updateStatus(Long id, String status);
    List<PromotionResponse> getAvailablePromotions(PromotionAvailableRequest request);
    PromotionValidateResponse validatePromotion(PromotionValidateRequest request);
}
