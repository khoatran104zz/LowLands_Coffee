package com.lowlands.coffee.modules.store.repository;

import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreUserRepository extends JpaRepository<StoreUserEntity, Long> {

    List<StoreUserEntity> findByStoreId(Long storeId);

    List<StoreUserEntity> findByUserId(Long userId);
}
