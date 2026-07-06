package com.lowlands.coffee.modules.payment.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentActionRequest {

    @Size(max = 255)
    private String note;
}
