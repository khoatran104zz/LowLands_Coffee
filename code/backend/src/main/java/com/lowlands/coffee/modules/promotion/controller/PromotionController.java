package com.lowlands.coffee.modules.promotion.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.promotion.dto.request.*;
import com.lowlands.coffee.modules.promotion.dto.response.*;
import com.lowlands.coffee.modules.promotion.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROMOTION_VIEW')")
    public ApiResponse<Page<PromotionResponse>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String applicableType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort sort = "desc".equalsIgnoreCase(sortDirection)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ApiResponse.success(promotionService.findAll(status, applicableType, search, pageable));
    }

    @GetMapping("/active")
    public ApiResponse<List<PromotionResponse>> findActive() {
        return ApiResponse.success(promotionService.findActive());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROMOTION_VIEW')")
    public ApiResponse<PromotionResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(promotionService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PROMOTION_CREATE')")
    public ApiResponse<PromotionResponse> create(@Valid @RequestBody PromotionCreateRequest request) {
        return ApiResponse.success("Promotion created", promotionService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PROMOTION_UPDATE')")
    public ApiResponse<PromotionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PromotionUpdateRequest request
    ) {
        return ApiResponse.success("Promotion updated", promotionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PROMOTION_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        promotionService.delete(id);
        return ApiResponse.success("Promotion deleted", null);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PROMOTION_UPDATE')")
    public ApiResponse<PromotionResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        return ApiResponse.success("Promotion status updated", promotionService.updateStatus(id, status));
    }

    @PostMapping("/available")
    public ApiResponse<List<PromotionResponse>> getAvailablePromotions(
            @Valid @RequestBody PromotionAvailableRequest request
    ) {
        return ApiResponse.success(promotionService.getAvailablePromotions(request));
    }

    @PostMapping("/validate")
    public ApiResponse<PromotionValidateResponse> validatePromotion(
            @Valid @RequestBody PromotionValidateRequest request
    ) {
        return ApiResponse.success(promotionService.validatePromotion(request));
    }
}
