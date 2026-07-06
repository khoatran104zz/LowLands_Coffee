package com.lowlands.coffee.modules.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentPayRequest {

    @NotBlank
    @Size(max = 30)
    private String method;

    @Size(max = 255)
    private String note;
}
