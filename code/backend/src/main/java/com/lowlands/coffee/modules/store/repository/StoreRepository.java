package com.lowlands.coffee.modules.store.repository;

import com.lowlands.coffee.modules.store.entity.StoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<StoreEntity, Long> {
}
