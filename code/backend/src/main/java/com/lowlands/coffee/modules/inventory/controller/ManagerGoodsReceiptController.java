package com.lowlands.coffee.modules.inventory.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerGoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerGoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptResponse;
import com.lowlands.coffee.modules.inventory.service.InventoryService;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/manager/goods-receipts")
public class ManagerGoodsReceiptController {

    private final InventoryService inventoryService;
    private final ManagerStoreContextService managerStoreContextService;

    public ManagerGoodsReceiptController(
            InventoryService inventoryService,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.inventoryService = inventoryService;
        this.managerStoreContextService = managerStoreContextService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_VIEW')")
    public ApiResponse<List<GoodsReceiptResponse>> findAll() {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        return ApiResponse.success(inventoryService.findGoodsReceiptsByStore(storeId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_VIEW')")
    public ApiResponse<GoodsReceiptResponse> findById(@PathVariable Long id) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        return ApiResponse.success(inventoryService.findGoodsReceiptByIdForStore(id, storeId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_CREATE')")
    public ApiResponse<GoodsReceiptResponse> create(
            @Valid @RequestBody ManagerGoodsReceiptCreateRequest request
    ) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        Long userId = managerStoreContextService.getCurrentUser().getId();
        return ApiResponse.success(
                "Goods receipt created",
                inventoryService.createManagerGoodsReceipt(request, storeId, userId)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_UPDATE')")
    public ApiResponse<GoodsReceiptResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ManagerGoodsReceiptUpdateRequest request
    ) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        Long userId = managerStoreContextService.getCurrentUser().getId();
        return ApiResponse.success(inventoryService.updateManagerGoodsReceipt(id, request, storeId, userId));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_COMPLETE')")
    public ApiResponse<GoodsReceiptResponse> complete(@PathVariable Long id) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        return ApiResponse.success("Goods receipt completed", inventoryService.completeManagerGoodsReceipt(id, storeId));
    }
}
