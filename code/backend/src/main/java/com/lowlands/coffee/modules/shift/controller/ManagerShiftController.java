package com.lowlands.coffee.modules.shift.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.shift.dto.request.ShiftCreateRequest;
import com.lowlands.coffee.modules.shift.dto.response.ShiftResponse;
import com.lowlands.coffee.modules.shift.service.ShiftService;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/manager/shifts")
public class ManagerShiftController {

    private final ShiftService shiftService;
    private final ManagerStoreContextService managerStoreContextService;

    public ManagerShiftController(
            ShiftService shiftService,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.shiftService = shiftService;
        this.managerStoreContextService = managerStoreContextService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SHIFT_VIEW')")
    public ApiResponse<List<ShiftResponse>> getShifts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        String email = managerStoreContextService.getCurrentUser().getEmail();
        if (startDate != null && endDate != null) {
            return ApiResponse.success(shiftService.getShiftsByStoreAndDateRange(storeId, startDate, endDate, email));
        }
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ApiResponse.success(shiftService.getShiftsByStoreAndDate(storeId, targetDate, email));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SHIFT_MANAGE')")
    public ApiResponse<ShiftResponse> assignShift(@Valid @RequestBody ShiftCreateRequest request) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        String email = managerStoreContextService.getCurrentUser().getEmail();
        return ApiResponse.success("Shift assigned successfully", shiftService.assignShift(storeId, request, email));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SHIFT_MANAGE')")
    public ApiResponse<ShiftResponse> updateShift(
            @PathVariable Long id,
            @Valid @RequestBody ShiftCreateRequest request
    ) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        String email = managerStoreContextService.getCurrentUser().getEmail();
        return ApiResponse.success(shiftService.updateShift(id, storeId, request, email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SHIFT_MANAGE')")
    public ApiResponse<Void> removeShift(@PathVariable Long id) {
        String email = managerStoreContextService.getCurrentUser().getEmail();
        shiftService.removeShift(id, email);
        return ApiResponse.success("Shift removed successfully", null);
    }
}
