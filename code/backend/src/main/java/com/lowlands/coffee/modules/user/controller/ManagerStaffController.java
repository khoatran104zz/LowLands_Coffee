package com.lowlands.coffee.modules.user.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import com.lowlands.coffee.modules.user.dto.response.ManagerStaffResponse;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/manager/staff")
public class ManagerStaffController {

    private static final String ACTIVE = "active";
    private static final Set<String> ALLOWED_ROLES = Set.of("MANAGER", "STAFF");

    private final StoreUserRepository storeUserRepository;
    private final ManagerStoreContextService managerStoreContextService;

    public ManagerStaffController(
            StoreUserRepository storeUserRepository,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.storeUserRepository = storeUserRepository;
        this.managerStoreContextService = managerStoreContextService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ApiResponse<List<ManagerStaffResponse>> findAll() {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        return ApiResponse.success(storeUserRepository.findByStoreId(storeId).stream()
                .filter(storeUser -> ACTIVE.equalsIgnoreCase(storeUser.getStatus()))
                .filter(this::isManagerOrStaff)
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ApiResponse<ManagerStaffResponse> findById(@PathVariable Long id) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        StoreUserEntity assignment = storeUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff assignment not found"));
        if (!assignment.getStore().getId().equals(storeId)) {
            throw new AccessDeniedException("Staff store access denied");
        }
        if (!isManagerOrStaff(assignment)) {
            throw new ResourceNotFoundException("Staff assignment not found");
        }
        return ApiResponse.success(toResponse(assignment));
    }

    private boolean isManagerOrStaff(StoreUserEntity assignment) {
        UserEntity user = assignment.getUser();
        String roleName = user.getRole() == null ? null : user.getRole().getName();
        return roleName != null && ALLOWED_ROLES.contains(roleName.toUpperCase());
    }

    private ManagerStaffResponse toResponse(StoreUserEntity assignment) {
        UserEntity user = assignment.getUser();
        return ManagerStaffResponse.builder()
                .userId(user.getId())
                .storeUserId(assignment.getId())
                .employeeCode(user.getEmployee() == null ? null : user.getEmployee().getEmployeeCode())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .position(assignment.getPosition())
                .status(assignment.getStatus())
                .storeId(assignment.getStore().getId())
                .storeName(assignment.getStore().getName())
                .build();
    }
}
