package com.lowlands.coffee.modules.supplier.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierUpdateRequest {

    @NotBlank
    @Size(max = 50)
    private String code;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String contactName;

    @Size(max = 20)
    private String phone;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 255)
    private String address;

    @Size(max = 50)
    private String taxCode;

    @NotBlank
    @Pattern(regexp = "active|inactive")
    private String status;
}
