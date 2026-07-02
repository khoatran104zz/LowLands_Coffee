package com.lowlands.coffee.modules.store.service;

import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.user.entity.UserEntity;

public interface ManagerStoreContextService {

    Long getCurrentManagerStoreId();

    StoreEntity getCurrentManagerStore();

    void validateManagerCanAccessStore(Long storeId);

    UserEntity getCurrentUser();
}
