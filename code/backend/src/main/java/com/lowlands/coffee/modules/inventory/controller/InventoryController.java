package com.lowlands.coffee.modules.inventory.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.inventory.dto.request.StockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.response.StockBalanceResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockMovementResponse;
import com.lowlands.coffee.modules.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/stock-movements")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public ApiResponse<List<StockMovementResponse>> findStockMovements() {
        return ApiResponse.success(inventoryService.findStockMovements());
    }

    @PostMapping("/stock-adjustments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public ApiResponse<StockMovementResponse> createAdjustment(
            @Valid @RequestBody StockAdjustmentRequest request
    ) {
        return ApiResponse.success("Stock adjustment created", inventoryService.createManualAdjustment(request));
    }

    @GetMapping("/stock-balances")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public ApiResponse<List<StockBalanceResponse>> getStockBalances() {
        return ApiResponse.success(inventoryService.getStockBalances());
    }

    @GetMapping("/stores/{storeId}/ingredients/{ingredientId}/stock")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public ApiResponse<StockBalanceResponse> getStockBalance(
            @PathVariable Long storeId,
            @PathVariable Long ingredientId
    ) {
        return ApiResponse.success(inventoryService.getStockBalance(storeId, ingredientId));
    }
}
