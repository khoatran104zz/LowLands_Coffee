package com.lowlands.coffee.modules.shift.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ShiftCreateRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String shiftName;

    @NotNull
    private LocalDate shiftDate;
}
