package com.lowlands.coffee.modules.product.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    @Pattern(regexp = "active|inactive")
    private String status;
}
