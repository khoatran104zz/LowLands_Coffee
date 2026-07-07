package com.lowlands.coffee.modules.dashboard.service.impl;

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
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
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
    private final ManagerStoreContextService managerStoreContextService;

    public DashboardServiceImpl(
            UserRepository userRepository,
            StoreRepository storeRepository,
            ProductRepository productRepository,
            StoreUserRepository storeUserRepository,
            StockMovementRepository stockMovementRepository,
            OrderRepository orderRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.storeUserRepository = storeUserRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.orderRepository = orderRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.managerStoreContextService = managerStoreContextService;
    }

    @Override
    public AdminDashboardSummaryResponse getAdminSummary(Long storeId) {
        TimeWindows windows = currentTimeWindows();
        return AdminDashboardSummaryResponse.builder()
                .totalUsers(userRepository.count())
                .totalStores(storeId == null ? storeRepository.count() : 1)
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.countByOptionalStoreId(storeId))
                .totalRevenue(orderRepository.sumPaidCompletedRevenue(storeId))
                .todayRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.todayStart(), windows.todayEnd()))
                .weekRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.weekStart(), windows.todayEnd()))
                .monthRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.monthStart(), windows.todayEnd()))
                .yearRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.yearStart(), windows.todayEnd()))
                .completedOrders(orderRepository.countByStatusAndOptionalStoreId("COMPLETED", storeId))
                .cancelledOrders(orderRepository.countByStatusAndOptionalStoreId("CANCELLED", storeId))
                .lowStockCount(countLowStockItems(storeId))
                .paymentBreakdown(orderRepository.findPaymentBreakdownForPaidCompletedOrders(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd()
                ))
                .topProducts(orderRepository.findTopProductsByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .topCategories(orderRepository.findTopCategoriesByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .storeRanking(orderRepository.findStoreRankingByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 10)
                ))
                .build();
    }

    @Override
    public ManagerDashboardSummaryResponse getManagerSummary(String managerEmail) {
        StoreEntity store = managerStoreContextService.getCurrentManagerStore();
        Long storeId = store.getId();

        long inventoryItems = stockMovementRepository.countDistinctIngredientsByStoreId(storeId);
        long lowStockItems = countLowStockItems(storeId);
        TimeWindows windows = currentTimeWindows();

        long todayOrders = orderRepository.countByStoreIdAndCreatedAtBetween(storeId, windows.todayStart(), windows.todayEnd());
        BigDecimal todayRevenue = orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.todayStart(), windows.todayEnd());
        long preparingOrders = orderRepository.countByStoreIdAndStatus(storeId, "PREPARING");
        long completedOrders = orderRepository.countByStoreIdAndStatusAndCreatedAtBetween(
                storeId,
                "COMPLETED",
                windows.todayStart(),
                windows.todayEnd()
        );

        long activeStaff = storeUserRepository.findByStoreId(storeId).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .filter(su -> {
                    String role = su.getUser().getRole().getName();
                    return "STAFF".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
                })
                .count();

        long todayGoodsReceipts = goodsReceiptRepository.countByStoreIdAndCreatedAtBetween(
                storeId,
                windows.todayStart(),
                windows.todayEnd()
        );
        long todayStockAdjustments = stockMovementRepository.countByStoreIdAndMovementTypeAndCreatedAtBetween(
                storeId,
                "ADJUSTMENT",
                windows.todayStart(),
                windows.todayEnd()
        );

        BigDecimal yesterdayRevenue = orderRepository.sumPaidCompletedRevenueBetween(
                storeId,
                windows.yesterdayStart(),
                windows.yesterdayEnd()
        );
        BigDecimal thisWeekRevenue = orderRepository.sumPaidCompletedRevenueBetween(
                storeId,
                windows.weekStart(),
                windows.todayEnd()
        );
        BigDecimal thisMonthRevenue = orderRepository.sumPaidCompletedRevenueBetween(
                storeId,
                windows.monthStart(),
                windows.todayEnd()
        );

        return ManagerDashboardSummaryResponse.builder()
                .storeId(storeId)
                .storeName(store.getName())
                .totalProducts(productRepository.count())
                .inventoryItems(inventoryItems)
                .lowStockItems(lowStockItems)
                .lowStockCount(lowStockItems)
                .inventoryAlerts(lowStockItems)
                .totalOrders(orderRepository.countByStoreId(storeId))
                .totalRevenue(orderRepository.sumPaidCompletedRevenue(storeId))
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
                .topProducts(orderRepository.findTopProductsByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .build();
    }

    private long countLowStockItems(Long storeId) {
        return stockMovementRepository.calculateAllStockBalances().stream()
                .filter(balance -> storeId == null || storeId.equals(balance[0]))
                .filter(balance -> {
                    BigDecimal minStock = (BigDecimal) balance[6];
                    BigDecimal currentStock = (BigDecimal) balance[7];
                    return currentStock.compareTo(minStock) <= 0;
                })
                .count();
    }

    private TimeWindows currentTimeWindows() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime todayEnd = now.with(LocalTime.MAX);
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime yesterdayEnd = todayStart;
        LocalDateTime weekStart = todayStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime monthStart = todayStart.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime yearStart = LocalDate.of(todayStart.getYear(), 1, 1).atStartOfDay();
        return new TimeWindows(
                todayStart,
                todayEnd,
                yesterdayStart,
                yesterdayEnd,
                weekStart,
                monthStart,
                yearStart
        );
    }

    private record TimeWindows(
            LocalDateTime todayStart,
            LocalDateTime todayEnd,
            LocalDateTime yesterdayStart,
            LocalDateTime yesterdayEnd,
            LocalDateTime weekStart,
            LocalDateTime monthStart,
            LocalDateTime yearStart
    ) {
    }
}
