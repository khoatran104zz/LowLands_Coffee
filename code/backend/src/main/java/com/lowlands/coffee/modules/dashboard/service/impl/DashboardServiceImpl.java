package com.lowlands.coffee.modules.dashboard.service.impl;

import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.dashboard.dto.response.AdminDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.ManagerDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.service.DashboardService;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final StoreUserRepository storeUserRepository;
    private final StockMovementRepository stockMovementRepository;

    public DashboardServiceImpl(
            UserRepository userRepository,
            StoreRepository storeRepository,
            ProductRepository productRepository,
            StoreUserRepository storeUserRepository,
            StockMovementRepository stockMovementRepository
    ) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.storeUserRepository = storeUserRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Override
    public AdminDashboardSummaryResponse getAdminSummary() {
        return AdminDashboardSummaryResponse.builder()
                .totalUsers(userRepository.count())
                .totalStores(storeRepository.count())
                .totalProducts(productRepository.count())
                .totalOrders(0)
                .totalRevenue(BigDecimal.ZERO)
                .build();
    }

    @Override
    public ManagerDashboardSummaryResponse getManagerSummary(String managerEmail) {
        UserEntity manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Manager user not found"));
        Long storeId = storeUserRepository.findByUserId(manager.getId()).stream()
                .filter(storeUser -> "active".equalsIgnoreCase(storeUser.getStatus()))
                .map(StoreUserEntity::getStore)
                .map(store -> store.getId())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Manager store assignment not found"));

        long inventoryItems = stockMovementRepository.countDistinctIngredientsByStoreId(storeId);
        long lowStockItems = stockMovementRepository.calculateAllStockBalances().stream()
                .filter(balance -> storeId.equals(balance[0]))
                .filter(balance -> ((BigDecimal) balance[6]).compareTo(BigDecimal.ZERO) <= 0)
                .count();

        return ManagerDashboardSummaryResponse.builder()
                .storeId(storeId)
                .totalProducts(productRepository.count())
                .inventoryItems(inventoryItems)
                .lowStockItems(lowStockItems)
                .totalOrders(0)
                .totalRevenue(BigDecimal.ZERO)
                .build();
    }
}
