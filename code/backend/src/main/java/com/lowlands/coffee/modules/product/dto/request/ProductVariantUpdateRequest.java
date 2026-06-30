package com.lowlands.coffee.modules.product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductVariantUpdateRequest {

    private Long id;

    @NotBlank
    @Pattern(regexp = "S|M|L")
    private String size;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal price;

    @NotBlank
    @Pattern(regexp = "active|inactive")
    private String status;
}
