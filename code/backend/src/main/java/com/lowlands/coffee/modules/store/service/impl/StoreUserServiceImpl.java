package com.lowlands.coffee.modules.store.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ConflictException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.store.dto.request.StoreUserCreateRequest;
import com.lowlands.coffee.modules.store.dto.request.StoreUserUpdateRequest;
import com.lowlands.coffee.modules.store.dto.response.StoreUserResponse;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.store.service.StoreUserService;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class StoreUserServiceImpl implements StoreUserService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";
    private static final Set<String> ALLOWED_ROLES = Set.of("MANAGER", "STAFF");
    private static final Set<String> ALLOWED_POSITIONS = Set.of("MANAGER", "CASHIER", "BARISTA", "STAFF");

    private final StoreUserRepository storeUserRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreUserServiceImpl(
            StoreUserRepository storeUserRepository,
            StoreRepository storeRepository,
            UserRepository userRepository
    ) {
        this.storeUserRepository = storeUserRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoreUserResponse> findAll() {
        return storeUserRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoreUserResponse> findByStore(Long storeId) {
        return storeUserRepository.findByStoreId(storeId).stream().map(this::toResponse).toList();
    }

    @Override
    public StoreUserResponse create(StoreUserCreateRequest request) {
        UserEntity user = getUser(request.getUserId());
        StoreEntity store = getStore(request.getStoreId());
        validateAssignableUser(user);
        String position = normalizePosition(request.getPosition());
        String status = normalizeStatus(request.getStatus() == null ? ACTIVE : request.getStatus());
        boolean activeDuplicate = storeUserRepository.findByUserId(user.getId()).stream()
                .anyMatch(storeUser -> storeUser.getStore().getId().equals(store.getId())
                        && ACTIVE.equalsIgnoreCase(storeUser.getStatus()));
        if (ACTIVE.equals(status) && activeDuplicate) {
            throw new ConflictException("User already has an active assignment for this store");
        }

        StoreUserEntity entity = new StoreUserEntity();
        entity.setUser(user);
        entity.setStore(store);
        entity.setPosition(position);
        entity.setStatus(status);
        return toResponse(storeUserRepository.save(entity));
    }

    @Override
    public StoreUserResponse update(Long id, StoreUserUpdateRequest request) {
        StoreUserEntity entity = getStoreUser(id);
        UserEntity user = getUser(request.getUserId());
        StoreEntity store = getStore(request.getStoreId());
        validateAssignableUser(user);
        String status = normalizeStatus(request.getStatus());
        boolean activeDuplicate = storeUserRepository.findByUserId(user.getId()).stream()
                .anyMatch(storeUser -> !storeUser.getId().equals(id)
                        && storeUser.getStore().getId().equals(store.getId())
                        && ACTIVE.equalsIgnoreCase(storeUser.getStatus()));
        if (ACTIVE.equals(status) && activeDuplicate) {
            throw new ConflictException("User already has an active assignment for this store");
        }
        entity.setUser(user);
        entity.setStore(store);
        entity.setPosition(normalizePosition(request.getPosition()));
        entity.setStatus(status);
        return toResponse(storeUserRepository.save(entity));
    }

    @Override
    public StoreUserResponse deactivate(Long id) {
        StoreUserEntity entity = getStoreUser(id);
        entity.setStatus(INACTIVE);
        return toResponse(storeUserRepository.save(entity));
    }

    private StoreUserEntity getStoreUser(Long id) {
        return storeUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store user assignment not found"));
    }

    private UserEntity getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private StoreEntity getStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));
    }

    private void validateAssignableUser(UserEntity user) {
        String roleName = user.getRole() == null ? null : user.getRole().getName();
        if (roleName == null || !ALLOWED_ROLES.contains(roleName.toUpperCase())) {
            throw new BadRequestException("Only MANAGER or STAFF users can be assigned to a store");
        }
    }

    private String normalizePosition(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase();
        if (!ALLOWED_POSITIONS.contains(normalized)) {
            throw new BadRequestException("Position must be MANAGER, CASHIER, BARISTA, or STAFF");
        }
        return normalized;
    }

    private String normalizeStatus(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase();
        if (!ACTIVE.equals(normalized) && !INACTIVE.equals(normalized)) {
            throw new BadRequestException("Status must be active or inactive");
        }
        return normalized;
    }

    private StoreUserResponse toResponse(StoreUserEntity entity) {
        UserEntity user = entity.getUser();
        StoreEntity store = entity.getStore();
        return StoreUserResponse.builder()
                .id(entity.getId())
                .userId(user.getId())
                .employeeCode(user.getEmployee() == null ? null : user.getEmployee().getEmployeeCode())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .storeId(store.getId())
                .storeName(store.getName())
                .position(entity.getPosition())
                .status(entity.getStatus())
                .build();
    }
}
