package com.lowlands.coffee.modules.inventory.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerStockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.response.StockBalanceResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockMovementResponse;
import com.lowlands.coffee.modules.inventory.service.InventoryService;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/manager/inventory")
public class ManagerInventoryController {

    private final InventoryService inventoryService;
    private final ManagerStoreContextService managerStoreContextService;

    public ManagerInventoryController(
            InventoryService inventoryService,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.inventoryService = inventoryService;
        this.managerStoreContextService = managerStoreContextService;
    }

    @GetMapping("/stock-balances")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public ApiResponse<List<StockBalanceResponse>> getStockBalances() {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        return ApiResponse.success(inventoryService.getStockBalancesByStore(storeId));
    }

    @GetMapping("/stock-movements")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public ApiResponse<List<StockMovementResponse>> getStockMovements() {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        return ApiResponse.success(inventoryService.findStockMovementsByStore(storeId));
    }

    @PostMapping("/stock-adjustments")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public ApiResponse<StockMovementResponse> createAdjustment(
            @Valid @RequestBody ManagerStockAdjustmentRequest request
    ) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        Long userId = managerStoreContextService.getCurrentUser().getId();
        return ApiResponse.success(
                "Stock adjustment created",
                inventoryService.createManagerManualAdjustment(request, storeId, userId)
        );
    }
}
