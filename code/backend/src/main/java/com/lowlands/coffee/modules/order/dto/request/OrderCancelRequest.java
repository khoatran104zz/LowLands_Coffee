package com.lowlands.coffee.modules.order.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCancelRequest {

    @Size(max = 255)
    private String reason;
}
