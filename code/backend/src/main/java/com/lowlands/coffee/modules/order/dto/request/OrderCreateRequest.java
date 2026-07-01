package com.lowlands.coffee.modules.order.dto.request;

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
public class OrderCreateRequest {

    @NotNull
    private Long storeId;

    @NotBlank
    @Size(max = 20)
    private String orderType;

    @NotBlank
    @Size(max = 30)
    private String paymentMethod;

    @Size(max = 100)
    private String receiverName;

    @Size(max = 20)
    private String receiverPhone;

    @Size(max = 255)
    private String deliveryAddress;

    @Size(max = 255)
    private String note;

    @NotEmpty
    @Valid
    private List<OrderItemCreateRequest> items;
}
