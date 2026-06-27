package com.lowlands.coffee.modules.inventory.service;

import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.StockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockBalanceResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockMovementResponse;

import java.util.List;

public interface InventoryService {

    List<GoodsReceiptResponse> findGoodsReceipts();

    GoodsReceiptResponse findGoodsReceiptById(Long id);

    GoodsReceiptResponse createGoodsReceipt(GoodsReceiptCreateRequest request);

    GoodsReceiptResponse updateGoodsReceipt(Long id, GoodsReceiptUpdateRequest request);

    void deleteGoodsReceipt(Long id);

    GoodsReceiptResponse completeGoodsReceipt(Long id);

    List<StockMovementResponse> findStockMovements();

    StockMovementResponse createManualAdjustment(StockAdjustmentRequest request);

    List<StockBalanceResponse> getStockBalances();

    StockBalanceResponse getStockBalance(Long storeId, Long ingredientId);
}
