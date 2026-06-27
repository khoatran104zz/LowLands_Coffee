package com.lowlands.coffee.modules.supplier.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SupplierResponse {

    private Long id;
    private String code;
    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String taxCode;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
