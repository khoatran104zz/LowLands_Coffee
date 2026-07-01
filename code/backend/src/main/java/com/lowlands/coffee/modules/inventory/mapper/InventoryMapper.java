package com.lowlands.coffee.modules.inventory.mapper;

import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptItemResponse;
import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockBalanceResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockMovementResponse;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptItemEntity;
import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;

@Component
public class InventoryMapper {

    public GoodsReceiptResponse toGoodsReceiptResponse(GoodsReceiptEntity entity) {
        GoodsReceiptResponse response = new GoodsReceiptResponse();
        response.setId(entity.getId());
        response.setSupplierId(entity.getSupplier().getId());
        response.setSupplierName(entity.getSupplier().getName());
        response.setStoreId(entity.getStore().getId());
        response.setStoreName(entity.getStore().getName());
        response.setCreatedById(entity.getCreatedBy().getId());
        response.setCreatedByName(entity.getCreatedBy().getFullName());
        response.setReceiptCode(entity.getReceiptCode());
        response.setTotalAmount(entity.getTotalAmount());
        response.setStatus(entity.getStatus());
        response.setNote(entity.getNote());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setItems(entity.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getIngredient().getId()))
                .map(this::toGoodsReceiptItemResponse)
                .toList());
        return response;
    }

    public StockMovementResponse toStockMovementResponse(StockMovementEntity entity) {
        StockMovementResponse response = new StockMovementResponse();
        response.setId(entity.getId());
        response.setStoreId(entity.getStore().getId());
        response.setStoreName(entity.getStore().getName());
        response.setIngredientId(entity.getIngredient().getId());
        response.setIngredientCode(entity.getIngredient().getCode());
        response.setIngredientName(entity.getIngredient().getName());
        response.setMovementType(entity.getMovementType());
        response.setQuantity(entity.getQuantity());
        response.setUnit(entity.getUnit());
        response.setReferenceType(entity.getReferenceType());
        response.setReferenceId(entity.getReferenceId());
        response.setNote(entity.getNote());
        response.setCreatedById(entity.getCreatedBy().getId());
        response.setCreatedByName(entity.getCreatedBy().getFullName());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }

    public StockBalanceResponse toStockBalanceResponse(Object[] row) {
        StockBalanceResponse response = new StockBalanceResponse();
        response.setStoreId((Long) row[0]);
        response.setStoreName((String) row[1]);
        response.setIngredientId((Long) row[2]);
        response.setIngredientCode((String) row[3]);
        response.setIngredientName((String) row[4]);
        response.setUnit((String) row[5]);
        response.setMinStock((BigDecimal) row[6]);
        response.setCurrentStock((BigDecimal) row[7]);
        return response;
    }

    private GoodsReceiptItemResponse toGoodsReceiptItemResponse(GoodsReceiptItemEntity entity) {
        GoodsReceiptItemResponse response = new GoodsReceiptItemResponse();
        response.setId(entity.getId());
        response.setIngredientId(entity.getIngredient().getId());
        response.setIngredientCode(entity.getIngredient().getCode());
        response.setIngredientName(entity.getIngredient().getName());
        response.setQuantity(entity.getQuantity());
        response.setUnit(entity.getUnit());
        response.setUnitPrice(entity.getUnitPrice());
        response.setTotalPrice(entity.getTotalPrice());
        return response;
    }
}
