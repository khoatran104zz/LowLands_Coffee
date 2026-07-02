package com.lowlands.coffee.modules.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ManagerStaffResponse {

    private final Long userId;
    private final Long storeUserId;
    private final String employeeCode;
    private final String fullName;
    private final String email;
    private final String phone;
    private final String position;
    private final String status;
    private final Long storeId;
    private final String storeName;
}
