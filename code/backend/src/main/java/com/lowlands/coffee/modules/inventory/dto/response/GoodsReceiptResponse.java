package com.lowlands.coffee.modules.inventory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class GoodsReceiptResponse {

    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long storeId;
    private String storeName;
    private Long createdById;
    private String createdByName;
    private String receiptCode;
    private BigDecimal totalAmount;
    private String status;
    private String note;
    private List<GoodsReceiptItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
