package com.lowlands.coffee.modules.inventory.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class GoodsReceiptCreateRequest {

    @NotNull
    private Long supplierId;

    @NotNull
    private Long storeId;

    @NotNull
    private Long createdById;

    @NotBlank
    @Size(max = 50)
    private String receiptCode;

    @Size(max = 255)
    private String note;

    @Valid
    @NotEmpty
    private List<GoodsReceiptItemRequest> items;
}
