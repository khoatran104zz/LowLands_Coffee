package com.lowlands.coffee.modules.product.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductUpdateRequest {

    @NotNull
    private Long categoryId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 5000)
    private String description;

    @Size(max = 255)
    private String imageUrl;

    @NotBlank
    @Pattern(regexp = "active|inactive")
    private String status;

    @Valid
    @NotEmpty
    private List<ProductVariantUpdateRequest> variants;

    private List<Long> toppingIds;
}
