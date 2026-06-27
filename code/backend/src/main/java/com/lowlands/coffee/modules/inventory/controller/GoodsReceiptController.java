package com.lowlands.coffee.modules.inventory.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptResponse;
import com.lowlands.coffee.modules.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goods-receipts")
public class GoodsReceiptController {

    private final InventoryService inventoryService;

    public GoodsReceiptController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_VIEW')")
    public ApiResponse<List<GoodsReceiptResponse>> findAll() {
        return ApiResponse.success(inventoryService.findGoodsReceipts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_VIEW')")
    public ApiResponse<GoodsReceiptResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(inventoryService.findGoodsReceiptById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_CREATE')")
    public ApiResponse<GoodsReceiptResponse> create(@Valid @RequestBody GoodsReceiptCreateRequest request) {
        return ApiResponse.success("Goods receipt created", inventoryService.createGoodsReceipt(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_UPDATE')")
    public ApiResponse<GoodsReceiptResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody GoodsReceiptUpdateRequest request
    ) {
        return ApiResponse.success(inventoryService.updateGoodsReceipt(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        inventoryService.deleteGoodsReceipt(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('GOODS_RECEIPT_COMPLETE')")
    public ApiResponse<GoodsReceiptResponse> complete(@PathVariable Long id) {
        return ApiResponse.success("Goods receipt completed", inventoryService.completeGoodsReceipt(id));
    }
}
