package com.lowlands.coffee.modules.store.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreUserUpdateRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long storeId;

    @NotBlank
    @Pattern(regexp = "MANAGER|CASHIER|BARISTA|STAFF")
    private String position;

    @NotBlank
    @Pattern(regexp = "active|inactive")
    private String status;
}
