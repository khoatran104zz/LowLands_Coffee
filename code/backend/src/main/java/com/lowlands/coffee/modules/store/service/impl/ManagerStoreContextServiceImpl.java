package com.lowlands.coffee.modules.store.service.impl;

import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ManagerStoreContextServiceImpl implements ManagerStoreContextService {

    private static final String MANAGER = "MANAGER";
    private static final String ACTIVE = "active";

    private final UserRepository userRepository;
    private final StoreUserRepository storeUserRepository;

    public ManagerStoreContextServiceImpl(
            UserRepository userRepository,
            StoreUserRepository storeUserRepository
    ) {
        this.userRepository = userRepository;
        this.storeUserRepository = storeUserRepository;
    }

    @Override
    public Long getCurrentManagerStoreId() {
        return getCurrentManagerStore().getId();
    }

    @Override
    public StoreEntity getCurrentManagerStore() {
        UserEntity user = getCurrentUser();
        ensureManager(user);
        return storeUserRepository.findByUserId(user.getId()).stream()
                .filter(storeUser -> ACTIVE.equalsIgnoreCase(storeUser.getStatus()))
                .map(StoreUserEntity::getStore)
                .findFirst()
                .orElseThrow(() -> new AccessDeniedException("Manager has no active store assignment"));
    }

    @Override
    public void validateManagerCanAccessStore(Long storeId) {
        if (storeId == null || !getCurrentManagerStoreId().equals(storeId)) {
            throw new AccessDeniedException("Manager cannot access this store");
        }
    }

    @Override
    public UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Authentication is required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private void ensureManager(UserEntity user) {
        String roleName = user.getRole() == null ? null : user.getRole().getName();
        if (!MANAGER.equalsIgnoreCase(roleName)) {
            throw new AccessDeniedException("Only manager can use Manager API");
        }
    }
}
