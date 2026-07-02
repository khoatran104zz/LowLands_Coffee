package com.lowlands.coffee.modules.shift.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.shift.dto.request.ShiftCreateRequest;
import com.lowlands.coffee.modules.shift.dto.response.ShiftResponse;
import com.lowlands.coffee.modules.shift.service.ShiftService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SHIFT_VIEW')")
    public ApiResponse<List<ShiftResponse>> getShifts(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication
    ) {
        if (startDate != null && endDate != null) {
            return ApiResponse.success(shiftService.getShiftsByStoreAndDateRange(storeId, startDate, endDate, authentication.getName()));
        }
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ApiResponse.success(shiftService.getShiftsByStoreAndDate(storeId, targetDate, authentication.getName()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('SHIFT_MANAGE')")
    public ApiResponse<ShiftResponse> assignShift(
            @RequestParam Long storeId,
            @Valid @RequestBody ShiftCreateRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Shift assigned successfully", shiftService.assignShift(storeId, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SHIFT_MANAGE')")
    public ApiResponse<Void> removeShift(
            @PathVariable Long id,
            Authentication authentication
    ) {
        shiftService.removeShift(id, authentication.getName());
        return ApiResponse.success("Shift removed successfully", null);
    }
}
