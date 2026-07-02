package com.lowlands.coffee.modules.dashboard.service.impl;

import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.dashboard.dto.response.AdminDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.ManagerDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.service.DashboardService;
import com.lowlands.coffee.modules.inventory.repository.GoodsReceiptRepository;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final StoreUserRepository storeUserRepository;
    private final StockMovementRepository stockMovementRepository;
    private final OrderRepository orderRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;

    public DashboardServiceImpl(
            UserRepository userRepository,
            StoreRepository storeRepository,
            ProductRepository productRepository,
            StoreUserRepository storeUserRepository,
            StockMovementRepository stockMovementRepository,
            OrderRepository orderRepository,
            GoodsReceiptRepository goodsReceiptRepository
    ) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.storeUserRepository = storeUserRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.orderRepository = orderRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
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
        StoreEntity store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager store not found"));

        long inventoryItems = stockMovementRepository.countDistinctIngredientsByStoreId(storeId);
        long lowStockItems = stockMovementRepository.calculateAllStockBalances().stream()
                .filter(balance -> storeId.equals(balance[0]))
                .filter(balance -> {
                    BigDecimal minStock = (BigDecimal) balance[6];
                    BigDecimal currentStock = (BigDecimal) balance[7];
                    return currentStock.compareTo(minStock) <= 0;
                })
                .count();

        // Calculate time periods for today, yesterday, this week, this month
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime todayEnd = now.with(LocalTime.MAX);

        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime yesterdayEnd = todayEnd.minusDays(1);

        LocalDateTime thisWeekStart = todayStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime thisMonthStart = todayStart.with(TemporalAdjusters.firstDayOfMonth());

        long todayOrders = orderRepository.countByStoreIdAndCreatedAtBetween(storeId, todayStart, todayEnd);
        BigDecimal todayRevenue = orderRepository.sumRevenueByStoreAndStatusAndCreatedAtBetween(storeId, "COMPLETED", todayStart, todayEnd);
        long preparingOrders = orderRepository.countByStoreIdAndStatus(storeId, "PREPARING");
        long completedOrders = orderRepository.countByStoreIdAndStatusAndCreatedAtBetween(storeId, "COMPLETED", todayStart, todayEnd);

        long activeStaff = storeUserRepository.findByStoreId(storeId).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .filter(su -> {
                    String role = su.getUser().getRole().getName();
                    return "STAFF".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
                })
                .count();

        long todayGoodsReceipts = goodsReceiptRepository.countByStoreIdAndCreatedAtBetween(storeId, todayStart, todayEnd);
        long todayStockAdjustments = stockMovementRepository.countByStoreIdAndMovementTypeAndCreatedAtBetween(
                storeId,
                "ADJUSTMENT",
                todayStart,
                todayEnd
        );

        BigDecimal yesterdayRevenue = orderRepository.sumRevenueByStoreAndStatusAndCreatedAtBetween(storeId, "COMPLETED", yesterdayStart, yesterdayEnd);
        BigDecimal thisWeekRevenue = orderRepository.sumRevenueByStoreAndStatusAndCreatedAtBetween(storeId, "COMPLETED", thisWeekStart, todayEnd);
        BigDecimal thisMonthRevenue = orderRepository.sumRevenueByStoreAndStatusAndCreatedAtBetween(storeId, "COMPLETED", thisMonthStart, todayEnd);

        return ManagerDashboardSummaryResponse.builder()
                .storeId(storeId)
                .storeName(store.getName())
                .totalProducts(productRepository.count())
                .inventoryItems(inventoryItems)
                .lowStockItems(lowStockItems)
                .lowStockCount(lowStockItems)
                .inventoryAlerts(lowStockItems)
                .totalOrders(orderRepository.countByStoreId(storeId))
                .totalRevenue(orderRepository.sumRevenueByStoreAndStatus(storeId, "COMPLETED"))
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue)
                .preparingOrders(preparingOrders)
                .completedOrders(completedOrders)
                .activeStaff(activeStaff)
                .staffCount(activeStaff)
                .todayGoodsReceipts(todayGoodsReceipts)
                .todayStockAdjustments(todayStockAdjustments)
                .yesterdayRevenue(yesterdayRevenue)
                .thisWeekRevenue(thisWeekRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .build();
    }
}
