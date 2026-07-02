package com.lowlands.coffee.modules.shift.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ConflictException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.shift.dto.request.ShiftCreateRequest;
import com.lowlands.coffee.modules.shift.dto.response.ShiftResponse;
import com.lowlands.coffee.modules.shift.entity.ShiftEntity;
import com.lowlands.coffee.modules.shift.repository.ShiftRepository;
import com.lowlands.coffee.modules.shift.service.ShiftService;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;
    private final StoreRepository storeRepository;
    private final StoreUserRepository storeUserRepository;
    private final UserRepository userRepository;

    public ShiftServiceImpl(
            ShiftRepository shiftRepository,
            StoreRepository storeRepository,
            StoreUserRepository storeUserRepository,
            UserRepository userRepository
    ) {
        this.shiftRepository = shiftRepository;
        this.storeRepository = storeRepository;
        this.storeUserRepository = storeUserRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShiftResponse> getShiftsByStoreAndDate(Long storeId, LocalDate date, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        ensureStoreScope(actor, storeId);

        return shiftRepository.findByStoreIdAndShiftDate(storeId, date).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShiftResponse> getShiftsByStoreAndDateRange(Long storeId, LocalDate start, LocalDate end, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        ensureStoreScope(actor, storeId);

        return shiftRepository.findByStoreIdAndShiftDateBetween(storeId, start, end).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ShiftResponse assignShift(Long storeId, ShiftCreateRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        ensureStoreScope(actor, storeId);

        StoreEntity store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        UserEntity employee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee user not found"));

        // Verify the employee is assigned to this store
        boolean assignedToStore = storeUserRepository.findByUserId(employee.getId()).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .anyMatch(su -> su.getStore().getId().equals(storeId));
        if (!assignedToStore && !isAdmin(actor)) {
            throw new BadRequestException("Employee is not assigned to this store");
        }

        // Verify uniqueness
        String normalizedShiftName = request.getShiftName().trim().toUpperCase();
        if (!List.of("MORNING", "AFTERNOON", "NIGHT").contains(normalizedShiftName)) {
            throw new BadRequestException("Shift name must be MORNING, AFTERNOON, or NIGHT");
        }

        if (shiftRepository.existsByStoreIdAndUserIdAndShiftDateAndShiftName(
                storeId, employee.getId(), request.getShiftDate(), normalizedShiftName)) {
            throw new ConflictException("Employee is already assigned to this shift on the selected date");
        }

        ShiftEntity shift = new ShiftEntity();
        shift.setStore(store);
        shift.setUser(employee);
        shift.setShiftName(normalizedShiftName);
        shift.setShiftDate(request.getShiftDate());

        return mapToResponse(shiftRepository.save(shift));
    }

    @Override
    public ShiftResponse updateShift(Long id, Long storeId, ShiftCreateRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        ensureStoreScope(actor, storeId);
        ShiftEntity shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift assignment not found"));
        ensureStoreScope(actor, shift.getStore().getId());
        if (!shift.getStore().getId().equals(storeId)) {
            throw new org.springframework.security.access.AccessDeniedException("Shift store access denied");
        }
        UserEntity employee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee user not found"));
        boolean assignedToStore = storeUserRepository.findByUserId(employee.getId()).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .anyMatch(su -> su.getStore().getId().equals(storeId));
        if (!assignedToStore && !isAdmin(actor)) {
            throw new BadRequestException("Employee is not assigned to this store");
        }
        String normalizedShiftName = request.getShiftName().trim().toUpperCase();
        if (!List.of("MORNING", "AFTERNOON", "NIGHT").contains(normalizedShiftName)) {
            throw new BadRequestException("Shift name must be MORNING, AFTERNOON, or NIGHT");
        }
        if (shiftRepository.existsByStoreIdAndUserIdAndShiftDateAndShiftName(
                storeId, employee.getId(), request.getShiftDate(), normalizedShiftName)
                && !(shift.getUser().getId().equals(employee.getId())
                && shift.getShiftDate().equals(request.getShiftDate())
                && shift.getShiftName().equals(normalizedShiftName))) {
            throw new ConflictException("Employee is already assigned to this shift on the selected date");
        }
        shift.setUser(employee);
        shift.setShiftName(normalizedShiftName);
        shift.setShiftDate(request.getShiftDate());
        return mapToResponse(shiftRepository.save(shift));
    }

    @Override
    public void removeShift(Long id, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        ShiftEntity shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift assignment not found"));

        ensureStoreScope(actor, shift.getStore().getId());
        shiftRepository.delete(shift);
    }

    private UserEntity getActor(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isAdmin(UserEntity user) {
        return user.getRole() != null && "ADMIN".equalsIgnoreCase(user.getRole().getName());
    }

    private void ensureStoreScope(UserEntity actor, Long storeId) {
        if (isAdmin(actor)) {
            return;
        }
        boolean allowed = storeUserRepository.findByUserId(actor.getId()).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .anyMatch(su -> su.getStore().getId().equals(storeId));
        if (!allowed) {
            throw new AccessDeniedException("Store access denied");
        }
    }

    private ShiftResponse mapToResponse(ShiftEntity entity) {
        return ShiftResponse.builder()
                .id(entity.getId())
                .storeId(entity.getStore().getId())
                .userId(entity.getUser().getId())
                .userFullName(entity.getUser().getFullName())
                .userEmail(entity.getUser().getEmail())
                .shiftName(entity.getShiftName())
                .shiftDate(entity.getShiftDate())
                .build();
    }
}
