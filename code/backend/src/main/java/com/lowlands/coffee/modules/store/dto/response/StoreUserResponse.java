package com.lowlands.coffee.modules.store.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StoreUserResponse {

    private final Long id;
    private final Long userId;
    private final String employeeCode;
    private final String fullName;
    private final String email;
    private final String phone;
    private final Long storeId;
    private final String storeName;
    private final String position;
    private final String status;
}
