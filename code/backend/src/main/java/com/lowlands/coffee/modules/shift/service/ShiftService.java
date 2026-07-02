package com.lowlands.coffee.modules.shift.service;

import com.lowlands.coffee.modules.shift.dto.request.ShiftCreateRequest;
import com.lowlands.coffee.modules.shift.dto.response.ShiftResponse;

import java.time.LocalDate;
import java.util.List;

public interface ShiftService {

    List<ShiftResponse> getShiftsByStoreAndDate(Long storeId, LocalDate date, String actorEmail);

    List<ShiftResponse> getShiftsByStoreAndDateRange(Long storeId, LocalDate start, LocalDate end, String actorEmail);

    ShiftResponse assignShift(Long storeId, ShiftCreateRequest request, String actorEmail);

    ShiftResponse updateShift(Long id, Long storeId, ShiftCreateRequest request, String actorEmail);

    void removeShift(Long id, String actorEmail);
}
