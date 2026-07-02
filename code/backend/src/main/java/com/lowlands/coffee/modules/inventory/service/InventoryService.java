package com.lowlands.coffee.modules.inventory.service;

import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerGoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerGoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerStockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.request.StockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockBalanceResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockMovementResponse;

import java.util.List;

public interface InventoryService {

    List<GoodsReceiptResponse> findGoodsReceipts();

    List<GoodsReceiptResponse> findGoodsReceiptsByStore(Long storeId);

    GoodsReceiptResponse findGoodsReceiptById(Long id);

    GoodsReceiptResponse findGoodsReceiptByIdForStore(Long id, Long storeId);

    GoodsReceiptResponse createGoodsReceipt(GoodsReceiptCreateRequest request);

    GoodsReceiptResponse createManagerGoodsReceipt(
            ManagerGoodsReceiptCreateRequest request,
            Long storeId,
            Long createdById
    );

    GoodsReceiptResponse updateGoodsReceipt(Long id, GoodsReceiptUpdateRequest request);

    GoodsReceiptResponse updateManagerGoodsReceipt(
            Long id,
            ManagerGoodsReceiptUpdateRequest request,
            Long storeId,
            Long updatedById
    );

    void deleteGoodsReceipt(Long id);

    GoodsReceiptResponse completeGoodsReceipt(Long id);

    GoodsReceiptResponse completeManagerGoodsReceipt(Long id, Long storeId);

    List<StockMovementResponse> findStockMovements();

    List<StockMovementResponse> findStockMovementsByStore(Long storeId);

    StockMovementResponse createManualAdjustment(StockAdjustmentRequest request);

    StockMovementResponse createManagerManualAdjustment(
            ManagerStockAdjustmentRequest request,
            Long storeId,
            Long createdById
    );

    List<StockBalanceResponse> getStockBalances();

    List<StockBalanceResponse> getStockBalancesByStore(Long storeId);

    StockBalanceResponse getStockBalance(Long storeId, Long ingredientId);
}
