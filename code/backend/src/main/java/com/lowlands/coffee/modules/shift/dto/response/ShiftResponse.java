package com.lowlands.coffee.modules.shift.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ShiftResponse {
    private final Long id;
    private final Long storeId;
    private final Long userId;
    private final String userFullName;
    private final String userEmail;
    private final String shiftName;
    private final LocalDate shiftDate;
}
