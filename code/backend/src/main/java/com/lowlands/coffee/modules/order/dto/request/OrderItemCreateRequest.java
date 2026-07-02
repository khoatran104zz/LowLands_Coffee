package com.lowlands.coffee.modules.order.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderItemCreateRequest {

    @NotNull
    private Long productVariantId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @Size(max = 30)
    private List<Long> toppingIds;

    @Size(max = 255)
    private String note;
}
