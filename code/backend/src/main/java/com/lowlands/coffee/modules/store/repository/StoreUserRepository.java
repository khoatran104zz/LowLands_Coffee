package com.lowlands.coffee.modules.store.repository;

import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreUserRepository extends JpaRepository<StoreUserEntity, Long> {

    @EntityGraph(attributePaths = {"store", "user", "user.role", "user.employee"})
    List<StoreUserEntity> findByStoreId(Long storeId);

    List<StoreUserEntity> findByUserId(Long userId);

    boolean existsByUserIdAndStoreId(Long userId, Long storeId);

    @Override
    @EntityGraph(attributePaths = {"store", "user", "user.role", "user.employee"})
    Optional<StoreUserEntity> findById(Long id);
}
